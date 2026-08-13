from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.meeting import MeetingCreate, MeetingResponse
from app.services import meeting_service
from app.config import settings

router = APIRouter(prefix="/api/meetings", tags=["meetings"])

def format_meeting_response(meeting) -> dict:
    return {
        "id": meeting.id,
        "meeting_code": meeting.meeting_code,
        "title": meeting.title,
        "description": meeting.description,
        "scheduled_at": meeting.scheduled_at,
        "duration": meeting.duration,
        "meeting_type": meeting.meeting_type,
        "status": meeting.status,
        "created_at": meeting.created_at,
        "invite_link": f"{settings.FRONTEND_BASE_URL}/meeting/{meeting.meeting_code}",
        "host": meeting.host
    }

@router.post("/instant")
def create_instant(db: Session = Depends(get_db)):
    meeting, participant = meeting_service.create_instant_meeting(db)
    response = format_meeting_response(meeting)
    response["participant_id"] = participant.id
    return response

@router.post("/", response_model=MeetingResponse)
def create_scheduled(data: MeetingCreate, db: Session = Depends(get_db)):
    meeting = meeting_service.create_scheduled_meeting(db, data)
    return format_meeting_response(meeting)

@router.get("/upcoming", response_model=list[MeetingResponse])
def get_upcoming(db: Session = Depends(get_db)):
    meetings = meeting_service.get_upcoming_meetings(db)
    return [format_meeting_response(m) for m in meetings]

@router.get("/recent", response_model=list[MeetingResponse])
def get_recent(db: Session = Depends(get_db)):
    meetings = meeting_service.get_recent_meetings(db)
    return [format_meeting_response(m) for m in meetings]

@router.delete("/history")
def clear_history(db: Session = Depends(get_db)):
    meeting_service.clear_recent_meetings(db)
    return {"status": "success", "message": "History cleared"}

@router.get("/{meeting_code}", response_model=MeetingResponse)
def get_meeting(meeting_code: str, db: Session = Depends(get_db)):
    meeting = meeting_service.get_meeting_by_code(db, meeting_code)
    return format_meeting_response(meeting)
