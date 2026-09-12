"""
Integration test for AI SRE RAG memory, mock action engine, and event bus timeline.
"""

import unittest
from rag.retrieve import retrieve
from tools.actions import execute_action
from tools.event_bus import emit_event, get_events, clear_events


class TestSystemIntegration(unittest.TestCase):

    def setUp(self):
        clear_events()

    def test_end_to_end_pipeline_integration(self):
        """Tests that retrieve(), execute_action(), and emit_event() interoperate seamlessly."""
        # 1. Emit detection event
        emit_event({
            "type": "incident_detected",
            "payload": {"service": "payment-api", "severity": "P1"}
        })

        # 2. Retrieve memory
        results = retrieve("payment api timeout", k=2)
        self.assertGreater(len(results), 0)

        emit_event({
            "type": "memory_retrieved",
            "payload": {"matched_id": results[0]["id"], "matched_title": results[0]["title"]}
        })

        # 3. Execute action
        action_res = execute_action("restart_service", {"service": "payment-api"})
        self.assertEqual(action_res["status"], "success")

        emit_event({
            "type": "action_executed",
            "payload": action_res
        })

        # 4. Verify timeline events
        events = get_events()
        self.assertEqual(len(events), 3)
        self.assertEqual(events[0]["type"], "incident_detected")
        self.assertEqual(events[1]["type"], "memory_retrieved")
        self.assertEqual(events[2]["type"], "action_executed")


if __name__ == "__main__":
    unittest.main()
