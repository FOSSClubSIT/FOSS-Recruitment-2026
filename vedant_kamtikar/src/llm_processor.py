from concurrent.futures import ThreadPoolExecutor
import json
import logging
import time
from typing import Optional

from src.config import settings
from src.models import LLMClassification, LLMDateExtraction, TaskItem

logger = logging.getLogger(__name__)

# Try importing the Google GenAI SDK
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    genai = None  # type: ignore
    types = None  # type: ignore
    GENAI_AVAILABLE = False


class LLMProcessor:
    """Processes academic tasks using Google Gemini while strictly guarding structured dates.
    
    Principles:
    1. The LLM judges urgency, creates summaries, and flags action required.
    2. LMS / Moodle due dates are API-native and NEVER exposed to the LLM for modification.
    3. Gmail due dates are extracted via LLM from unstructured email bodies.
    4. Robust fallback logic ensures the ingestion pipeline continues even if API is unreachable.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        client: Optional[object] = None,
    ):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL
        self._client = client

    @property
    def client(self):
        """Lazy-initialize or return the GenAI client."""
        if self._client is not None:
            return self._client

        if not GENAI_AVAILABLE:
            logger.warning("google-genai package is not installed. LLMProcessor running in fallback mode.")
            return None

        if not self.api_key:
            logger.warning("GEMINI_API_KEY is not set. LLMProcessor running in fallback mode.")
            return None

        try:
            self._client = genai.Client(api_key=self.api_key)
            return self._client
        except Exception as e:
            logger.error(f"Failed to initialize GenAI client: {e}")
            return None

    def classify_item(self, title: str, content: Optional[str]) -> LLMClassification:
        """Classify urgency and generate a summary using Gemini structured output."""
        client = self.client
        if client is None:
            return self._fallback_classification(title, content)

        prompt = (
            "You are a sharp friend texting a classmate in Batch C3 a quick heads-up.\n"
            f"Title: {title}\n"
            f"Content:\n{content or 'No additional details provided.'}\n\n"
            "Guidelines:\n"
            "- urgency: 'high' for exams, sudden tests, tight lab deadlines (<48h), or critical notices. "
            "'medium' for regular lab assignments, homework, and normal coursework. "
            "'low' for informational notices.\n"
            "- summary: 1-2 dry, casual sentences giving the TL;DR of what they need to know or do.\n"
            "TONE RULES:\n"
            "1. Write like a sharp friend texting a heads-up, not a school system. Casual, dry, slightly deadpan.\n"
            "2. Use contractions always (you're, that's, don't, won't).\n"
            "3. Dry understatement over hype. Reference stakes casually (e.g. 'skip one more and you're under the line'). No exclamation points.\n"
            "4. NEVER start with greetings ('Hey', 'Hi', 'Hello', 'Yo'). Dive straight into the point.\n"
            "5. NO forced slang or cringe phrases ('no cap', 'bestie', 'it's giving', 'lowkey/highkey'). If unsure, say it plainly and casually.\n"
            "6. Keep under 25 words. Do not repeat the title. Do not mention yourself or AI.\n"
            "7. If action is needed, tell them what to do directly.\n"
            "- action_required: true if they actually have to submit or attend something; false if it's just an FYI."
        )

        try:
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=LLMClassification,
                temperature=0.3,
            )
            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config,
            )

            # Access parsed Pydantic object if supported, else parse text JSON
            if hasattr(response, "parsed") and response.parsed is not None:
                if isinstance(response.parsed, LLMClassification):
                    return response.parsed
                if isinstance(response.parsed, dict):
                    return LLMClassification(**response.parsed)

            raw_text = response.text or "{}"
            data = json.loads(raw_text)
            return LLMClassification(**data)

        except Exception as e:
            logger.error(f"Gemini classification call failed for '{title}': {e}. Using fallback.")
            return self._fallback_classification(title, content)

    def extract_due_date_from_email(self, title: str, body: str) -> Optional[str]:
        """Extract a structured deadline timestamp from unstructured Gmail body text.
        
        Notice: Strictly used for Gmail items where no API-native deadline exists.
        """
        client = self.client
        if client is None:
            return None

        prompt = (
            "You are a date extraction assistant.\n"
            "Extract any explicit submission deadline or exam date mentioned in the following academic email.\n"
            f"Subject: {title}\n"
            f"Body:\n{body}\n\n"
            "Instructions:\n"
            "- Output the due date formatted strictly as 'YYYY-MM-DD HH:MM'.\n"
            "- If a time is omitted, default to 23:59.\n"
            "- If no specific deadline or submission date is mentioned in the text, set due_date to null."
        )

        try:
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=LLMDateExtraction,
                temperature=0.0,
            )
            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config,
            )

            if hasattr(response, "parsed") and response.parsed is not None:
                if isinstance(response.parsed, LLMDateExtraction):
                    return response.parsed.due_date
                if isinstance(response.parsed, dict):
                    return response.parsed.get("due_date")

            raw_text = response.text or "{}"
            data = json.loads(raw_text)
            return data.get("due_date")

        except Exception as e:
            logger.error(f"Gemini date extraction failed for '{title}': {e}.")
            return None

    def process_items(self, items: list[TaskItem]) -> list[TaskItem]:
        """Process a list of TaskItem objects with appropriate LLM judgment.
        
        Strict safety guarantee:
        - Moodle items retain their original API-native due_date unchanged.
        - Gmail items obtain their due_date via extract_due_date_from_email().
        """
        def process_single(item: TaskItem) -> TaskItem:
            # 1. Classification (All sources)
            classification = self.classify_item(item.title, item.raw_content)
            item.urgency = classification.urgency
            item.summary = classification.summary
            item.action_required = classification.action_required

            # 2. Date handling by provenance
            if item.source == "Gmail":
                extracted_date = self.extract_due_date_from_email(
                    item.title,
                    item.raw_content or ""
                )
                item.due_date = extracted_date
                item.due_date_origin = "llm_extracted"
            elif item.source == "LMS":
                assert item.due_date_origin == "moodle_api", (
                    f"Integrity violation: LMS item {item.item_id} has invalid origin {item.due_date_origin}"
                )

            return item

        with ThreadPoolExecutor(max_workers=3) as executor:
            processed = list(executor.map(process_single, items))

        return processed

    @staticmethod
    def _fallback_classification(title: str, content: Optional[str]) -> LLMClassification:
        """Deterministic rule-based fallback when Gemini API is unavailable."""
        text = f"{title} {content or ''}".lower()

        # High urgency keywords
        if any(w in text for w in ["exam", "test", "urgent", "immediate", "viva", "today", "tomorrow"]):
            urgency = "high"
            action = True
        elif any(w in text for w in ["assignment", "submission", "due", "lab", "deadline", "project"]):
            urgency = "medium"
            action = True
        else:
            urgency = "low"
            action = False

        summary = f"{title}. Check LMS or email portal for full details."
        return LLMClassification(
            urgency=urgency,
            summary=summary,
            action_required=action,
        )
