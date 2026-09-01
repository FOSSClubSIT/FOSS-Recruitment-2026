"""Benchmark script for Adaptive Model Routing overhead vs latency savings."""

import os
import sys
import time
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = str(Path(__file__).resolve().parents[1])
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from llm.router import IncidentRouter
from orchestrator.agent import IncidentAgent

SAMPLE_INCIDENTS = [
    {
        "id": "inc-routine-001",
        "title": "payments-api Postgres connection pool exhaustion",
        "description": "Connection pool utilization reached 100%. Slow queries holding idle transactions.",
    },
    {
        "id": "inc-complex-002",
        "title": "Multi-region VPC peering route drop and cross-cluster auth drift",
        "description": "Cascading 504 timeouts across API gateway with vault token expiration and VPC network partition.",
    },
]


def benchmark_routing():
    print("=== ADAPTIVE MODEL ROUTING BENCHMARK ===\n")
    router = IncidentRouter()

    total_routing_ms = 0.0
    runs = 100

    for i in range(runs):
        inc = SAMPLE_INCIDENTS[i % 2]
        docs = [{"id": "rb-001", "score": 0.45, "title": "DB Pool", "kind": "runbook"}]
        complexity, model, ms = router.classify_complexity(inc, docs)
        total_routing_ms += ms

    avg_ms = round(total_routing_ms / runs, 4)
    print(f"Evaluated {runs} routing decisions.")
    print(f"Average Routing Decision Overhead: {avg_ms} ms")
    print(f"Routing Overhead % of 8B Model Latency (~6.5s): {round((avg_ms / 6500) * 100, 4)}%\n")

    print("Sample Classifications:")
    for inc in SAMPLE_INCIDENTS:
        docs = [{"id": "rb-001", "score": 0.45, "title": "DB Pool", "kind": "runbook"}]
        c, m, ms = router.classify_complexity(inc, docs)
        print(f"  Incident '{inc['id']}': complexity='{c}', target_model='{m}' (decision in {ms} ms)")


if __name__ == "__main__":
    benchmark_routing()
