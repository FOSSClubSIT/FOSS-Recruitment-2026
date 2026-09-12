"""
Unit tests for tools/actions.py mock execution engine.
"""

import os
import json
import unittest
from pathlib import Path
from tools.actions import execute_action, AUDIT_LOG_PATH, SUPPORTED_ACTIONS


class TestActions(unittest.TestCase):

    def test_all_supported_actions_success(self):
        """Test executing all 8 supported action types returns success and valid schema."""
        test_cases = [
            ("restart_service", {"service": "payment-api"}),
            ("rollback_deployment", {"deployment": "auth-service", "revision": "v2.0"}),
            ("restart_pod", {"pod_name": "pod-123", "namespace": "prod"}),
            ("restart_database", {"database": "pg-primary"}),
            ("scale_deployment", {"deployment": "gateway", "replicas": 5}),
            ("create_ticket", {"title": "Service Outage"}),
            ("notify_team", {"channel": "#sre-alerts", "message": "Alert"}),
            ("generate_postmortem", {"incident_id": "INC-001"}),
        ]

        for action_type, params in test_cases:
            res = execute_action(action_type, params)
            self.assertEqual(res["status"], "success")
            self.assertEqual(res["action"], action_type)
            self.assertIn("action_id", res)
            self.assertIn("timestamp", res)
            self.assertIsInstance(res["execution_time_ms"], int)
            self.assertGreater(res["execution_time_ms"], 0)
            self.assertEqual(res["params"], params)

    def test_unsupported_action(self):
        """Test calling unsupported action type returns status='failed' without raising exception."""
        res = execute_action("invalid_custom_action_name", {"foo": "bar"})
        self.assertEqual(res["status"], "failed")
        self.assertIn("Unsupported action", res["message"])

    def test_missing_required_parameters(self):
        """Test actions with missing parameters return status='failed'."""
        res1 = execute_action("restart_service", {})
        self.assertEqual(res1["status"], "failed")
        self.assertIn("Invalid parameters", res1["message"])

        res2 = execute_action("scale_deployment", {"deployment": "web-app"})
        self.assertEqual(res2["status"], "failed")
        self.assertIn("replicas", res2["message"])

    def test_invalid_params_type(self):
        """Test non-dict parameters parameter handled safely."""
        res = execute_action("restart_service", "invalid_param_type")
        self.assertEqual(res["status"], "failed")

    def test_audit_log_writing(self):
        """Test every action execution is written to tools/audit.log in JSONL format."""
        res = execute_action("notify_team", {"channel": "#test-unit", "message": "hello"})
        action_id = res["action_id"]

        self.assertTrue(AUDIT_LOG_PATH.exists())
        with open(AUDIT_LOG_PATH, "r", encoding="utf-8") as f:
            lines = f.readlines()
            self.assertGreater(len(lines), 0)
            last_entry = json.loads(lines[-1])
            self.assertEqual(last_entry["action_id"], action_id)
            self.assertEqual(last_entry["action"], "notify_team")


if __name__ == "__main__":
    unittest.main()
