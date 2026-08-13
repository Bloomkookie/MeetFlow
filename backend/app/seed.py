from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.utils.meeting_id import generate_meeting_code

def seed_db():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "user@example.com").first()
        if not user:
            user = User(name="Default User", email="user@example.com", personal_meeting_id="3607408686")
            db.add(user)
            db.commit()
            db.refresh(user)
            print("Created default user")
            
        hosted_meetings = db.query(Meeting).filter(Meeting.host_id == user.id).count()
        if hosted_meetings == 0:
            now = datetime.now()
            
            upcoming_meetings = [
                {"title": "Engineering Standup", "scheduled_at": now + timedelta(days=1, hours=10 - now.hour), "duration": 30, "description": "Daily engineering team sync"},
                {"title": "Product Planning", "scheduled_at": now + timedelta(days=2, hours=14 - now.hour), "duration": 60, "description": "Weekly product roadmap review"},
                {"title": "Design Review", "scheduled_at": now + timedelta(days=3, hours=11 - now.hour), "duration": 45, "description": "UI/UX design review session"}
            ]
            
            for m in upcoming_meetings:
                meeting = Meeting(
                    meeting_code=generate_meeting_code(db),
                    title=m["title"],
                    description=m["description"],
                    scheduled_at=m["scheduled_at"],
                    duration=m["duration"],
                    meeting_type="scheduled",
                    status="scheduled",
                    host_id=user.id
                )
                db.add(meeting)
                
            recent_meetings = [
                {"title": "Sprint Retrospective", "created_at": now - timedelta(days=2), "duration": 60},
                {"title": "Project Discussion", "created_at": now - timedelta(days=4), "duration": 45},
                {"title": "Weekly Sync", "created_at": now - timedelta(days=6), "duration": 30}
            ]
            
            for i, m in enumerate(recent_meetings):
                meeting = Meeting(
                    meeting_code=generate_meeting_code(db),
                    title=m["title"],
                    created_at=m["created_at"],
                    duration=m["duration"],
                    meeting_type="instant",
                    status="ended",
                    host_id=user.id
                )
                db.add(meeting)
                db.commit()
                db.refresh(meeting)
                
                # add participants
                for p_idx in range(1, 3):
                    participant = Participant(
                        meeting_id=meeting.id,
                        user_id=None,
                        display_name=f"Guest {p_idx}",
                        role="participant",
                        joined_at=m["created_at"],
                        left_at=m["created_at"] + timedelta(minutes=m["duration"])
                    )
                    db.add(participant)
            db.commit()
            print("Seeded meetings and participants")
    finally:
        db.close()
