import unittest
from unittest.mock import MagicMock
from src.moodle_client import MoodleClient, strip_html


class TestMoodleClient(unittest.TestCase):
    def setUp(self):
        self.client = MoodleClient(
            base_url="https://mock.moodle.edu",
            username="PRN12345",
            password="secret_password",
            target_batch="Batch C3",
        )

    def test_strip_html(self):
        html = "<p>Please submit <b>Lab 3</b> before midnight. <a href='#'>Link</a></p>"
        cleaned = strip_html(html)
        self.assertEqual(cleaned, "Please submit Lab 3 before midnight. Link")

    def test_batch_relevance_matching(self):
        # Explicit target matches
        self.assertTrue(self.client.is_relevant_to_batch("DSA Lab 4 - Batch C3"))
        self.assertTrue(self.client.is_relevant_to_batch("Object Oriented Lab (C3)"))
        self.assertTrue(self.client.is_relevant_to_batch("Batch c3: Submit reports here"))

        # Explicit other batch exclusions
        self.assertFalse(self.client.is_relevant_to_batch("DSA Lab 4 - Batch A"))
        self.assertFalse(self.client.is_relevant_to_batch("Operating Systems - Batch B"))
        self.assertFalse(self.client.is_relevant_to_batch("Algorithms Lab - Batch C1"))
        self.assertFalse(self.client.is_relevant_to_batch("Algorithms Lab - Batch C2"))

        # General whole-class announcements (no batch mentioned)
        self.assertTrue(self.client.is_relevant_to_batch("Mid-Semester Exam Schedule for Semester 5"))
        self.assertTrue(self.client.is_relevant_to_batch("Campus Placement Registration Deadline"))

    def test_get_upcoming_tasks_parsing(self):
        # Mock Moodle mod_assign_get_assignments response
        mock_courses = [
            {
                "id": 101,
                "fullname": "Data Structures & Algorithms - Batch C3",
                "assignments": [
                    {
                        "id": 501,
                        "name": "Lab 1: Linked Lists",
                        "intro": "<p>Implement singly linked list for Batch C3.</p>",
                        "duedate": 1725000000,  # Valid epoch
                    }
                ],
            },
            {
                "id": 102,
                "fullname": "Computer Networks",
                "assignments": [
                    {
                        "id": 502,
                        "name": "Socket Programming (Batch A)",
                        "intro": "<p>Submission for Batch A students only.</p>",
                        "duedate": 1725100000,
                    },
                    {
                        "id": 503,
                        "name": "General Networking Quiz",
                        "intro": "<p>Mandatory for all students.</p>",
                        "duedate": 0,  # No due date
                    },
                ],
            },
        ]

        self.client.fetch_assignments = MagicMock(return_value=mock_courses)
        self.client.fetch_announcements = MagicMock(return_value=[])
        tasks = self.client.get_upcoming_tasks()

        # Should include 501 (C3) and 503 (general), but discard 502 (Batch A)
        self.assertEqual(len(tasks), 2)

        task_501 = next(t for t in tasks if t.item_id == "moodle_assign_501")
        self.assertEqual(task_501.source, "LMS")
        self.assertEqual(task_501.due_date_origin, "moodle_api")
        self.assertIsNotNone(task_501.due_date)
        self.assertEqual(task_501.due_date, "2024-08-30 06:40")

        task_503 = next(t for t in tasks if t.item_id == "moodle_assign_503")
        self.assertEqual(task_503.source, "LMS")
        self.assertEqual(task_503.due_date_origin, "moodle_api")
        self.assertIsNone(task_503.due_date)

    def test_fetch_announcements(self):
        # Mock forums list
        mock_forums = [
            {"id": 88, "course": 101, "name": "Course Announcements", "type": "news"}
        ]
        # Mock discussions inside forum
        mock_discussions = {
            "discussions": [
                {
                    "id": 991,
                    "name": "Lab Exam for Batch C3 Rescheduled",
                    "message": "<p>Tomorrow's session is moved to 2 PM for Batch C3.</p>",
                    "userfullname": "Dr. Sharma",
                    "coursename": "Data Structures",
                },
                {
                    "id": 992,
                    "name": "Batch A Viva Notice",
                    "message": "<p>Viva tomorrow for Batch A.</p>",
                    "userfullname": "Dr. Sharma",
                    "coursename": "Data Structures",
                },
            ]
        }

        def mock_call(func_name, params=None):
            if func_name == "mod_forum_get_forums_by_courses":
                return mock_forums
            if func_name == "mod_forum_get_forum_discussions":
                return mock_discussions
            return {}

        self.client.call_function = MagicMock(side_effect=mock_call)
        announcements = self.client.fetch_announcements([101])

        # Should include 991 (C3), but discard 992 (Batch A)
        self.assertEqual(len(announcements), 1)
        self.assertEqual(announcements[0].item_id, "moodle_notice_991")
        self.assertIn("Lab Exam for Batch C3", announcements[0].title)
        self.assertEqual(announcements[0].source, "LMS")


if __name__ == "__main__":
    unittest.main()

