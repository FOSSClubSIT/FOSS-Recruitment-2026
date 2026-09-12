"""End-to-end smoke test: run the demo incident through the full agent pipeline.

Usage:
  python main.py                 # mock LLM, no GPU needed
  LLM_MODE=ollama python main.py # real local inference via Ollama
"""

import os

from orchestrator.agent import IncidentAgent

DEMO_INCIDENT = {
    "id": "demo-001",
    "service": "payments-api",
    "title": "payments-api p99 latency spike and connection timeouts",
    "description": (
        "Alerts fired at 14:02 UTC: payments-api p99 latency 4.2s (baseline "
        "180ms), error rate 11%, Postgres connection pool utilization 100%, "
        "pg_stat_activity shows 40+ queries in 'idle in transaction'. A deploy "
        "of payments-api went out 27 minutes before the alert."
    ),
}


def main() -> None:
    mode = os.environ.get("LLM_MODE", "mock")
    print(f"=== incident-copilot smoke test (LLM_MODE={mode}) ===\n")
    print(f"INCIDENT: {DEMO_INCIDENT['title']}\n{DEMO_INCIDENT['description']}\n")

    agent = IncidentAgent()
    record = agent.handle_incident(DEMO_INCIDENT)

    print("--- HYPOTHESIS " + "-" * 50)
    print(record["hypothesis"])
    print("\n--- SELF-CRITIQUE " + "-" * 47)
    print(record["critique"])
    print("\n--- ACTION " + "-" * 54)
    print(f"type:   {record['action']['type']}")
    print(f"params: {record['action']['params']}")
    print(f"result: {record['action']['result']}")
    print(f"\nfinal confidence: {record['confidence']:.2f}")
    print("memory write-back: done (data/memory_store.jsonl)")
    print("\n=== pipeline completed successfully ===")


if __name__ == "__main__":
    main()
