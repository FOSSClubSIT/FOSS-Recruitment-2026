import hashlib
import logging
import sqlite3
from pathlib import Path
from typing import Optional, Union

from src.config import settings
from src.models import TaskItem

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Manages SQLite storage for deduplication and notification history."""

    def __init__(self, db_path: Optional[Union[str, Path]] = None):
        self.db_path = str(db_path or settings.DATABASE_PATH)
        self._conn: Optional[sqlite3.Connection] = None
        self._ensure_dir()
        self.init_db()

    def _ensure_dir(self) -> None:
        """Ensure parent directory exists if using a file path."""
        if self.db_path != ":memory:":
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)

    def get_connection(self) -> sqlite3.Connection:
        """Return an active connection, creating one if necessary."""
        if self._conn is None:
            self._conn = sqlite3.connect(self.db_path)
            self._conn.row_factory = sqlite3.Row
        return self._conn

    def close(self) -> None:
        """Close active database connection."""
        if self._conn is not None:
            self._conn.close()
            self._conn = None

    def __enter__(self) -> "DatabaseManager":
        self.get_connection()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.close()

    def init_db(self) -> None:
        """Create tables and indexes if they do not already exist."""
        conn = self.get_connection()
        with conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS processed_items (
                    id              INTEGER PRIMARY KEY AUTOINCREMENT,
                    item_hash       TEXT UNIQUE NOT NULL,
                    source          TEXT NOT NULL,
                    item_id         TEXT NOT NULL,
                    title           TEXT,
                    due_date        TEXT,
                    processed_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
            )
            conn.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_processed_hash
                ON processed_items(item_hash);
                """
            )
        logger.debug(f"Initialized database schema at {self.db_path}")

    @staticmethod
    def compute_hash(item: TaskItem) -> str:
        """Compute MD5 hash uniquely identifying an item and its deadline state.
        
        Formula: MD5(source + item_id + due_date)
        If due_date changes (e.g. deadline extended), the hash shifts and triggers an alert.
        """
        raw_key = f"{item.source}:{item.item_id}:{item.due_date or 'NONE'}"
        return hashlib.md5(raw_key.encode("utf-8")).hexdigest()

    def is_seen(self, item: TaskItem) -> bool:
        """Check if an item with identical ID and due date was already processed."""
        item_hash = self.compute_hash(item)
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM processed_items WHERE item_hash = ? LIMIT 1;", (item_hash,))
        return cursor.fetchone() is not None

    def mark_seen(self, item: TaskItem) -> None:
        """Record an item as processed."""
        item_hash = self.compute_hash(item)
        conn = self.get_connection()
        with conn:
            conn.execute(
                """
                INSERT OR IGNORE INTO processed_items (item_hash, source, item_id, title, due_date)
                VALUES (?, ?, ?, ?, ?);
                """,
                (item_hash, item.source, item.item_id, item.title, item.due_date),
            )
        logger.debug(f"Marked as seen: {item.item_id} (hash: {item_hash})")

    def mark_seen_batch(self, items: list[TaskItem]) -> None:
        """Batch record multiple items as processed."""
        if not items:
            return
        records = [
            (self.compute_hash(it), it.source, it.item_id, it.title, it.due_date)
            for it in items
        ]
        conn = self.get_connection()
        with conn:
            conn.executemany(
                """
                INSERT OR IGNORE INTO processed_items (item_hash, source, item_id, title, due_date)
                VALUES (?, ?, ?, ?, ?);
                """,
                records,
            )
        logger.info(f"Marked batch of {len(items)} items as processed in DB.")

    def filter_new(self, items: list[TaskItem]) -> list[TaskItem]:
        """Filter a list of items, returning only previously unseen items."""
        if not items:
            return []

        # Precompute hashes
        item_map = {self.compute_hash(it): it for it in items}
        hashes = list(item_map.keys())

        # Query all matching hashes in chunks to prevent SQLite parameter limits
        chunk_size = 500
        seen_hashes = set()
        conn = self.get_connection()

        for i in range(0, len(hashes), chunk_size):
            chunk = hashes[i : i + chunk_size]
            placeholders = ",".join(["?"] * len(chunk))
            cursor = conn.cursor()
            cursor.execute(
                f"SELECT item_hash FROM processed_items WHERE item_hash IN ({placeholders});",
                chunk,
            )
            for row in cursor.fetchall():
                seen_hashes.add(row[0])

        new_items = [it for it in items if self.compute_hash(it) not in seen_hashes]
        logger.info(f"Deduplication complete: {len(new_items)} new / {len(items)} total items.")
        return new_items

    def get_history(self, limit: int = 50) -> list[dict]:
        """Fetch recent processed items for diagnostics."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, item_hash, source, item_id, title, due_date, processed_at
            FROM processed_items
            ORDER BY id DESC
            LIMIT ?;
            """,
            (limit,),
        )
        return [dict(row) for row in cursor.fetchall()]
