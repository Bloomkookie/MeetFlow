from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.zoomsense import TranscriptCreate, ActionItemUpdate, MeetingTranscriptResponse
from app.services import zoomsense_service

router = APIRouter(prefix="/api", tags=["ZoomSense"])

@router.post("/meetings/{meeting_code}/transcript", response_model=MeetingTranscriptResponse)
def submit_transcript(meeting_code: str, transcript_data: TranscriptCreate, db: Session = Depends(get_db)):
    """Submit a transcript for a meeting."""
    return zoomsense_service.submit_transcript(db, meeting_code, transcript_data.transcript)

@router.post("/meetings/{meeting_code}/analyze")
def trigger_analysis(meeting_code: str, db: Session = Depends(get_db)):
    """Triggers the ZoomSense AI analysis on a meeting transcript."""
    return zoomsense_service.analyze_meeting(db, meeting_code)

@router.get("/meetings/{meeting_code}/insights")
def get_meeting_insights(meeting_code: str, db: Session = Depends(get_db)):
    """Retrieve the AI generated insights and action items for a meeting."""
    insights = zoomsense_service.get_insights(db, meeting_code)
    if not insights:
        raise HTTPException(status_code=404, detail="Insights not found for this meeting")
    return insights

@router.patch("/action-items/{action_item_id}")
def update_action_item(action_item_id: int, updates: ActionItemUpdate, db: Session = Depends(get_db)):
    """Approve, edit, or dismiss an action item."""
    return zoomsense_service.update_action_item(db, action_item_id, updates.model_dump(exclude_unset=True))

@router.post("/action-items/{action_item_id}/approve")
def approve_action_item(action_item_id: int, db: Session = Depends(get_db)):
    """Approve an AI generated action item."""
    return zoomsense_service.update_action_item(db, action_item_id, {"is_approved": True})

@router.delete("/action-items/{action_item_id}")
def dismiss_action_item(action_item_id: int, db: Session = Depends(get_db)):
    """Dismiss/delete an action item."""
    return zoomsense_service.update_action_item(db, action_item_id, {"status": "dismissed"})

@router.get("/meetings/history/search")
def search_history(query: str = "", limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    """Search meeting history and insights."""
    return zoomsense_service.search_meeting_history(db, query, limit, offset)

@router.delete("/zoomsense/history")
def clear_all_insights_route(db: Session = Depends(get_db)):
    """Clear all AI generated insights, action items, and transcripts."""
    return zoomsense_service.clear_all_insights(db)
