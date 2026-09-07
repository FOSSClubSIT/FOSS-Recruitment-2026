import logging
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from html.parser import HTMLParser
from typing import Any, Optional

import requests

from src.config import settings
from src.models import TaskItem

logger = logging.getLogger(__name__)


class HTMLTextExtractor(HTMLParser):
    """Lightweight HTML tag stripper using the standard library."""
    def __init__(self):
        super().__init__()
        self.reset()
        self.fed: list[str] = []

    def handle_data(self, d: str):
        self.fed.append(d)

    def get_text(self) -> str:
        return " ".join("".join(self.fed).split())


def strip_html(html_content: Optional[str]) -> str:
    """Remove HTML formatting and normalize whitespace."""
    if not html_content:
        return ""
    parser = HTMLTextExtractor()
    parser.feed(html_content)
    return parser.get_text()


class MoodleAPIError(Exception):
    """Raised when Moodle REST API returns an error structure."""
    pass


class MoodleAuthError(MoodleAPIError):
    """Raised when token generation fails with invalid credentials or service error."""
    pass


class MoodleClient:
    """Client for authenticating with and querying Moodle LMS Web Services."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        username: Optional[str] = None,
        password: Optional[str] = None,
        service: Optional[str] = None,
        target_batch: Optional[str] = None,
        session: Optional[requests.Session] = None,
    ):
        self.base_url = (base_url or settings.MOODLE_BASE_URL).rstrip("/")
        self.username = username or settings.MOODLE_USERNAME
        self.password = password or settings.MOODLE_PASSWORD
        self.service = service or settings.MOODLE_SERVICE_SHORTNAME
        self.target_batch = (target_batch or settings.MOODLE_TARGET_BATCH).strip()
        self.session = session or requests.Session()
        self._token: Optional[str] = None

    def authenticate(self) -> str:
        """Authenticate against login/token.php to obtain a web service token.
        
        Tokens are cached in memory for subsequent API calls.
        """
        if self._token:
            return self._token

        if not self.base_url or not self.username or not self.password:
            raise MoodleAuthError(
                "Missing Moodle credentials. Please verify MOODLE_BASE_URL, "
                "MOODLE_USERNAME, and MOODLE_PASSWORD in your .env configuration."
            )

        token_url = f"{self.base_url}/login/token.php"
        payload = {
            "username": self.username,
            "password": self.password,
            "service": self.service,
        }

        logger.info(f"Authenticating with Moodle endpoint: {token_url} (Service: {self.service})")
        try:
            response = self.session.post(token_url, data=payload, timeout=20)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as e:
            raise MoodleAuthError(f"HTTP request to Moodle token endpoint failed: {e}") from e
        except ValueError as e:
            raise MoodleAuthError(f"Moodle returned non-JSON response: {e}") from e

        if "error" in data:
            error_code = data.get("errorcode", "unknown")
            error_msg = data.get("error", "Authentication failed")
            raise MoodleAuthError(f"Moodle authentication error [{error_code}]: {error_msg}")

        token = data.get("token")
        if not token:
            raise MoodleAuthError(f"Authentication response did not contain a token: {data}")

        self._token = token
        logger.info("Successfully authenticated with Moodle Web Services.")
        return token

    def call_function(self, wsfunction: str, params: Optional[dict[str, Any]] = None) -> Any:
        """Invoke a Moodle Web Service function via webservice/rest/server.php."""
        token = self.authenticate()
        server_url = f"{self.base_url}/webservice/rest/server.php"

        request_params: dict[str, Any] = {
            "wstoken": token,
            "wsfunction": wsfunction,
            "moodlewsrestformat": "json",
        }
        if params:
            request_params.update(params)

        try:
            response = self.session.post(server_url, data=request_params, timeout=30)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as e:
            raise MoodleAPIError(f"HTTP call to {wsfunction} failed: {e}") from e
        except ValueError as e:
            raise MoodleAPIError(f"Invalid JSON returned from {wsfunction}: {e}") from e

        if isinstance(data, dict) and (data.get("exception") or data.get("errorcode")):
            message = data.get("message", "Unknown error")
            raise MoodleAPIError(f"Moodle API exception in {wsfunction}: {message} (code: {data.get('errorcode')})")

        return data

    def fetch_assignments(self, course_ids: Optional[list[int]] = None) -> list[dict[str, Any]]:
        """Fetch raw assignments using mod_assign_get_assignments."""
        params: dict[str, Any] = {}
        target_ids = course_ids or settings.parsed_course_ids
        if target_ids:
            for idx, cid in enumerate(target_ids):
                params[f"courseids[{idx}]"] = cid

        logger.info(f"Querying mod_assign_get_assignments with course filter: {target_ids or 'ALL'}")
        result = self.call_function("mod_assign_get_assignments", params)
        return result.get("courses", [])

    def is_relevant_to_batch(self, text_corpus: str) -> bool:
        """Determine whether an assignment or course pertains to the student's batch.
        
        SIT Pune section naming conventions:
        - Target matches: 'Batch C3', 'C3 Assignment', 'C3_Assignment', 'C1,C2,C3,C4', 'C1 C3 & C4', 'C3C4'
        - Other batch exclusions: 'B1-', 'B2-', 'B3', 'B4', 'C1', 'C2', 'C4', 'Batch A', etc.
        - General assignments: no section specified (e.g. 'E-R Diagram', 'B Tree assignment') -> kept for all.
        """
        normalized_corpus = text_corpus.upper()
        target = self.target_batch.upper()
        target_short = target.replace("BATCH", "").strip()  # "C3"

        # 1. Direct match for target batch in various notation styles
        pattern_target = rf"(\b(BATCH\s*)?{re.escape(target_short)}\b|{re.escape(target_short)}_|_{re.escape(target_short)}|\b{re.escape(target_short)}C[0-9]\b)"
        if re.search(pattern_target, normalized_corpus):
            return True

        # 2. Check if another specific batch is explicitly targeted (e.g. A1-A4, B1-B4, C1, C2, C4, D1-D4)
        # Avoid false positives like "B TREE" by requiring digits or explicit "BATCH"
        other_batch_match = re.search(r"\b[A-D][1-4](_|-|\b)|\bBATCH\s+[A-Z0-9]+", normalized_corpus)
        if other_batch_match:
            return False

        # 3. No section specified -> applies to all students in the course
        return True

    def fetch_announcements(
        self,
        course_ids: list[int],
        max_past_days: int = 14,
        course_names: Optional[dict[int, str]] = None,
    ) -> list[TaskItem]:
        """Fetch course announcements / notices from each course's Announcements forum."""
        if not course_ids:
            return []

        announcement_items: list[TaskItem] = []
        now_epoch = datetime.now(timezone.utc).timestamp()
        course_names = course_names or {}

        try:
            params: dict[str, Any] = {}
            for idx, cid in enumerate(course_ids):
                params[f"courseids[{idx}]"] = cid

            forums = self.call_function("mod_forum_get_forums_by_courses", params)
            if not isinstance(forums, list):
                return []

            # Filter for announcements / news forums
            announcement_forums = [
                f for f in forums
                if f.get("type") == "news" or "announcement" in f.get("name", "").lower() or "news" in f.get("name", "").lower()
            ]

            def process_single_forum(forum: dict[str, Any]) -> list[TaskItem]:
                items: list[TaskItem] = []
                forum_id = forum.get("id")
                course_id = forum.get("course")
                if not forum_id:
                    return []

                try:
                    disc_data = self.call_function("mod_forum_get_forum_discussions", {"forumid": forum_id})
                    discussions = disc_data.get("discussions", []) if isinstance(disc_data, dict) else []

                    for disc in discussions:
                        time_mod = disc.get("timemodified", 0) or disc.get("created", 0)
                        if time_mod and time_mod < (now_epoch - max_past_days * 86400):
                            continue

                        disc_id = str(disc.get("id"))
                        subject = disc.get("name", "Course Announcement")
                        message_html = disc.get("message", "")
                        message_plain = strip_html(message_html)
                        author = disc.get("userfullname", "Instructor")
                        course_name = disc.get("coursename") or course_names.get(course_id, f"Course {course_id}")

                        search_corpus = f"{course_name} | {subject} | {message_plain}"
                        if not self.is_relevant_to_batch(search_corpus):
                            continue

                        task = TaskItem(
                            item_id=f"moodle_notice_{disc_id}",
                            title=f"[{course_name}] Notice: {subject}",
                            source="LMS",
                            class_batch=self.target_batch,
                            due_date=None,
                            due_date_origin="moodle_api",
                            summary=None,
                            urgency=None,
                            action_required=None,
                            raw_content=f"Course: {course_name}\nPosted by: {author}\nSubject: {subject}\nMessage: {message_plain}",
                        )
                        items.append(task)
                except Exception as e:
                    logger.debug(f"Could not fetch discussions for forum {forum_id}: {e}")

                return items

            # Query forums in parallel with 8 workers
            with ThreadPoolExecutor(max_workers=8) as executor:
                future_to_forum = {executor.submit(process_single_forum, f): f for f in announcement_forums}
                for future in as_completed(future_to_forum):
                    try:
                        res = future.result()
                        if res:
                            announcement_items.extend(res)
                    except Exception as e:
                        logger.debug(f"Forum future error: {e}")

        except Exception as e:
            logger.info(f"Course announcement forums could not be fetched via API: {e}")

        return announcement_items

    def is_assignment_submitted(self, assign_id: int) -> bool:
        """Check whether the student has already submitted this assignment."""
        try:
            res = self.call_function("mod_assign_get_submission_status", {"assignid": assign_id})
            status = (
                res.get("lastattempt", {})
                .get("submission", {})
                .get("status", "")
            )
            return status == "submitted"
        except Exception as e:
            logger.debug(f"Could not verify submission status for assignment {assign_id}: {e}")
            return False

    def get_upcoming_tasks(
        self,
        course_ids: Optional[list[int]] = None,
        max_past_days: Optional[int] = None,
        max_assignment_past_days: Optional[int] = None,
        max_notice_past_days: Optional[int] = None,
        ignore_submitted: bool = False,
    ) -> list[TaskItem]:
        """Fetch, filter, and normalize assignments AND course announcements into TaskItem objects.
        
        Crucial: Native due_date is converted deterministically and tagged with
        due_date_origin='moodle_api'. It will NEVER be touched by the LLM.
        """
        # Resolve past days thresholds
        assign_past_days = max_assignment_past_days if max_assignment_past_days is not None else max_past_days
        notice_past_days = max_notice_past_days if max_notice_past_days is not None else (max_past_days or 14)

        courses = self.fetch_assignments(course_ids)
        task_items: list[TaskItem] = []
        enrolled_course_ids: list[int] = []
        now_epoch = datetime.now(timezone.utc).timestamp()

        target_short = self.target_batch.replace("BATCH", "").strip().upper()  # "C3"
        submitted_ids: set[str] = set()
        course_submitted_numbers: dict[int, set[int]] = {}

        # 1. Pre-scan enrolled courses for submission statuses & submitted assignment numbers
        for course in courses:
            cid = course.get("id")
            if cid:
                enrolled_course_ids.append(cid)
                course_submitted_numbers[cid] = set()

            assignments = course.get("assignments", [])
            if ignore_submitted and assignments:
                with ThreadPoolExecutor(max_workers=6) as executor:
                    future_to_assign = {
                        executor.submit(self.is_assignment_submitted, int(a["id"])): a
                        for a in assignments
                    }
                    for future in as_completed(future_to_assign):
                        assign_obj = future_to_assign[future]
                        try:
                            if future.result():
                                aid_str = str(assign_obj["id"])
                                submitted_ids.add(aid_str)
                                num_match = re.search(r'(?:assignment|exp|lab)[-_ ]*([0-9]+)', assign_obj.get("name", ""), re.IGNORECASE)
                                if num_match and cid:
                                    course_submitted_numbers[cid].add(int(num_match.group(1)))
                        except Exception:
                            pass

        for course in courses:
            cid = course.get("id")
            course_name = course.get("fullname", "") or course.get("shortname", "")
            assignments = course.get("assignments", [])

            # Check if this course has dedicated assignments partitioned for the student's batch
            course_has_batch_assignments = any(
                f"{target_short}_" in a.get("name", "").upper() or f"{target_short}-" in a.get("name", "").upper()
                for a in assignments
            )

            for assign in assignments:
                assign_id = str(assign.get("id"))
                name = assign.get("name", "Untitled Assignment")
                intro_html = assign.get("intro", "")
                intro_plain = strip_html(intro_html)
                due_epoch = assign.get("duedate", 0)

                # Skip if already directly submitted
                if assign_id in submitted_ids:
                    logger.info(f"Ignoring directly submitted assignment: [{course_name}] {name}")
                    continue

                # Skip if this assignment number was already submitted in this course (e.g. C3_Assignment-4 submitted -> ignore generic Assignment 4)
                num_match = re.search(r'(?:assignment|exp|lab)[-_ ]*([0-9]+)', name, re.IGNORECASE)
                if num_match and cid and int(num_match.group(1)) in course_submitted_numbers.get(cid, set()):
                    logger.info(f"Ignoring duplicate assignment #{num_match.group(1)} as already submitted in [{course_name}]: {name}")
                    continue

                # In courses with dedicated batch assignments, ignore generic un-partitioned assignments
                if course_has_batch_assignments and not (f"{target_short}_" in name.upper() or f"{target_short}-" in name.upper() or f"BATCH {target_short}" in name.upper()):
                    logger.info(f"Ignoring generic assignment in batch-partitioned course: [{course_name}] {name}")
                    continue

                # Skip assignments that expired or were last modified more than assign_past_days ago
                if assign_past_days is not None:
                    if due_epoch and due_epoch > 0:
                        if due_epoch < (now_epoch - assign_past_days * 86400):
                            continue
                    else:
                        time_mod = assign.get("timemodified", 0)
                        if time_mod and time_mod < (now_epoch - assign_past_days * 86400):
                            continue

                # Combine text fields to test section relevance
                search_corpus = f"{course_name} | {name} | {intro_plain}"
                if not self.is_relevant_to_batch(search_corpus):
                    continue

                # Format native timestamp
                due_date_str: Optional[str] = None
                if due_epoch and due_epoch > 0:
                    dt = datetime.fromtimestamp(due_epoch, tz=timezone.utc)
                    due_date_str = dt.strftime("%Y-%m-%d %H:%M")

                task = TaskItem(
                    item_id=f"moodle_assign_{assign_id}",
                    title=f"[{course_name}] {name}",
                    source="LMS",
                    class_batch=self.target_batch,
                    due_date=due_date_str,
                    due_date_origin="moodle_api",
                    summary=None,
                    urgency=None,
                    action_required=None,
                    raw_content=f"Course: {course_name}\nAssignment: {name}\nDetails: {intro_plain}",
                )
                task_items.append(task)

        # Ingest course announcements / news forums from all enrolled courses
        if enrolled_course_ids:
            logger.info(f"Querying course announcement tabs across {len(enrolled_course_ids)} courses...")
            course_names_map = {
                c.get("id"): (c.get("fullname") or c.get("shortname"))
                for c in courses
                if c.get("id")
            }
            announcements = self.fetch_announcements(
                enrolled_course_ids,
                max_past_days=notice_past_days,
                course_names=course_names_map,
            )
            task_items.extend(announcements)

        logger.info(f"Retrieved {len(task_items)} total tasks and notices for {self.target_batch}")
        return task_items

