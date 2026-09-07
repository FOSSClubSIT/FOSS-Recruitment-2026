import unittest
from unittest.mock import MagicMock
from src.llm_processor import LLMProcessor
from src.models import LLMClassification, TaskItem


class TestLLMProcessor(unittest.TestCase):
    def setUp(self):
        self.processor = LLMProcessor(api_key=None)  # Runs in fallback/mock mode

    def test_moodle_date_immutability_guard(self):
        """Verify that Moodle native due_date is never altered by LLM processing."""
        moodle_item = TaskItem(
            item_id="moodle_789",
            title="Algorithm Analysis Assignment 3",
            source="LMS",
            class_batch="Batch C3",
            due_date="2026-09-01 11:30",
            due_date_origin="moodle_api",
            raw_content="Submit dynamic programming solutions on Moodle.",
        )

        # Mock classify_item to return a sample classification
        self.processor.classify_item = MagicMock(
            return_value=LLMClassification(
                urgency="high",
                summary="Dynamic programming lab due soon.",
                action_required=True,
            )
        )

        results = self.processor.process_items([moodle_item])
        self.assertEqual(len(results), 1)
        item = results[0]

        # Critical assertions:
        self.assertEqual(item.due_date, "2026-09-01 11:30", "Moodle due_date was mutated!")
        self.assertEqual(item.due_date_origin, "moodle_api")
        self.assertEqual(item.urgency, "high")
        self.assertEqual(item.summary, "Dynamic programming lab due soon.")
        self.assertTrue(item.action_required)

    def test_gmail_date_extraction_path(self):
        """Verify that Gmail items extract due_date and are tagged with due_date_origin='llm_extracted'."""
        gmail_item = TaskItem(
            item_id="gmail_msg_001",
            title="Urgent: Capstone Proposal Submission Deadline",
            source="Gmail",
            class_batch="Batch C3",
            due_date=None,
            due_date_origin="llm_extracted",
            raw_content="All Batch C3 students must submit their topic proposals by 2026-09-15 23:59 via email.",
        )

        self.processor.classify_item = MagicMock(
            return_value=LLMClassification(
                urgency="high",
                summary="Capstone proposal submission required.",
                action_required=True,
            )
        )
        self.processor.extract_due_date_from_email = MagicMock(
            return_value="2026-09-15 23:59"
        )

        results = self.processor.process_items([gmail_item])
        item = results[0]

        self.assertEqual(item.due_date, "2026-09-15 23:59")
        self.assertEqual(item.due_date_origin, "llm_extracted")
        self.assertEqual(item.urgency, "high")

    def test_fallback_classification_heuristics(self):
        """Test rule-based fallback classifications when API is offline."""
        exam_class = self.processor._fallback_classification("Midterm Exam Notice", "Exam hall ticket details.")
        self.assertEqual(exam_class.urgency, "high")
        self.assertTrue(exam_class.action_required)

        lab_class = self.processor._fallback_classification("Lab 3 Submission", "Upload python files.")
        self.assertEqual(lab_class.urgency, "medium")
        self.assertTrue(lab_class.action_required)

        info_class = self.processor._fallback_classification("Department Newsletter", "Here is the August edition.")
        self.assertEqual(info_class.urgency, "low")
        self.assertFalse(info_class.action_required)


if __name__ == "__main__":
    unittest.main()
