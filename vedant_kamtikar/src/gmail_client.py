import base64
import logging
from typing import Optional

from src.config import settings
from src.models import TaskItem

logger = logging.getLogger(__name__)


class GmailClient:
    """Ingests academic email notifications via Gmail API (Module B stub).
    
    Extracts unread messages matching academic keywords or domain filters.
    In the pipeline, Gmail items produce raw TaskItem objects with:
      - source="Gmail"
      - due_date=None
      - due_date_origin="llm_extracted" (to be filled by Module C's date extractor)
    """

    def __init__(
        self,
        credentials_path: Optional[str] = None,
        token_path: Optional[str] = None,
        search_query: Optional[str] = None,
    ):
        self.credentials_path = credentials_path or settings.GMAIL_CREDENTIALS_PATH
        self.token_path = token_path or settings.GMAIL_TOKEN_PATH
        self.search_query = search_query or settings.GMAIL_SEARCH_QUERY
        self._service = None

    def authenticate(self):
        """Authenticate via Google OAuth 2.0 and return Gmail service resource."""
        # NOTE: When Google OAuth credentials (credentials.json) are provided,
        # this method initializes google.oauth2.credentials.Credentials and builds
        # googleapiclient.discovery.build('gmail', 'v1', credentials=creds).
        if not self.credentials_path.exists() and not self.token_path.exists():
            logger.info(
                f"Gmail credentials not found at {self.credentials_path}. "
                "Gmail ingestion will be skipped until OAuth credentials are configured."
            )
            return None
        logger.info("Gmail OAuth setup detected.")
        return None

    def fetch_recent_emails(self) -> list[TaskItem]:
        """Fetch unread messages matching the search query and extract MIME plain text."""
        service = self.authenticate()
        if service is None:
            logger.debug("Gmail client inactive (awaiting credentials). Returning empty list.")
            return []

        # Placeholder for full OAuth extraction loop:
        # 1. service.users().messages().list(userId='me', q=self.search_query).execute()
        # 2. For each msg: fetch payload, decode URL-safe base64 text/plain parts.
        # 3. Yield TaskItem(..., source="Gmail", due_date=None, due_date_origin="llm_extracted")
        return []
