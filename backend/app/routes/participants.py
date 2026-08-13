from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.participant import JoinMeetingRequest, ParticipantResponse
from app.services import participant_service
from app.routes.meetings import format_meeting_response

router = APIRouter(prefix="/api/meetings", tags=["participants"])

@router.post("/{meeting_code}/join")
def join_meeting(meeting_code: str, data: JoinMeetingRequest, db: Session = Depends(get_db)):
    meeting, participant = participant_service.join_meeting(db, meeting_code, data.display_name)
    return {
        "meeting": format_meeting_response(meeting),
        "participant": participant
    }

@router.post("/{meeting_code}/leave", response_model=ParticipantResponse)
def leave_meeting(meeting_code: str, participant_id: int, db: Session = Depends(get_db)):
    return participant_service.leave_meeting(db, meeting_code, participant_id)

@router.get("/{meeting_code}/participants", response_model=list[ParticipantResponse])
def get_participants(meeting_code: str, db: Session = Depends(get_db)):
    return participant_service.get_meeting_participants(db, meeting_code)

@router.post("/{meeting_code}/participants/{participant_id}/mute", response_model=ParticipantResponse)
def toggle_mute(meeting_code: str, participant_id: int, is_muted: bool, db: Session = Depends(get_db)):
    return participant_service.toggle_mute(db, meeting_code, participant_id, is_muted)

@router.post("/{meeting_code}/participants/mute_all")
def mute_all(meeting_code: str, host_id: int, db: Session = Depends(get_db)):
    return participant_service.mute_all(db, meeting_code, host_id)
