from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class MeetingTranscript(Base):
    __tablename__ = "meeting_transcripts"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False, unique=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    meeting = relationship("Meeting", backref="transcript")

class MeetingInsight(Base):
    __tablename__ = "meeting_insights"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False, unique=True)
    
    summary = Column(Text, nullable=True)
    # Storing lists as JSON-encoded strings for SQLite simplicity
    key_decisions = Column(Text, nullable=True) 
    topics = Column(Text, nullable=True)
    
    analysis_status = Column(String, default="pending") # pending, processing, completed, failed
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    meeting = relationship("Meeting", backref="insight")

class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    
    description = Column(Text, nullable=False)
    assignee = Column(String, nullable=True)
    deadline = Column(String, nullable=True)
    
    status = Column(String, default="pending") # pending, completed, dismissed
    ai_generated = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    meeting = relationship("Meeting", backref="action_items")
