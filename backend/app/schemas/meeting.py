from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserResponse

class MeetingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_at: datetime
    duration: int = 60

class MeetingResponse(BaseModel):
    id: int
    meeting_code: str
    title: str
    description: Optional[str]
    scheduled_at: Optional[datetime]
    duration: int
    meeting_type: str
    status: str
    created_at: datetime
    invite_link: str
    host: UserResponse
    
    model_config = ConfigDict(from_attributes=True)
