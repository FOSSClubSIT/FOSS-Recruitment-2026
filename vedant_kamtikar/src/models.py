from typing import Literal, Optional
from pydantic import BaseModel, Field


class TaskItem(BaseModel):
    """Canonical representation of an academic task or announcement across sources."""
    item_id: str = Field(..., description="Unique source-specific identifier (e.g. Moodle assignment ID or Gmail msg ID)")
    title: str = Field(..., description="Task or announcement title / subject")
    source: Literal["LMS", "Gmail"] = Field(..., description="Data source portal")
    class_batch: str = Field(..., description="Target class section or batch (e.g. 'Batch C3')")
    due_date: Optional[str] = Field(None, description="ISO-like string 'YYYY-MM-DD HH:MM' or None")
    due_date_origin: Literal["moodle_api", "llm_extracted"] = Field(
        ...,
        description="Documents provenance: structured from API or extracted via Gemini"
    )
    summary: Optional[str] = Field(None, description="Concise synopsis of the announcement/task")
    urgency: Optional[Literal["high", "medium", "low"]] = Field(None, description="Judged importance level")
    action_required: Optional[bool] = Field(None, description="Whether immediate action/submission is expected")
    raw_content: Optional[str] = Field(None, description="Unprocessed body or description for downstream processing")


class LLMClassification(BaseModel):
    """Restricted schema for Gemini urgency & importance classification.
    
    Notice: Due date is strictly excluded here to prevent any accidental hallucination
    or timestamp drift on structured dates.
    """
    urgency: Literal["high", "medium", "low"] = Field(
        ...,
        description="Urgency level: high (immediate action/exam/critical deadline), medium (standard assignment/upcoming), low (routine info/optional)"
    )
    summary: str = Field(..., description="Concise 1-2 sentence factual summary of what the student must know.")
    action_required: bool = Field(..., description="True if the student must submit, respond, or take explicit action.")


class LLMDateExtraction(BaseModel):
    """Schema for Gemini due date extraction (strictly used for Gmail unstructured bodies)."""
    due_date: Optional[str] = Field(
        None,
        description="Extracted deadline formatted strictly as 'YYYY-MM-DD HH:MM', or null if no explicit deadline is stated."
    )
