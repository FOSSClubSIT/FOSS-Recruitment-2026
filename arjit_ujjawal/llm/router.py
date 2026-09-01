"""Adaptive Model Routing: Classifies incident complexity to route routine cases

to lightweight fast models/heuristics and ambiguous cases to full 8B models.
"""

from __future__ import annotations

import time
import os
from typing import Dict, Any, Tuple


class IncidentRouter:
    """Classifies incident complexity and routes to the appropriate model."""

    def __init__(self, fast_model: str = "tinyllama", main_model: str = "llama3.1:8b"):
        self.fast_model = fast_model
        self.main_model = main_model

    def classify_complexity(self, incident: Dict[str, Any], context_docs: list[dict]) -> Tuple[str, str, float]:
        """Classifies incident complexity.

        Returns:
            Tuple of (complexity: 'routine'|'complex', selected_model: str, routing_latency_ms: float)
        """
        t0 = time.perf_counter()

        desc = (incident.get("description") or "").lower()
        title = (incident.get("title") or "").lower()
        text = f"{title} {desc}"

        # High-confidence exact runbook match signal
        top_score = context_docs[0].get("score", 0.0) if context_docs else 0.0

        # Routine indicators: direct runbook overlap, explicit service restart keywords
        routine_signals = ["connection pool", "restart_service", "oom", "memory leak", "pool utilization"]
        complex_signals = ["network partition", "firewall", "cascading", "multi-region", "unknown", "corruption"]

        has_routine_signal = any(sig in text for sig in routine_signals)
        has_complex_signal = any(sig in text for sig in complex_signals)

        if top_score >= 0.3 and has_routine_signal and not has_complex_signal:
            complexity = "routine"
            model = self.fast_model
        else:
            complexity = "complex"
            model = self.main_model

        latency_ms = round((time.perf_counter() - t0) * 1000, 3)
        return complexity, model, latency_ms
