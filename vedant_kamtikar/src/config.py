import os
from pathlib import Path
from dataclasses import dataclass
from dotenv import load_dotenv

# Project root directory
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Load .env file from project root if present
load_dotenv(PROJECT_ROOT / ".env")


@dataclass(frozen=True)
class Settings:
    """Centralized, type-hinted application settings."""
    # Moodle Settings
    MOODLE_BASE_URL: str = os.getenv("MOODLE_BASE_URL", "").rstrip("/")
    MOODLE_USERNAME: str = os.getenv("MOODLE_USERNAME", "")
    MOODLE_PASSWORD: str = os.getenv("MOODLE_PASSWORD", "")
    MOODLE_SERVICE_SHORTNAME: str = os.getenv("MOODLE_SERVICE_SHORTNAME", "moodle_mobile_app")
    MOODLE_TARGET_BATCH: str = os.getenv("MOODLE_TARGET_BATCH", "Batch C3")
    MOODLE_COURSE_IDS: str = os.getenv("MOODLE_COURSE_IDS", "2777,2778,2779,2780,2781,2782,2783,2784,2786")

    @property
    def active_course_ids(self) -> list[int]:
        """Return target course IDs (defaults to the 9 active semester courses: CNL, DAAL, TOC, DAA, CN, Cloud Computing, Service Learning, POE, FM)."""
        if self.MOODLE_COURSE_IDS.strip():
            return [int(cid.strip()) for cid in self.MOODLE_COURSE_IDS.split(",") if cid.strip().isdigit()]
        return [2777, 2778, 2779, 2780, 2781, 2782, 2783, 2784, 2786]

    # Gemini Settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    # Telegram Settings
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_CHAT_ID: str = os.getenv("TELEGRAM_CHAT_ID", "")
    URGENT_THRESHOLD_HOURS: int = int(os.getenv("URGENT_THRESHOLD_HOURS", "48"))

    # Gmail Settings
    GMAIL_CREDENTIALS_PATH: Path = PROJECT_ROOT / os.getenv("GMAIL_CREDENTIALS_PATH", "credentials/credentials.json")
    GMAIL_TOKEN_PATH: Path = PROJECT_ROOT / os.getenv("GMAIL_TOKEN_PATH", "credentials/token.json")
    GMAIL_SEARCH_QUERY: str = os.getenv("GMAIL_SEARCH_QUERY", "label:UNREAD newer_than:1d")

    # Database
    DATABASE_PATH: Path = PROJECT_ROOT / os.getenv("DATABASE_PATH", "data/notifications.db")

    @property
    def parsed_course_ids(self) -> list[int]:
        """Parse comma-separated course IDs if provided."""
        if not self.MOODLE_COURSE_IDS.strip():
            return []
        ids = []
        for part in self.MOODLE_COURSE_IDS.split(","):
            part = part.strip()
            if part.isdigit():
                ids.append(int(part))
        return ids


# Global singleton instance
settings = Settings()
