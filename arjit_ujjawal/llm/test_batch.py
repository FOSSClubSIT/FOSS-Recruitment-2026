"""Quick batch test: fire 3 prompts concurrently, compare wall-clock vs sequential."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from llm.client import LLMClient  # noqa: E402

PROMPTS = [
    ("payments-api p99 at 4.2s, error rate 11%, DB pool 100%. "
     "Hypothesis in 2 sentences. CONFIDENCE: <0-1>"),
    ("auth-service OOM kills, RSS 3.8GB/4GB limit, growing HashMap. "
     "Hypothesis in 2 sentences. CONFIDENCE: <0-1>"),
    ("search-api 5xx at 23%, ES node left cluster, shard realloc in progress. "
     "Hypothesis in 2 sentences. CONFIDENCE: <0-1>"),
]


def main():
    client = LLMClient(mode="ollama")
    print("=== BATCH TEST (3 concurrent prompts) ===\n")

    r = client.generate_batch(PROMPTS, max_tokens=150)
    print(f"Wall clock:         {r['wall_clock_s']}s")
    print(f"Sequential est:     {r['sequential_estimate_s']}s")
    print(f"Speedup:            {r['speedup']}x")
    for i, res in enumerate(r["results"]):
        print(f"  prompt {i+1}: {res['eval_count']} tok, "
              f"{res['tokens_per_sec']:.1f} tok/s")


if __name__ == "__main__":
    main()
