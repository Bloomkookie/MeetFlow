import json
from sqlalchemy.orm import Session
from app.models.meeting import Meeting
from app.models.zoomsense import MeetingTranscript, MeetingInsight, ActionItem
from app.ai.graph import run_zoomsense_analysis
from fastapi import HTTPException
from sqlalchemy import or_

def submit_transcript(db: Session, meeting_code: str, content: str):
    """Saves a meeting transcript."""
    meeting = db.query(Meeting).filter(Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting_id = meeting.id

    transcript = db.query(MeetingTranscript).filter(MeetingTranscript.meeting_id == meeting_id).first()
    if transcript:
        transcript.content = content
    else:
        transcript = MeetingTranscript(meeting_id=meeting_id, content=content)
        db.add(transcript)
    
    db.commit()
    db.refresh(transcript)
    return transcript

def analyze_meeting(db: Session, meeting_code: str):
    """Triggers the AI analysis workflow."""
    meeting = db.query(Meeting).filter(Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting_id = meeting.id
        
    transcript = db.query(MeetingTranscript).filter(MeetingTranscript.meeting_id == meeting_id).first()
    if not transcript or not transcript.content.strip():
        raise HTTPException(status_code=400, detail="Transcript not available or empty")
        
    # Check if we already have an active/completed analysis to prevent duplicates
    existing_insight = db.query(MeetingInsight).filter(MeetingInsight.meeting_id == meeting_id).first()
    if existing_insight and existing_insight.analysis_status == "processing":
        raise HTTPException(status_code=409, detail="Analysis is already in progress")
        
    if not existing_insight:
        insight = MeetingInsight(meeting_id=meeting_id, analysis_status="processing")
        db.add(insight)
    else:
        insight = existing_insight
        insight.analysis_status = "processing"
        
    db.commit()
    db.refresh(insight)
    
    # Run the LangGraph workflow
    # In a production environment, this should ideally be pushed to Celery/Redis
    # For now, it runs synchronously.
    result_state = run_zoomsense_analysis(meeting_id, transcript.content)
    
    if result_state["analysis_status"] == "failed":
        insight.analysis_status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {result_state.get('validation_errors', [])}")
        
    # Save insights
    insight.summary = result_state.get("summary")
    insight.key_decisions = json.dumps(result_state.get("key_decisions", []))
    insight.topics = json.dumps(result_state.get("topics", []))
    insight.analysis_status = "completed"
    
    # Save Action Items
    # First clear old AI generated action items if this is a re-run
    db.query(ActionItem).filter(ActionItem.meeting_id == meeting_id, ActionItem.ai_generated == True).delete()
    
    action_items_data = result_state.get("action_items", [])
    for ai_item in action_items_data:
        db_item = ActionItem(
            meeting_id=meeting_id,
            description=ai_item.get("description", ""),
            assignee=ai_item.get("assignee"),
            deadline=ai_item.get("deadline"),
            status="pending",
            ai_generated=True,
            is_approved=False
        )
        db.add(db_item)
        
    db.commit()
    return get_insights(db, meeting_code)

def get_insights(db: Session, meeting_code: str):
    """Retrieves insights and action items for a meeting."""
    meeting = db.query(Meeting).filter(Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting_id = meeting.id

    insight = db.query(MeetingInsight).filter(MeetingInsight.meeting_id == meeting_id).first()
    if not insight:
        return None
        
    action_items = db.query(ActionItem).filter(ActionItem.meeting_id == meeting_id).all()
    
    return {
        "id": insight.id,
        "meeting_id": insight.meeting_id,
        "summary": insight.summary,
        "key_decisions": json.loads(insight.key_decisions) if insight.key_decisions else [],
        "topics": json.loads(insight.topics) if insight.topics else [],
        "analysis_status": insight.analysis_status,
        "created_at": insight.created_at,
        "updated_at": insight.updated_at,
        "action_items": action_items
    }

def update_action_item(db: Session, item_id: int, updates: dict):
    """Updates an action item (e.g. approve, edit, dismiss)."""
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
        
    for key, value in updates.items():
        if value is not None:
            setattr(item, key, value)
            
    db.commit()
    db.refresh(item)
    return item

def search_meeting_history(db: Session, query: str = "", limit: int = 10, offset: int = 0):
    """Searches meeting history using basic SQLite querying on title and insights."""
    base_query = db.query(Meeting).outerjoin(MeetingInsight)
    
    if query:
        search_term = f"%{query}%"
        base_query = base_query.filter(
            or_(
                Meeting.title.ilike(search_term),
                Meeting.description.ilike(search_term),
                MeetingInsight.summary.ilike(search_term),
                MeetingInsight.topics.ilike(search_term),
                MeetingInsight.key_decisions.ilike(search_term)
            )
        )
        
    meetings = base_query.order_by(Meeting.created_at.desc()).offset(offset).limit(limit).all()
    
    results = []
    for m in meetings:
        insight = db.query(MeetingInsight).filter(MeetingInsight.meeting_id == m.id).first()
        results.append({
            "meeting": m,
            "has_transcript": db.query(MeetingTranscript).filter(MeetingTranscript.meeting_id == m.id).count() > 0,
            "analysis_status": insight.analysis_status if insight else None
        })
        
    return results

def clear_all_insights(db: Session):
    """Deletes all MeetingInsight, ActionItem, and MeetingTranscript records."""
    db.query(ActionItem).delete()
    db.query(MeetingInsight).delete()
    db.query(MeetingTranscript).delete()
    db.commit()
    return {"message": "All insights history cleared"}
