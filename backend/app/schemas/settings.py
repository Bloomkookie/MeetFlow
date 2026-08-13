from pydantic import BaseModel
from datetime import datetime

class UserSettingsBase(BaseModel):
    default_camera_enabled: bool = True
    default_microphone_enabled: bool = True
    preferred_theme: str = "dark"

class UserSettingsCreate(UserSettingsBase):
    pass

class UserSettingsResponse(UserSettingsBase):
    id: int
    user_id: int
    updated_at: datetime

    class Config:
        from_attributes = True
