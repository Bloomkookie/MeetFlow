import os
import sys

# Add the project root to python path so app modules can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.settings import UserSettings
from datetime import datetime, timezone, timedelta

def reset_database():
    print("WARNING: This is a destructive operation.")
    print("Dropping all existing tables in the local development database...")
    
    # Drop all tables and recreate them
    Base.metadata.drop_all(bind=engine)
    print("Creating fresh tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Seeding fresh default Demo User...")
        # Create a single default demo user
        demo_user = User(
            name="Demo User",
            email="demo@example.com"
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        
        # Create default settings for this user
        settings = UserSettings(
            user_id=demo_user.id,
            default_camera_enabled=True,
            default_microphone_enabled=True,
            preferred_theme="dark"
        )
        db.add(settings)
        
        # Optional: Seed one recent meeting just to have some UI content
        recent_meeting = Meeting(
            meeting_code="meet-abcd-1234",
            title="Project Kickoff",
            host_id=demo_user.id,
            scheduled_at=datetime.now(timezone.utc) - timedelta(days=1),
            meeting_type="scheduled",
            status="ended"
        )
        db.add(recent_meeting)
        
        db.commit()
        print(f"Database successfully reset and seeded. Demo User ID: {demo_user.id}")
        
    except Exception as e:
        print(f"Error during database reset: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_database()
