"""
Unit tests for tools/event_bus.py event timeline system.
"""

import unittest
import threading
import json
from pathlib import Path
from tools.event_bus import emit_event, get_events, clear_events, EVENTS_FILE_PATH


class TestEventBus(unittest.TestCase):

    def setUp(self):
        """Clear in-memory events before each test."""
        clear_events()

    def test_emit_and_get_events(self):
        """Test emitting valid events enqueues enriched event metadata."""
        emit_event({
            "type": "incident_detected",
            "payload": {"service": "payment-api", "severity": "P1"}
        })

        events = get_events()
        self.assertEqual(len(events), 1)
        ev = events[0]
        self.assertIn("event_id", ev)
        self.assertIn("timestamp", ev)
        self.assertEqual(ev["type"], "incident_detected")
        self.assertEqual(ev["payload"]["service"], "payment-api")

    def test_clear_events(self):
        """Test clear_events resets the in-memory queue."""
        emit_event({"type": "test_event", "payload": {}})
        self.assertEqual(len(get_events()), 1)
        clear_events()
        self.assertEqual(len(get_events()), 0)

    def test_invalid_event_structures(self):
        """Test emitting non-dict or missing 'type' events logs warning without crashing."""
        emit_event("invalid_string_event")
        emit_event(12345)
        emit_event({"no_type_field": "test"})
        emit_event({"type": 12345, "payload": {}})

        # None of the invalid events should be added to the queue
        self.assertEqual(len(get_events()), 0)

    def test_file_persistence(self):
        """Test emitted events append to tools/events.jsonl."""
        emit_event({"type": "persistence_test", "payload": {"status": "ok"}})
        self.assertTrue(EVENTS_FILE_PATH.exists())

        with open(EVENTS_FILE_PATH, "r", encoding="utf-8") as f:
            lines = f.readlines()
            self.assertGreater(len(lines), 0)
            last_event = json.loads(lines[-1])
            self.assertEqual(last_event["type"], "persistence_test")

    def test_thread_safety(self):
        """Test concurrent threads emitting events simultaneously produce no race conditions."""
        num_threads = 10
        events_per_thread = 20

        def worker(thread_idx):
            for i in range(events_per_thread):
                emit_event({
                    "type": "concurrent_test",
                    "payload": {"thread": thread_idx, "seq": i}
                })

        threads = [threading.Thread(target=worker, args=(t,)) for t in range(num_threads)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        events = get_events()
        self.assertEqual(len(events), num_threads * events_per_thread)


if __name__ == "__main__":
    unittest.main()
