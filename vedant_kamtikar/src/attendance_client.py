import logging
import math
import re
from typing import NamedTuple, Optional
import requests
from bs4 import BeautifulSoup

from src.config import settings

logger = logging.getLogger(__name__)


class SubjectAttendance(NamedTuple):
    course_name: str
    clean_name: str
    total_sessions: int
    marked_sessions: int
    attended_sessions: int
    percentage: float
    percentage_str: str
    is_below_threshold: bool
    classes_needed: int


class AttendanceSummary(NamedTuple):
    subjects: list[SubjectAttendance]
    total_sessions: int
    attended_sessions: int
    overall_percentage: float
    is_overall_below_threshold: bool
    has_shortage: bool
    threshold: float


def clean_attendance_subject_name(raw_name: str) -> str:
    """Normalize lengthy Moodle attendance subject names to clean course codes."""
    n = raw_name.upper()
    if "NETWORKS LAB" in n or "CNL" in n:
        return "CNL"
    if "NETWORKS" in n or "CN" in n:
        return "CN"
    if "ALGORITHMS LAB" in n or "DAAL" in n:
        return "DAAL"
    if "ALGORITHMS" in n or "DAA" in n:
        return "DAA"
    if "CLOUD" in n or "FCC" in n:
        return "Cloud Computing"
    if "SERVICE LEARNING" in n or "SL" in n:
        return "Service Learning"
    if "THEORY OF COMPUTATION" in n or "TOC" in n:
        return "TOC"
    if "ECONOMICS" in n or "POE" in n:
        return "POE"
    if "FINANCIAL MATHEMATICS" in n or "FM" in n:
        return "FM"
    return raw_name.strip()


class AttendanceClient:
    """Authenticates with SIT Pune Moodle and parses student attendance reports."""

    ATTENDANCE_URL = "https://lms.sitpune.edu.in/attendance-report/Student-Attendance/index.php"
    LOGIN_URL = "https://lms.sitpune.edu.in/login/index.php"

    def __init__(
        self,
        username: Optional[str] = None,
        password: Optional[str] = None,
        threshold: float = 75.0,
    ):
        self.username = username or settings.MOODLE_USERNAME
        self.password = password or settings.MOODLE_PASSWORD
        self.threshold = threshold

    def _login(self, session: requests.Session) -> bool:
        """Perform web authentication against Moodle login endpoint."""
        try:
            r_login = session.get(self.LOGIN_URL, timeout=15)
            r_login.raise_for_status()

            soup = BeautifulSoup(r_login.text, "html.parser")
            token_input = soup.find("input", {"name": "logintoken"})
            if not token_input or not token_input.get("value"):
                logger.error("Could not locate Moodle web logintoken.")
                return False

            logintoken = token_input["value"]
            payload = {
                "username": self.username,
                "password": self.password,
                "logintoken": logintoken,
            }

            post_resp = session.post(self.LOGIN_URL, data=payload, timeout=20)
            post_resp.raise_for_status()

            # Check if login succeeded (MoodleSession cookie set)
            if "MoodleSession" in session.cookies:
                logger.info("Successfully established authenticated Moodle web session.")
                return True

            logger.error("Moodle web authentication failed: MoodleSession cookie missing.")
            return False

        except Exception as e:
            logger.error(f"Error during Moodle web login: {e}")
            return False

    def fetch_attendance(self) -> Optional[AttendanceSummary]:
        """Fetch and parse live student attendance from Moodle report endpoint."""
        session = requests.Session()
        session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        })

        if not self._login(session):
            return None

        try:
            resp = session.get(self.ATTENDANCE_URL, timeout=20)
            resp.raise_for_status()
            return self.parse_attendance_html(resp.text)
        except Exception as e:
            logger.error(f"Failed to fetch attendance report from {self.ATTENDANCE_URL}: {e}")
            return None

    def parse_attendance_html(self, html_text: str) -> Optional[AttendanceSummary]:
        """Parse the HTML table into a structured AttendanceSummary."""
        try:
            soup = BeautifulSoup(html_text, "html.parser")
            table = soup.find("table", {"id": "customers"}) or soup.find("table")
            if not table:
                logger.warning("Could not find attendance table in HTML response.")
                return None

            subjects: list[SubjectAttendance] = []
            overall_total = 0
            overall_attended = 0

            rows = table.find_all("tr")
            for row in rows:
                th_subj = row.find("th", {"id": "subject"})
                if th_subj:
                    raw_subj_name = th_subj.get_text(strip=True)
                    # Exclude Vasudhaiva Kutumbakam
                    if "VASUDHAIVA KUTUMBAKAM" in raw_subj_name.upper():
                        continue

                    tds = row.find_all("td", {"id": "userData"})
                    if len(tds) >= 4:
                        try:
                            total = int(tds[0].get_text(strip=True))
                            marked = int(tds[1].get_text(strip=True))
                            attended = int(tds[2].get_text(strip=True))
                            pct_str = tds[3].get_text(strip=True)
                            
                            # Parse percentage float
                            pct_clean = pct_str.replace("%", "").strip()
                            pct_float = float(pct_clean) if pct_clean and pct_clean != "-" else 0.0

                            is_below = pct_float < self.threshold
                            # Classes needed to reach threshold: (attended + x) / (total + x) >= threshold / 100
                            # x >= (threshold*total - 100*attended) / (100 - threshold)
                            classes_needed = 0
                            if is_below and total > 0:
                                t_ratio = self.threshold / 100.0
                                if (1.0 - t_ratio) > 0:
                                    needed = (t_ratio * total - attended) / (1.0 - t_ratio)
                                    classes_needed = max(0, math.ceil(needed))

                            sub_obj = SubjectAttendance(
                                course_name=raw_subj_name,
                                clean_name=clean_attendance_subject_name(raw_subj_name),
                                total_sessions=total,
                                marked_sessions=marked,
                                attended_sessions=attended,
                                percentage=pct_float,
                                percentage_str=pct_str,
                                is_below_threshold=is_below,
                                classes_needed=classes_needed,
                            )
                            subjects.append(sub_obj)
                            overall_total += total
                            overall_attended += attended
                        except (ValueError, IndexError) as e:
                            logger.debug(f"Error parsing attendance row for {raw_subj_name}: {e}")

            if not subjects:
                return None

            # Calculate overall percentage from valid subjects
            overall_pct = (overall_attended / overall_total * 100.0) if overall_total > 0 else 0.0
            has_shortage = any(s.is_below_threshold for s in subjects)

            return AttendanceSummary(
                subjects=subjects,
                total_sessions=overall_total,
                attended_sessions=overall_attended,
                overall_percentage=round(overall_pct, 2),
                is_overall_below_threshold=(overall_pct < self.threshold),
                has_shortage=has_shortage,
                threshold=self.threshold,
            )

        except Exception as e:
            logger.error(f"Failed to parse attendance table: {e}")
            return None
