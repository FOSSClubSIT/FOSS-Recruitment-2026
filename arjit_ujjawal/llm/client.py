"""LLM client: mock mode for GPU-free dev, ollama mode for real local inference.

Vendor-neutral by design — talks to Ollama over HTTP, so the identical code path
runs against a CUDA build (dev laptop) or a ROCm build (AMD demo box). Select
with LLM_MODE=mock|ollama; point at a remote server with OLLAMA_HOST.
"""

from __future__ import annotations

import concurrent.futures
import datetime
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

# Ensure project root is in sys.path for importing tools
_ROOT = str(Path(__file__).resolve().parents[1])
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

try:
    from tools.event_bus import emit_event
except ImportError:
    def emit_event(event: dict) -> None:
        pass

DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.1:8b")
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")

_MOCK_RESPONSES = {
    "hypothesis": (
        "[MOCK] Root-cause hypothesis: the payments-api connection pool to the "
        "primary Postgres instance is exhausted, most likely due to a slow query "
        "introduced in the latest deploy holding connections open. "
        "CONFIDENCE: 0.72"
    ),
    "critique": (
        "[MOCK] Self-critique: the pool-exhaustion hypothesis is consistent with "
        "the timeout pattern, but the evidence does not rule out a network "
        "partition. Retaining hypothesis with reduced confidence. "
        "REVISED CONFIDENCE: 0.66"
    ),
    "default": "[MOCK] Generic model output for prompt.",
}


class LLMError(RuntimeError):
    pass


class LLMClient:
    def __init__(self, mode: str | None = None, model: str = DEFAULT_MODEL, host: str = OLLAMA_HOST):
        self.mode = (mode or os.environ.get("LLM_MODE", "mock")).lower()
        self.model = model
        self.host = host.rstrip("/")
        if self.mode not in ("mock", "ollama"):
            raise LLMError(f"unknown LLM_MODE {self.mode!r} (expected 'mock' or 'ollama')")

    def generate(self, prompt: str, system: str | None = None,
                 temperature: float = 0.2, max_tokens: int = 512) -> dict:
        """Returns {"text", "mode", "model", and (ollama only) token/timing stats}."""
        t0 = time.perf_counter()
        if self.mode == "mock":
            res = self._generate_mock(prompt)
        else:
            res = self._generate_ollama(prompt, system, temperature, max_tokens)
        t1 = time.perf_counter()
        elapsed = t1 - t0

        tokens = res.get("eval_count", 0) or len(res.get("text", "").split())
        latency_s = (
            round(res.get("total_duration_ns", 0) / 1e9, 4)
            if res.get("total_duration_ns")
            else round(elapsed, 4)
        )
        if res.get("tokens_per_sec"):
            tokens_per_sec = round(res.get("tokens_per_sec"), 2)
        else:
            tokens_per_sec = round(tokens / elapsed, 2) if elapsed > 0 else 0.0

        try:
            emit_event({
                "ts": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "stage": "telemetry",
                "type": "telemetry",
                "payload": {
                    "tokens": tokens,
                    "latency_s": latency_s,
                    "tokens_per_sec": tokens_per_sec,
                },
                "tokens": tokens,
                "latency_s": latency_s,
                "tokens_per_sec": tokens_per_sec,
                "mode": self.mode,
                "model": self.model,
            })
        except Exception:
            pass

        return res

    def chat(self, prompt: str, system: str | None = None,
             temperature: float = 0.2, max_tokens: int = 512) -> dict:
        """Alias for generate() to maintain complete interface compatibility."""
        return self.generate(prompt, system=system, temperature=temperature, max_tokens=max_tokens)

    def _generate_mock(self, prompt: str) -> dict:
        lower = prompt.lower()
        if any(w in lower for w in ("critique", "disprove", "skeptical", "counter-evidence")):
            text = _MOCK_RESPONSES["critique"]
        elif "hypothesis" in lower or "root cause" in lower:
            text = _MOCK_RESPONSES["hypothesis"]
        else:
            text = _MOCK_RESPONSES["default"]
        return {"text": text, "mode": "mock", "model": "mock"}

    def _generate_ollama(self, prompt: str, system: str | None,
                         temperature: float, max_tokens: int) -> dict:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature, "num_predict": max_tokens},
        }
        if system:
            payload["system"] = system
        req = urllib.request.Request(
            f"{self.host}/api/generate",
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
        )
        try:
            # generous timeout: first call after start pays model-load cost
            with urllib.request.urlopen(req, timeout=600) as resp:
                body = json.loads(resp.read())
        except urllib.error.URLError as e:
            raise LLMError(
                f"cannot reach Ollama at {self.host} — is it running? "
                f"(scripts/start_model.sh {self.model}): {e}"
            ) from e
        eval_count = body.get("eval_count", 0)
        eval_ns = body.get("eval_duration", 0)
        return {
            "text": body.get("response", ""),
            "mode": "ollama",
            "model": self.model,
            "eval_count": eval_count,
            "eval_duration_ns": eval_ns,
            "prompt_eval_count": body.get("prompt_eval_count", 0),
            "prompt_eval_duration_ns": body.get("prompt_eval_duration", 0),
            "load_duration_ns": body.get("load_duration", 0),
            "total_duration_ns": body.get("total_duration", 0),
            "tokens_per_sec": (eval_count / (eval_ns / 1e9)) if eval_ns else 0.0,
        }

    # --- Batching (additive, does not alter generate()) -------------------

    def generate_batch(
        self,
        prompts: list[str],
        system: str | None = None,
        temperature: float = 0.2,
        max_tokens: int = 512,
    ) -> dict:
        """Run multiple prompts concurrently and return timing comparison.

        Returns {"results": [dict, ...], "wall_clock_s": float,
                 "sequential_estimate_s": float, "speedup": float}.

        Ollama serialises GPU work, so true parallelism is limited, but
        overlapping network + prompt-eval with prior decode still helps.
        """
        t0 = time.perf_counter()
        with concurrent.futures.ThreadPoolExecutor(max_workers=len(prompts)) as pool:
            futures = [
                pool.submit(self.generate, p, system, temperature, max_tokens)
                for p in prompts
            ]
            results = [f.result() for f in futures]
        wall = time.perf_counter() - t0

        # Estimate sequential time from individual total_duration_ns
        seq_ns = sum(r.get("total_duration_ns", 0) for r in results)
        seq_s = seq_ns / 1e9 if seq_ns else wall
        speedup = seq_s / wall if wall > 0 else 1.0

        return {
            "results": results,
            "wall_clock_s": round(wall, 3),
            "sequential_estimate_s": round(seq_s, 3),
            "speedup": round(speedup, 2),
        }
