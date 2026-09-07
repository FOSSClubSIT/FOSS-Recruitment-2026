import unittest
from unittest.mock import MagicMock
from src.attendance_client import AttendanceClient, clean_attendance_subject_name


SAMPLE_HTML = """
<!DOCTYPE html>
<html>
<body>
<div class='data'>
  <div class='content'>
    <table id='customers'>
      <thead>
        <tr>
          <th>Course Name</th><th>Total</th><th>Marked</th><th>Attended</th><th>%</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th id='subject'>2024-28-Vth Sem-Computer Networks Lab</th>
          <td id='userData'>8</td><td id='userData'>8</td><td id='userData'>8</td>
          <td id='userData'>100.00%</td>
        </tr>
        <tr>
          <th id='subject'>Flexi-Credit Course( Cloud Computing and Security ) 2026 June</th>
          <td id='userData'>14</td><td id='userData'>14</td><td id='userData'>9</td>
          <td id='userData'>64.29%</td>
        </tr>
        <tr>
          <th id='subject'>Vasudhaiva Kutumbakam 2026</th>
          <td id='userData'>0</td><td id='userData'>0</td><td id='userData'>0</td>
          <td id='userData'>-</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</body>
</html>
"""


class TestAttendanceClient(unittest.TestCase):
    def setUp(self):
        self.client = AttendanceClient(threshold=75.0)

    def test_clean_subject_name(self):
        self.assertEqual(clean_attendance_subject_name("2024-28-Vth Sem-Computer Networks Lab"), "CNL")
        self.assertEqual(clean_attendance_subject_name("Flexi-Credit Course( Cloud Computing and Security ) 2026 June"), "Cloud Computing")
        self.assertEqual(clean_attendance_subject_name("Financial Mathematics 2026 June"), "FM")
        self.assertEqual(clean_attendance_subject_name("Principles of Economics 2026 June"), "POE")

    def test_parse_attendance_html_and_exclusion(self):
        summary = self.client.parse_attendance_html(SAMPLE_HTML)
        self.assertIsNotNone(summary)

        # Vasudhaiva Kutumbakam must be excluded
        subject_names = [s.course_name for s in summary.subjects]
        self.assertFalse(any("Vasudhaiva" in name for name in subject_names))
        self.assertEqual(len(summary.subjects), 2)

        # Verify CNL (100%)
        cnl = next(s for s in summary.subjects if s.clean_name == "CNL")
        self.assertEqual(cnl.total_sessions, 8)
        self.assertEqual(cnl.attended_sessions, 8)
        self.assertEqual(cnl.percentage, 100.0)
        self.assertFalse(cnl.is_below_threshold)
        self.assertEqual(cnl.classes_needed, 0)

        # Verify Cloud Computing (64.29%)
        cloud = next(s for s in summary.subjects if s.clean_name == "Cloud Computing")
        self.assertEqual(cloud.total_sessions, 14)
        self.assertEqual(cloud.attended_sessions, 9)
        self.assertEqual(cloud.percentage, 64.29)
        self.assertTrue(cloud.is_below_threshold)
        self.assertGreater(cloud.classes_needed, 0)

        # Overall calculations
        self.assertTrue(summary.has_shortage)
        self.assertEqual(summary.total_sessions, 22)
        self.assertEqual(summary.attended_sessions, 17)
        self.assertAlmostEqual(summary.overall_percentage, 77.27, places=2)
