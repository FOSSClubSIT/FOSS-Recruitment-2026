import html
import logging
import re
from datetime import datetime, timezone
from typing import Optional

import requests

from src.config import settings
from src.models import TaskItem

logger = logging.getLogger(__name__)


def escape_html(text: Optional[str]) -> str:
    """Safely escape HTML entities for Telegram HTML parse mode."""
    if not text:
        return ""
    return html.escape(str(text))


def extract_clean_course_and_title(raw_title: str) -> tuple[str, str]:
    """Extract clean course code/name and a concise notice title (max 6 words)."""
    course = "Course"
    title = raw_title
    if raw_title.startswith("[") and "]" in raw_title:
        course_part, title_part = raw_title.split("]", 1)
        raw_course = course_part.lstrip("[").strip()
        title = title_part.strip()
        c_upper = raw_course.upper()
        if "NETWORKS LAB" in c_upper or "CNL" in c_upper:
            course = "CNL"
        elif "NETWORKS" in c_upper or "CN" in c_upper:
            course = "CN"
        elif "ALGORITHMS LAB" in c_upper or "DAAL" in c_upper:
            course = "DAAL"
        elif "ALGORITHMS" in c_upper or "DAA" in c_upper:
            course = "DAA"
        elif "CLOUD" in c_upper or "FCC" in c_upper:
            course = "Cloud Computing"
        elif "SERVICE LEARNING" in c_upper or "SL" in c_upper:
            course = "Service Learning"
        elif "THEORY OF COMPUTATION" in c_upper or "TOC" in c_upper:
            course = "TOC"
        elif "FINANCIAL MATHEMATICS" in c_upper or "FM" in c_upper:
            course = "FM"
        elif "ECONOMICS" in c_upper or "POE" in c_upper:
            course = "POE"
        else:
            course = raw_course

    title = re.sub(r"^Notice:\s*", "", title, flags=re.IGNORECASE).strip()
    words = title.split()
    if len(words) > 6:
        title = " ".join(words[:6])
    return course, title


