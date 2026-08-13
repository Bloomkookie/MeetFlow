from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    meeting_code = Column(String, unique=True, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    scheduled_at = Column(DateTime, nullable=True)
    duration = Column(Integer, default=60)  # duration in minutes
    meeting_type = Column(String, nullable=False)  # "instant" or "scheduled"
    status = Column(String, nullable=False, default="scheduled")  # "scheduled", "active", "ended"
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship back to the host user
    host = relationship("User", back_populates="hosted_meetings")

    # A meeting can have many participants
    participants = relationship("Participant", back_populates="meeting", cascade="all, delete-orphan")
