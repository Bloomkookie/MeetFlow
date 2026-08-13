from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.settings import UserSettings
from app.schemas.settings import UserSettingsBase, UserSettingsResponse

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/{user_id}/settings", response_model=UserSettingsResponse)
def get_user_settings(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    
    if not settings:
        # Create default settings if they don't exist
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
        
    return settings

@router.put("/{user_id}/settings", response_model=UserSettingsResponse)
def update_user_settings(user_id: int, settings_update: UserSettingsBase, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        
    settings.default_camera_enabled = settings_update.default_camera_enabled
    settings.default_microphone_enabled = settings_update.default_microphone_enabled
    settings.preferred_theme = settings_update.preferred_theme
    
    db.commit()
    db.refresh(settings)
    
    return settings
