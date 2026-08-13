from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    personal_meeting_id = Column(String, unique=True, nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # A user can host many meetings
    hosted_meetings = relationship("Meeting", back_populates="host")

    # A user can participate in many meetings
    participations = relationship("Participant", back_populates="user")
