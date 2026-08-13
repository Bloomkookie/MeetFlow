# Import all models so Base.metadata.create_all() discovers them
from app.models.user import User
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.settings import UserSettings
from app.models.zoomsense import MeetingTranscript, MeetingInsight, ActionItem

__all__ = ["User", "Meeting", "Participant", "UserSettings", "MeetingTranscript", "MeetingInsight", "ActionItem"]
