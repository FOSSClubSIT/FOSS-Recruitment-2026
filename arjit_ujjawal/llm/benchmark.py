"""Benchmark local inference throughput and append results to benchmark_results.jsonl.

Usage: LLM_MODE=ollama python llm/benchmark.py --label fp16 --model llama3.1:8b

Uses Ollama's own eval_count/eval_duration metadata for true decode tokens/sec,
so numbers are comparable across CUDA and ROCm hosts.
"""

import argparse
import datetime
import json
import platform
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from llm.client import LLMClient  # noqa: E402

RESULTS_FILE = Path(__file__).resolve().parents[1] / "benchmark_results.jsonl"

BENCH_PROMPT = (
    "You are an on-call SRE copilot. An alert fired: payments-api p99 latency "
    "is 4.2s (baseline 180ms), error rate 11%, DB connection pool at 100% "
    "utilization, deploy 27 minutes ago. Write a structured root-cause "
    "hypothesis with supporting evidence, then list the three next diagnostic "
    "steps in priority order with reasoning for each."
)


def detect_gpu() -> str:
    """Best-effort GPU name: try rocm-smi/rocminfo first (AMD box), then nvidia-smi, then WMI."""
    probes = [
        ["rocminfo"],
        ["nvidia-smi", "--query-gpu=name", "--format=csv,noheader"],
        ["powershell", "-NoProfile", "-Command",
         "(Get-CimInstance Win32_VideoController | Select-Object -ExpandProperty Name) -join '; '"],
    ]
    for cmd in probes:
        try:
            out = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
            if out.returncode == 0 and out.stdout.strip():
                if cmd[0] == "rocminfo":
                    names = [ln.split(":", 1)[1].strip() for ln in out.stdout.splitlines()
                             if "Marketing Name" in ln]
                    gpus = [n for n in names if "gfx" not in n.lower() and n]
                    if gpus:
                        return "; ".join(dict.fromkeys(gpus))
                    continue
                return out.stdout.strip().splitlines()[0] if cmd[0] == "nvidia-smi" else out.stdout.strip()
        except (OSError, subprocess.TimeoutExpired):
            continue
    return "unknown"


def _detect_quantization(model_tag: str) -> str:
    """Detect quantization from model tag or ollama show."""
    tag_lower = model_tag.lower()
    for q in ("fp16", "fp32", "q8_0", "q6_k", "q5_k_m", "q5_k_s",
              "q4_k_m", "q4_k_s", "q4_0", "q3_k_m", "q2_k"):
        if q in tag_lower:
            return q.upper()
    # Default tag — query ollama show for actual quantization
    try:
        out = subprocess.run(["ollama", "show", model_tag],
                             capture_output=True, text=True, timeout=10)
        for line in out.stdout.splitlines():
            if "quantization" in line.lower():
                return line.split()[-1].strip()
    except (OSError, subprocess.TimeoutExpired):
        pass
    return "unknown"


def run_once(client: LLMClient, max_tokens: int) -> dict:
    return client.generate(BENCH_PROMPT, temperature=0.2, max_tokens=max_tokens)


def main() -> None:
    ap = argparse.ArgumentParser(description="Benchmark Ollama inference throughput")
    ap.add_argument("--label", required=True, help="run label, e.g. fp16 / q4_K_M / q8_0")
    ap.add_argument("--model", required=True, help="Ollama model tag")
    ap.add_argument("--max-tokens", type=int, default=400)
    args = ap.parse_args()

    client = LLMClient(mode="ollama", model=args.model)
    print(f"[benchmark] label={args.label} model={args.model} host={client.host}")

    r = run_once(client, args.max_tokens)
    tok_s = r["tokens_per_sec"]
    prompt_ns = r["prompt_eval_duration_ns"]
    prompt_tok_s = (r["prompt_eval_count"] / (prompt_ns / 1e9)) if prompt_ns else 0.0

    entry = {
        "ts": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "label": args.label,
        "model": args.model,
        "quantization_actual": _detect_quantization(args.model),
        "eval_count": r["eval_count"],
        "tokens_per_sec": round(tok_s, 2),
        "prompt_tokens_per_sec": round(prompt_tok_s, 2),
        "load_duration_s": round(r["load_duration_ns"] / 1e9, 3),
        "total_duration_s": round(r["total_duration_ns"] / 1e9, 3),
        "gpu": detect_gpu(),
        "host_os": platform.platform(),
    }
    with RESULTS_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

    print(f"[benchmark] decode: {entry['tokens_per_sec']} tok/s "
          f"({entry['eval_count']} tokens), prompt eval: {entry['prompt_tokens_per_sec']} tok/s, "
          f"load: {entry['load_duration_s']}s, total: {entry['total_duration_s']}s")
    print(f"[benchmark] gpu: {entry['gpu']}")
    print(f"[benchmark] appended to {RESULTS_FILE}")


if __name__ == "__main__":
    main()
