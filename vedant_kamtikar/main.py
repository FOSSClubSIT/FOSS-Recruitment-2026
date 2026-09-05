import argparse
import logging
import sys
from typing import Optional

from src.config import settings
from src.db_manager import DatabaseManager
from src.gmail_client import GmailClient
from src.llm_processor import LLMProcessor
from src.models import TaskItem
from src.moodle_client import MoodleAuthError, MoodleClient
from src.telegram_notifier import TelegramNotifier

# Configure console for UTF-8 emoji support
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("orchestrator")


def run_pipeline(dry_run: bool = False, force: bool = False) -> None:
    """Execute the end-to-end task ingestion, classification, and alert pipeline."""
    logger.info("=" * 60)
    logger.info("🚀 Starting Academic Task & Announcement Aggregator Agent")
    logger.info(f"🎯 Target Section: {settings.MOODLE_TARGET_BATCH} | 🧪 Dry-Run: {dry_run} | ⚡ Force: {force}")
    logger.info("=" * 60)

    # 1. Ingestion Phase
    raw_items: list[TaskItem] = []

    # Module A: Moodle LMS
    try:
        moodle = MoodleClient()
        logger.info(f"📡 Ingesting from {len(settings.active_course_ids)} active courses (CNL, DAAL, TOC, DAA, CN, Cloud Computing, Service Learning, POE, FM)...")
        moodle_items = moodle.get_upcoming_tasks(
            course_ids=settings.active_course_ids,
            max_assignment_past_days=5,
            max_notice_past_days=1,
            ignore_submitted=True,
        )
        raw_items.extend(moodle_items)
        logger.info(f"✨ Moodle ingestion completed: found {len(moodle_items)} candidate tasks.")
    except MoodleAuthError as e:
        logger.warning(f"⚠️ Moodle authentication failed (check credentials in .env): {e}")
    except Exception as e:
        logger.error(f"❌ Unexpected error during Moodle ingestion: {e}", exc_info=True)

    # Module B: Gmail
    try:
        gmail = GmailClient()
        logger.info("📧 Initiating Gmail ingestion...")
        gmail_items = gmail.fetch_recent_emails()
        raw_items.extend(gmail_items)
        logger.info(f"📩 Gmail ingestion completed: found {len(gmail_items)} candidate emails.")
    except Exception as e:
        logger.error(f"❌ Unexpected error during Gmail ingestion: {e}", exc_info=True)

    if not raw_items:
        logger.info("📭 No tasks or notices discovered from any source. Exiting.")
        return

    logger.info(f"📦 Total raw items gathered across sources: {len(raw_items)}")

    # 2. State & Deduplication Phase (Module D)
    with DatabaseManager() as db:
        if force:
            logger.info("⚡ Force flag enabled. Skipping deduplication check.")
            items_to_process = raw_items
        else:
            items_to_process = db.filter_new(raw_items)

        if not items_to_process:
            logger.info("🎉 All gathered items have already been alerted! Your inbox is up to date.")
        else:
            logger.info(f"🔥 Processing {len(items_to_process)} new / modified items.")

            # 3. Intelligence & Extraction Phase (Module C)
            logger.info("🤖 Invoking Gemini AI for urgency classification & summaries...")
            llm = LLMProcessor()
            classified_items = llm.process_items(items_to_process)

            # 4. Notification Phase (Module E)
            logger.info("📲 Dispatching notifications via Telegram...")
            notifier = TelegramNotifier()
            dispatched_count = notifier.dispatch(classified_items, dry_run=dry_run)
            logger.info(f"🔔 Notification phase finished: dispatched {dispatched_count} message(s).")

            # 5. Commit State
            if not dry_run:
                db.mark_seen_batch(classified_items)
                logger.info(f"💾 Successfully recorded {len(classified_items)} items to {settings.DATABASE_PATH}.")
            else:
                logger.info("🧪 [DRY-RUN] State changes were not persisted to database.")

        # 6. Attendance Summary Phase
        try:
            from src.attendance_client import AttendanceClient
            logger.info("📊 Fetching live Moodle student attendance report...")
            att_client = AttendanceClient()
            att_summary = att_client.fetch_attendance()
            if att_summary:
                notifier = TelegramNotifier()
                att_card = notifier.render_attendance_summary(att_summary)
                if dry_run:
                    print("\n" + "=" * 50)
                    print("[DRY-RUN TELEGRAM ATTENDANCE NOTIFICATION]")
                    print(att_card)
                    print("=" * 50 + "\n")
                else:
                    notifier.send_message(att_card)
                    logger.info("✅ Attendance summary dispatched to Telegram.")
            else:
                logger.warning("Could not retrieve attendance summary.")
        except Exception as e:
            logger.error(f"Failed to process attendance report: {e}", exc_info=True)

    logger.info("🏁 Pipeline execution finished successfully.")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Autonomous Academic Task & Announcement Aggregator Agent."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate the workflow without sending real Telegram alerts or recording to the DB.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Bypass deduplication filter to re-evaluate and re-alert all discovered items.",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable DEBUG logging output.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
    run_pipeline(dry_run=args.dry_run, force=args.force)
