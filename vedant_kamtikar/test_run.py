"""Simulate an end-to-end run with sample Batch C3 tasks.
Tests Gemini classification + Telegram delivery using your actual credentials in .env.
"""
from datetime import datetime, timedelta, timezone
from src.config import settings
from src.db_manager import DatabaseManager
from src.llm_processor import LLMProcessor
from src.models import TaskItem
from src.telegram_notifier import TelegramNotifier

print("=" * 60)
print("Running Live Test with Sample Batch C3 Tasks")
print(f"Telegram Bot: {settings.TELEGRAM_BOT_TOKEN[:10]}... | Chat ID: {settings.TELEGRAM_CHAT_ID}")
print(f"Gemini Model: {settings.GEMINI_MODEL}")
print("=" * 60)

# 1. Create 2 sample tasks (one urgent within 24h, one regular digest)
tomorrow = (datetime.now(timezone.utc) + timedelta(hours=18)).strftime("%Y-%m-%d %H:%M")
next_week = (datetime.now(timezone.utc) + timedelta(days=5)).strftime("%Y-%m-%d %H:%M")

sample_items = [
    TaskItem(
        item_id="test_assign_101",
        title="[Operating Systems] Lab 4: Semaphore Implementation",
        source="LMS",
        class_batch="Batch C3",
        due_date=tomorrow,
        due_date_origin="moodle_api",
        raw_content="Attention Batch C3 students: Lab 4 submission is due tomorrow. Implement producer-consumer problem using POSIX semaphores. Late submissions will not be accepted.",
    ),
    TaskItem(
        item_id="test_notice_102",
        title="[Database Management Systems] Notice: Surprise Quiz Announcement",
        source="LMS",
        class_batch="Batch C3",
        due_date=None,
        due_date_origin="moodle_api",
        raw_content="Dear Students of Batch C3, tomorrow during the lab slot there will be a mandatory 20-minute surprise evaluation quiz covering SQL joins and normalization.",
    ),
]

print(f"\n1. Ingestion: Created {len(sample_items)} sample Moodle items for Batch C3.")

# 2. Intelligence & Classification with Gemini
print("\n2. Processing with Gemini...")
llm = LLMProcessor()
classified = llm.process_items(sample_items)
for it in classified:
    print(f"   -> [{it.urgency.upper()}] {it.title}")
    print(f"      Summary: {it.summary}")
    print(f"      Action Required: {it.action_required}")

# 3. Telegram Dispatch
print("\n3. Dispatching to your Telegram phone...")
notifier = TelegramNotifier()
sent_count = notifier.dispatch(classified, dry_run=False)

print(f"\n[SUCCESS] Done! Sent {sent_count} alert(s) to your Telegram.")
