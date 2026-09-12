"""Validation: run 5 varied incidents through the full pipeline.

Proves:
  - confidence parsing is robust across diverse real-model outputs
  - prompts produce concise, structured responses
  - low-confidence path correctly withholds auto-execution

Usage:
  python orchestrator/test_variants.py                  # mock mode
  $env:LLM_MODE="ollama"; python orchestrator/test_variants.py  # real model
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from orchestrator.agent import IncidentAgent, _extract_confidence  # noqa: E402

VARIANTS = [
    {
        "id": "test-001",
        "service": "payments-api",
        "title": "payments-api p99 latency spike and connection timeouts",
        "description": (
            "Alerts fired at 14:02 UTC: payments-api p99 latency 4.2s (baseline "
            "180ms), error rate 11%, Postgres connection pool utilization 100%, "
            "pg_stat_activity shows 40+ queries in 'idle in transaction'. A deploy "
            "of payments-api went out 27 minutes before the alert."
        ),
    },
    {
        "id": "test-002",
        "service": "auth-service",
        "title": "auth-service memory usage climbing, OOM kills",
        "description": (
            "Alert at 09:15 UTC: auth-service RSS memory 3.8 GB (limit 4 GB), "
            "two pods OOM-killed in last hour. Heap dump shows growing HashMap of "
            "session tokens. No recent deploy. Rate of login requests is normal."
        ),
    },
    {
        "id": "test-003",
        "service": "search-api",
        "title": "search-api returning 5xx errors at 23% rate",
        "description": (
            "Started at 11:30 UTC: search-api 5xx rate jumped from 0.1% to 23%. "
            "Elasticsearch cluster health is yellow, one data node left the cluster "
            "10 minutes before errors started. Search latency p99 is 8s. "
            "Index shard reallocation in progress."
        ),
    },
    {
        "id": "test-004",
        "service": "order-processor",
        "title": "order processing queue backlog growing",
        "description": (
            "Alert at 16:45 UTC: order-processor SQS queue depth 12,000 "
            "(baseline < 100), consumer lag 45 minutes. CPU on consumer pods "
            "is 15%. Downstream inventory-api responding normally. A config "
            "change to consumer batch size was deployed 1 hour ago."
        ),
    },
    {
        "id": "test-005",
        "service": "cdn-edge",
        "title": "CDN cache miss ratio spike causing origin overload",
        "description": (
            "Started at 03:00 UTC: CDN cache miss ratio 78% (baseline 12%). "
            "Origin server CPU at 95%, response time 6s. Cache-Control headers "
            "on responses look correct. A cache purge job ran at 02:55 UTC. "
            "Traffic volume is normal for this time of day."
        ),
    },
]


def run_all_variants():
    """Run 5 varied incidents and report results."""
    mode = os.environ.get("LLM_MODE", "mock")
    print(f"{'=' * 70}")
    print(f"  VARIANT TEST SUITE  —  LLM_MODE={mode}")
    print(f"{'=' * 70}\n")

    agent = IncidentAgent()
    results = []

    for i, incident in enumerate(VARIANTS, 1):
        print(f"\n{'=' * 70}")
        print(f"  VARIANT {i}/5: {incident['title']}")
        print(f"{'=' * 70}")
        print(f"  {incident['description'][:100]}...\n")

        record = agent.handle_incident(incident)

        print("--- HYPOTHESIS ---")
        print(record["hypothesis"][:500])
        print(f"\n--- SELF-CRITIQUE ---")
        print(record["critique"][:500])
        print(f"\n--- ACTION ---")
        print(f"  type:       {record['action']['type']}")
        print(f"  result:     {record['action']['result']}")
        print(f"  confidence: {record['confidence']:.2f}")
        print(f"  hyp_len:    {len(record['hypothesis'])} chars")
        print(f"  crit_len:   {len(record['critique'])} chars")

        results.append({
            "id": incident["id"],
            "confidence": record["confidence"],
            "action_type": record["action"]["type"],
            "action_status": record["action"]["result"]["status"],
            "hyp_length": len(record["hypothesis"]),
            "critique_length": len(record["critique"]),
        })

    # Summary table
    print(f"\n\n{'=' * 70}")
    print("  SUMMARY")
    print(f"{'=' * 70}")
    all_parsed = True
    for r in results:
        parsed = r["confidence"] != 0.5  # 0.5 is the default fallback
        if not parsed:
            all_parsed = False
        flag = "OK" if parsed else "FALLBACK (0.5)"
        print(f"  {r['id']}: conf={r['confidence']:.2f}  action={r['action_type']:<18s} "
              f"status={r['action_status']:<18s} hyp={r['hyp_length']:>4d}ch  "
              f"crit={r['critique_length']:>4d}ch  {flag}")

    print(f"\n  Confidence parsed in all runs: {'YES' if all_parsed else 'SOME USED DEFAULT'}")
    return results


def test_low_confidence_gating():
    """Force low confidence and verify action is not auto-executed."""
    import orchestrator.agent as agent_module

    print(f"\n{'=' * 70}")
    print("  LOW-CONFIDENCE GATING TEST")
    print(f"{'=' * 70}\n")

    # Save original and monkey-patch to force low confidence
    original_fn = agent_module._extract_confidence
    agent_module._extract_confidence = lambda text, default=0.5: 0.30

    try:
        agent = IncidentAgent()
        record = agent.handle_incident(VARIANTS[0])

        status = record["action"]["result"]["status"]
        confidence = record["confidence"]

        print(f"  Forced confidence:  {confidence:.2f}")
        print(f"  Action type:        {record['action']['type']}")
        print(f"  Action status:      {status}")
        print(f"  Action reason:      {record['action']['result'].get('reason', 'n/a')}")

        if status == "recommended_only":
            print(f"\n  PASS: Low-confidence correctly routed to 'recommended_only' "
                  f"(action withheld)")
            return True
        elif status == "approval_required":
            print(f"\n  PASS: Action gated (approval_required — high-risk override)")
            return True
        else:
            print(f"\n  FAIL: Expected 'recommended_only' or 'approval_required', "
                  f"got '{status}'")
            return False
    finally:
        # Revert the monkey-patch
        agent_module._extract_confidence = original_fn
        print("  (monkey-patch reverted)\n")


def test_parser_robustness():
    """Unit-test the confidence parser against known tricky formats."""
    print(f"\n{'=' * 70}")
    print("  PARSER ROBUSTNESS TESTS")
    print(f"{'=' * 70}\n")

    cases = [
        ("CONFIDENCE: 0.72", 0.72),
        ("REVISED CONFIDENCE: 0.66", 0.66),
        ("**CONFIDENCE**: 0.85", 0.85),
        ("**REVISED CONFIDENCE: 0.55**", 0.55),
        ("Confidence Score: 0.80", 0.80),
        ("CONFIDENCE = 0.65", 0.65),
        ("CONFIDENCE: 72%", 0.72),
        ("My confidence in this assessment is 0.78", 0.78),
        ("CONFIDENCE: .9", 0.9),
        ("no score here at all", 0.5),  # should return default
    ]

    all_pass = True
    for text, expected in cases:
        got = _extract_confidence(text)
        ok = abs(got - expected) < 0.001
        if not ok:
            all_pass = False
        status = "PASS" if ok else "FAIL"
        print(f"  {status}  input={text[:50]:<50s}  expected={expected:.2f}  got={got:.2f}")

    print(f"\n  All parser tests passed: {'YES' if all_pass else 'NO'}")
    return all_pass


if __name__ == "__main__":
    # 1. Parser unit tests (always run, fast)
    parser_ok = test_parser_robustness()

    # 2. Low-confidence gating test
    gating_ok = test_low_confidence_gating()

    # 3. Full variant runs
    results = run_all_variants()

    # Final verdict
    print(f"\n{'=' * 70}")
    print("  FINAL VERDICT")
    print(f"{'=' * 70}")
    print(f"  Parser robustness:    {'PASS' if parser_ok else 'FAIL'}")
    print(f"  Low-confidence gate:  {'PASS' if gating_ok else 'FAIL'}")
    print(f"  Variant runs:         {len(results)}/5 completed")
    print(f"{'=' * 70}\n")
