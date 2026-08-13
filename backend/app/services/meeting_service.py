from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.schemas.meeting import MeetingCreate
from app.utils.meeting_id import generate_meeting_code
from app.config import settings

def get_default_user(db: Session) -> User:
    user = db.query(User).filter(User.id == settings.DEFAULT_USER_ID).first()
    if not user:
        raise HTTPException(status_code=404, detail="Default user not found")
    return user

def create_instant_meeting(db: Session) -> tuple[Meeting, Participant]:
    user = get_default_user(db)
    meeting_code = generate_meeting_code(db)
    
    meeting = Meeting(
        meeting_code=meeting_code,
        title=f"Instant Meeting - {user.name}",
        meeting_type="instant",
        status="active",
        host_id=user.id,
        duration=60
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    
    participant = Participant(
        meeting_id=meeting.id,
        user_id=user.id,
        display_name=user.name,
        role="host"
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    
    return meeting, participant

def create_scheduled_meeting(db: Session, data: MeetingCreate) -> Meeting:
    now = datetime.now(timezone.utc)
    scheduled_at_aware = data.scheduled_at if data.scheduled_at.tzinfo else data.scheduled_at.replace(tzinfo=timezone.utc)
    if scheduled_at_aware < now:
        raise HTTPException(status_code=400, detail="Scheduled time must be in the future")
        
    user = get_default_user(db)
    meeting_code = generate_meeting_code(db)
    
    meeting = Meeting(
        meeting_code=meeting_code,
        title=data.title,
        description=data.description,
        scheduled_at=data.scheduled_at.replace(tzinfo=None),
        duration=data.duration,
        meeting_type="scheduled",
        status="scheduled",
        host_id=user.id
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    
    return meeting

def get_meeting_by_code(db: Session, meeting_code: str) -> Meeting:
    meeting = db.query(Meeting).filter(Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

def get_upcoming_meetings(db: Session) -> list[Meeting]:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    return db.query(Meeting).filter(
        Meeting.meeting_type == "scheduled",
        Meeting.status == "scheduled",
        Meeting.scheduled_at > now
    ).order_by(Meeting.scheduled_at.asc()).all()

def get_recent_meetings(db: Session) -> list[Meeting]:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    return db.query(Meeting).filter(
        (Meeting.status == "ended") | 
        ((Meeting.status == "active") & (Meeting.created_at < now))
    ).order_by(Meeting.created_at.desc()).limit(10).all()

def clear_recent_meetings(db: Session) -> None:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    meetings = db.query(Meeting).filter(
        (Meeting.status == "ended") | 
        ((Meeting.status == "active") & (Meeting.created_at < now))
    ).all()
    
    for m in meetings:
        db.delete(m)
    db.commit()
