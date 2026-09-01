"""
AI SRE System - End-to-End Pipeline Integration Sample
Demonstrates the full flow connecting semantic retrieval, action execution,
and live event bus logging for teammate orchestration agents.

Scenario:
    1. Incident Trigger: Payment API returning HTTP 504 Gateway Timeout.
    2. RAG Retrieval: Query memory for similar incidents & runbooks.
    3. Remediation: Execute automated service restart.
    4. Event Timeline: Emit progress events to feed the Streamlit dashboard.
"""

import sys
import time
import json
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from rag.retrieve import retrieve
from tools.actions import execute_action
from tools.event_bus import emit_event, get_events, clear_events


def run_pipeline_demo():
    print("\n" + "=" * 70)
    print("      AI SRE System - Teammate End-to-End Integration Demo")
    print("=" * 70)

    # Clear previous timeline events for demo
    clear_events()
    start_time = time.time()

    # Step 1: Emit Incident Detected Event
    print("\n[Step 1] 🚨 Incident Detected: Payment API HTTP 504 Timeout")
    emit_event({
        "type": "incident_detected",
        "payload": {
            "service": "payment-api",
            "severity": "P1",
            "symptom": "HTTP 504 Gateway Timeout spike on /v1/checkout endpoint"
        }
    })

    # Step 2: Start Diagnosis & Query Semantic RAG Memory
    print("\n[Step 2] 🧠 Querying RAG Knowledge Base...")
    emit_event({
        "type": "diagnosis_started",
        "payload": {"agent": "DiagnosticAgent", "query": "payment api timeout"}
    })

    t0 = time.time()
    rag_results = retrieve("payment api timeout", k=2)
    retrieval_ms = round((time.time() - t0) * 1000, 2)

    print(f"         Found {len(rag_results)} relevant memory records in {retrieval_ms} ms:")
    for res in rag_results:
        print(f"         • [{res['score']:.4f}] ID: {res['id']} ({res['document_type'].upper()}) - {res['title']}")

    emit_event({
        "type": "memory_retrieved",
        "payload": {
            "matched_incident_id": rag_results[0]["id"] if rag_results else "N/A",
            "matched_title": rag_results[0]["title"] if rag_results else "N/A",
            "retrieval_latency_ms": retrieval_ms
        }
    })

    # Step 3: Execute Remediation Action
    print("\n[Step 3] 🔧 Executing Action: restart_service (payment-api)...")
    action_res = execute_action("restart_service", {"service": "payment-api"})
    print(f"         Status: {action_res['status'].upper()} - {action_res['message']}")

    emit_event({
        "type": "action_executed",
        "payload": action_res
    })

    # Step 4: Resolve Incident
    total_duration_sec = round(time.time() - start_time, 3)
    print(f"\n[Step 4] ✅ Incident Resolved in {total_duration_sec} s!")
    emit_event({
        "type": "incident_resolved",
        "payload": {
            "service": "payment-api",
            "status": "Healthy (p99 latency 110ms)",
            "total_duration_sec": total_duration_sec
        }
    })

    # Step 5: Print Complete Live Timeline
    print("\n" + "-" * 70)
    print("                    LIVE DASHBOARD EVENT TIMELINE")
    print("-" * 70)

    events = get_events()
    for idx, ev in enumerate(events, 1):
        ts = ev["timestamp"].split("T")[1][:8]
        print(f"[{idx}] {ts} UTC | {ev['type'].upper():<20} -> {json.dumps(ev['payload'])}")

    print("=" * 70 + "\n")


if __name__ == "__main__":
    run_pipeline_demo()
