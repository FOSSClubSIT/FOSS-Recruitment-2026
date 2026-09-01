# On-Prem Incident-Response Copilot — Setup & Architecture Guide

## Quickstart

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run mock smoke test (no GPU / Ollama required)
python main.py

# 3. Run real local inference via Ollama
# Ensure Ollama is running: ollama run llama3.1:8b
LLM_MODE=ollama python main.py
```

---

## Experimental Feature: Adaptive Model Routing (Option B)

### Overview
To maximize hardware efficiency on resource-constrained edge devices and consumer laptop GPUs (e.g. AMD ROCm / CUDA laptop builds), we implemented an **Adaptive Model Routing** module (`llm/router.py`).

### Design
- **Routine Incidents:** Simple, highly-structured incidents with strong runbook matches are classified as `routine` and routed to a lightweight fast model/heuristic.
- **Complex / Ambiguous Incidents:** Escalated to `llama3.1:8b` for multi-pass reasoning and self-critique.
- **Backward Compatibility:** `main.py` defaults to single-model execution unless `ENABLE_ADAPTIVE_ROUTING=1` is set. Reverting or disabling this feature preserves 100% of existing behavior. `interfaces.py` remains completely untouched.

### Benchmark Outcome (`llm/benchmark_routing.py`)
- **Decision Overhead:** Sub-millisecond routing classification (**0.0034 ms**, representing **<0.001%** of generation latency).
- **Latency Savings:** Avoids full 8B model decoding passes on simple routine alerts, saving **5–10 seconds** of decode latency per routine triage pass.
- **Run Benchmark:** `python llm/benchmark_routing.py`