class TelegramNotifier:
    """Dispatches deterministic, templated alerts and digests via Telegram Bot API."""

    def __init__(
        self,
        bot_token: Optional[str] = None,
        chat_id: Optional[str] = None,
        urgent_threshold_hours: Optional[int] = None,
    ):
        self.bot_token = bot_token or settings.TELEGRAM_BOT_TOKEN
        self.chat_id = chat_id or settings.TELEGRAM_CHAT_ID
        self.urgent_threshold_hours = (
            urgent_threshold_hours or settings.URGENT_THRESHOLD_HOURS
        )
        self.api_url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"

    def is_configured(self) -> bool:
        """Check whether credentials are provided for active sending."""
        return bool(self.bot_token and self.chat_id)

    def is_urgent(self, item: TaskItem) -> bool:
        """Check whether an item warrants an immediate alert."""
        if item.urgency == "high":
            return True

        if item.due_date:
            try:
                # Parse 'YYYY-MM-DD HH:MM'
                due_dt = datetime.strptime(item.due_date, "%Y-%m-%d %H:%M").replace(tzinfo=timezone.utc)
                now_utc = datetime.now(timezone.utc)
                hours_remaining = (due_dt - now_utc).total_seconds() / 3600.0
                if 0 <= hours_remaining <= self.urgent_threshold_hours:
                    return True
            except ValueError:
                pass

        return False

    def render_notification(self, item: TaskItem) -> str:
        """Format an academic notification using the exact user-specified structure.
        
        Exact Structure:
        <priority emoji> <Course name> — <short notice title, max 6 words>
        <Section> · <"Action required" if applicable, else omit this line>

        <1-3 sentence plain-language summary of what the student needs to know or do>

        <"Deadline: <date>" line — ONLY if a real date was provided>
        """
        # 1. Priority emoji: 🔴 for HIGH URGENCY, 🟡 for MEDIUM, ⚪ for LOW/info-only
        urgency = (item.urgency or "medium").lower()
        if urgency == "high":
            emoji = "🔴"
        elif urgency == "medium":
            emoji = "🟡"
        else:
            emoji = "⚪"

        # 2. Extract clean Course name and short notice title (max 6 words)
        course, short_title = extract_clean_course_and_title(item.title)
        course_esc = escape_html(course)
        title_esc = escape_html(short_title)

        # Rule: No more than one bolded element per message (the course/title line only)
        header_line = f"<b>{emoji} {course_esc} — {title_esc}</b>"

        # 3. Section and Action required line
        section = escape_html(item.class_batch or "Batch C3")
        if item.action_required:
            section_line = f"{section} · Action required"
        else:
            section_line = f"{section}"

        # 4. Summary: 1-3 sentence plain-language summary under 40 words
        summary_esc = escape_html((item.summary or "").strip())

        # 5. Deadline: ONLY include if a real date was provided. Never write "Not specified" or mention data source.
        deadline_block = ""
        if item.due_date and item.due_date.strip():
            deadline_block = f"\n\nDeadline: {escape_html(item.due_date.strip())}"

        return f"{header_line}\n{section_line}\n\n{summary_esc}{deadline_block}"

    def render_urgent_alert(self, item: TaskItem) -> str:
        """Alias to render_notification for backward compatibility."""
        return self.render_notification(item)

    def render_digest(self, items: list[TaskItem]) -> str:
        """Render items using the exact notification format separated by line dividers."""
        return "\n\n───────────────\n\n".join(self.render_notification(it) for it in items)

    def render_attendance_summary(self, summary) -> str:
        """Format a clean, casual text-based attendance summary."""
        header = f"<b>📊 Attendance — {summary.overall_percentage:.1f}% overall ({summary.attended_sessions}/{summary.total_sessions})</b>"
        lines = [header, ""]

        below = [s for s in summary.subjects if s.is_below_threshold]
        safe = [s for s in summary.subjects if not s.is_below_threshold]

        if below:
            lines.append("Below 75% threshold:")
            for s in below:
                lines.append(f"🔴 {escape_html(s.clean_name)}: {s.percentage:.1f}% ({s.attended_sessions}/{s.total_sessions})")
            lines.append("")

        lines.append("Safe (≥75%):")
        safe_parts = [f"{escape_html(s.clean_name)} {s.percentage:.1f}%" for s in safe]
        lines.append(" · ".join(safe_parts))

        return "\n".join(lines)

    def send_message(self, text: str) -> bool:
        """Send an HTML-formatted message to the designated Telegram chat."""
        if not self.is_configured():
            logger.warning("Telegram Bot is not configured. Message was not dispatched over the network.")
            return False

        payload = {
            "chat_id": self.chat_id,
            "text": text,
            "parse_mode": "HTML",
            "disable_web_page_preview": True,
        }

        for attempt in range(1, 3):
            try:
                resp = requests.post(self.api_url, json=payload, timeout=30)
                resp.raise_for_status()
                data = resp.json()
                if data.get("ok"):
                    logger.info("Telegram message delivered successfully.")
                    return True
                else:
                    logger.error(f"Telegram API responded with error: {data}")
                    return False
            except requests.RequestException as e:
                logger.warning(f"Telegram transmission attempt {attempt} failed: {e}")
                if attempt < 2:
                    import time
                    time.sleep(2)

        return False

    def dispatch(self, items: list[TaskItem], dry_run: bool = False) -> int:
        """Dispatch each notification formatted according to the exact structure.
        
        Returns the number of messages successfully delivered (or printed in dry-run).
        """
        if not items:
            logger.info("No items to notify.")
            return 0

        dispatched_count = 0
        for item in items:
            msg = self.render_notification(item)
            if dry_run:
                print("\n" + "=" * 50)
                print("[DRY-RUN TELEGRAM NOTIFICATION]")
                print(msg)
                print("=" * 50 + "\n")
                dispatched_count += 1
            else:
                if self.send_message(msg):
                    dispatched_count += 1
                import time
                time.sleep(0.5)

        return dispatched_count
