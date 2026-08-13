from datetime import datetime
from pydantic import BaseModel, ConfigDict

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    personal_meeting_id: str | None = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
