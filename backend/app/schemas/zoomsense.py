from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

# -- DB Response Schemas --

class ActionItemResponse(BaseModel):
    id: int
    meeting_id: int
    description: str
    assignee: Optional[str]
    deadline: Optional[str]
    status: str
    ai_generated: bool
    is_approved: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MeetingInsightResponse(BaseModel):
    id: int
    meeting_id: int
    summary: Optional[str]
    key_decisions: List[str]
    topics: List[str]
    analysis_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MeetingTranscriptResponse(BaseModel):
    id: int
    meeting_id: int
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# -- Request Schemas --

class TranscriptCreate(BaseModel):
    transcript: str

class ActionItemUpdate(BaseModel):
    description: Optional[str] = None
    assignee: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = None
    is_approved: Optional[bool] = None

# -- AI Structured Output Schemas (For LLM) --

class AIActionItem(BaseModel):
    description: str = Field(description="The core description of the action item.")
    assignee: Optional[str] = Field(default=None, description="The name of the person assigned to the action item, if clear.")
    deadline: Optional[str] = Field(default=None, description="The deadline for the action item, if explicitly mentioned.")

class MeetingAnalysisResult(BaseModel):
    summary: str = Field(description="A concise summary of the overall meeting.")
    key_decisions: List[str] = Field(description="A list of final decisions made during the meeting. Do NOT invent decisions; only extract explicit agreements.")
    topics: List[str] = Field(description="A list of main discussion topics covered in the meeting.")
    action_items: List[AIActionItem] = Field(description="A list of action items or tasks assigned during the meeting.")
