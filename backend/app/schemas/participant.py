from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class JoinMeetingRequest(BaseModel):
    display_name: str = Field(min_length=1, max_length=100)

class ParticipantResponse(BaseModel):
    id: int
    display_name: str
    role: str
    is_muted: int
    joined_at: datetime
    left_at: Optional[datetime]
    meeting_id: int
    
    model_config = ConfigDict(from_attributes=True)
