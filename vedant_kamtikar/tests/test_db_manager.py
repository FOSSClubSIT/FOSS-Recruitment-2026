import unittest
from src.db_manager import DatabaseManager
from src.models import TaskItem


class TestDatabaseManager(unittest.TestCase):
    def setUp(self):
        # Use in-memory SQLite for testing
        self.db = DatabaseManager(db_path=":memory:")

    def tearDown(self):
        self.db.close()

    def test_compute_hash_determinism(self):
        item1 = TaskItem(
            item_id="moodle_101",
            title="Lab 1",
            source="LMS",
            class_batch="Batch C3",
            due_date="2026-09-01 23:59",
            due_date_origin="moodle_api",
        )
        item2 = TaskItem(
            item_id="moodle_101",
            title="Lab 1",
            source="LMS",
            class_batch="Batch C3",
            due_date="2026-09-01 23:59",
            due_date_origin="moodle_api",
        )
        self.assertEqual(DatabaseManager.compute_hash(item1), DatabaseManager.compute_hash(item2))

    def test_mark_seen_and_is_seen(self):
        item = TaskItem(
            item_id="moodle_202",
            title="Quiz 2",
            source="LMS",
            class_batch="Batch C3",
            due_date="2026-09-10 18:00",
            due_date_origin="moodle_api",
        )
        self.assertFalse(self.db.is_seen(item))
        self.db.mark_seen(item)
        self.assertTrue(self.db.is_seen(item))

    def test_filter_new(self):
        item1 = TaskItem(
            item_id="moodle_301",
            title="Task A",
            source="LMS",
            class_batch="Batch C3",
            due_date="2026-09-15 23:59",
            due_date_origin="moodle_api",
        )
        item2 = TaskItem(
            item_id="moodle_302",
            title="Task B",
            source="LMS",
            class_batch="Batch C3",
            due_date="2026-09-16 23:59",
            due_date_origin="moodle_api",
        )

        self.db.mark_seen(item1)
        new_items = self.db.filter_new([item1, item2])
        self.assertEqual(len(new_items), 1)
        self.assertEqual(new_items[0].item_id, "moodle_302")

    def test_extended_deadline_re_triggers_notification(self):
        """When a professor extends an assignment due date, the hash changes and it is treated as new."""
        original_item = TaskItem(
            item_id="moodle_404",
            title="Operating Systems Project",
            source="LMS",
            class_batch="Batch C3",
            due_date="2026-09-20 23:59",
            due_date_origin="moodle_api",
        )
        self.db.mark_seen(original_item)
        self.assertTrue(self.db.is_seen(original_item))

        # Professor updates deadline on Moodle
        updated_item = TaskItem(
            item_id="moodle_404",
            title="Operating Systems Project",
            source="LMS",
            class_batch="Batch C3",
            due_date="2026-09-25 23:59",  # Deadline extended by 5 days
            due_date_origin="moodle_api",
        )

        # Hash has changed, item should not be considered 'seen' for the new deadline
        self.assertFalse(self.db.is_seen(updated_item))
        new_items = self.db.filter_new([updated_item])
        self.assertEqual(len(new_items), 1)


if __name__ == "__main__":
    unittest.main()
