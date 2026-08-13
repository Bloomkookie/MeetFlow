import random
import string
from sqlalchemy.orm import Session
from app.models.meeting import Meeting


def generate_meeting_code(db: Session) -> str:
    """
    Generate a unique meeting code in the format XXX-XXX-XXX (e.g., 482-739-152).

    Uses a loop to check for collisions against the database.
    The UNIQUE constraint on meeting_code provides an additional safety layer.
    """
    while True:
        # Generate three groups of 3 random digits
        groups = []
        for _ in range(3):
            group = "".join(random.choices(string.digits, k=3))
            groups.append(group)
        code = "-".join(groups)

        # Check if this code already exists in the database
        existing = db.query(Meeting).filter(Meeting.meeting_code == code).first()
        if existing is None:
            return code
