from typing import TypedDict, List, Optional, Any

class MeetingAnalysisState(TypedDict):
    meeting_id: int
    transcript: str
    cleaned_transcript: Optional[str]
    summary: Optional[str]
    key_decisions: List[str]
    topics: List[str]
    action_items: List[Any]  # List of AIActionItem dicts
    validation_errors: List[str]
    analysis_status: str
