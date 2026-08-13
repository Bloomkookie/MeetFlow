from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.services.meeting_service import get_meeting_by_code

def join_meeting(db: Session, meeting_code: str, display_name: str) -> tuple[Meeting, Participant]:
    meeting = get_meeting_by_code(db, meeting_code)
    
    if meeting.status == "scheduled":
        meeting.status = "active"
        
    participant = Participant(
        meeting_id=meeting.id,
        user_id=None,
        display_name=display_name,
        role="participant"
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    db.refresh(meeting)
    
    return meeting, participant

def leave_meeting(db: Session, meeting_code: str, participant_id: int) -> Participant:
    meeting = get_meeting_by_code(db, meeting_code)
    
    participant = db.query(Participant).filter(
        Participant.id == participant_id,
        Participant.meeting_id == meeting.id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
        
    if participant.left_at is None:
        participant.left_at = datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit()
        db.refresh(participant)
        
    return participant

def get_meeting_participants(db: Session, meeting_code: str) -> list[Participant]:
    meeting = get_meeting_by_code(db, meeting_code)
    
    return db.query(Participant).filter(
        Participant.meeting_id == meeting.id,
        Participant.left_at.is_(None)
    ).order_by(Participant.joined_at.asc()).all()

def toggle_mute(db: Session, meeting_code: str, participant_id: int, is_muted: bool) -> Participant:
    meeting = get_meeting_by_code(db, meeting_code)
    participant = db.query(Participant).filter(
        Participant.id == participant_id,
        Participant.meeting_id == meeting.id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
        
    participant.is_muted = 1 if is_muted else 0
    db.commit()
    db.refresh(participant)
    return participant

def mute_all(db: Session, meeting_code: str, host_id: int):
    meeting = get_meeting_by_code(db, meeting_code)
    
    # We could verify host_id here, but for now we just mute everyone except host
    participants = db.query(Participant).filter(
        Participant.meeting_id == meeting.id,
        Participant.left_at.is_(None),
        Participant.id != host_id
    ).all()
    
    for p in participants:
        p.is_muted = 1
        
    db.commit()
    return {"message": "All participants muted"}
