import os
from langchain_google_genai import ChatGoogleGenerativeAI
from app.ai.state import MeetingAnalysisState
from app.schemas.zoomsense import MeetingAnalysisResult
from app.ai.prompts import ANALYSIS_PROMPT
from app.config import settings
from pydantic import ValidationError

# Node: Prepare Transcript
def load_or_prepare_transcript(state: MeetingAnalysisState) -> MeetingAnalysisState:
    """Prepares the transcript by doing basic cleaning if necessary."""
    raw_transcript = state.get("transcript", "")
    # Basic cleaning could go here
    cleaned = raw_transcript.strip()
    return {"cleaned_transcript": cleaned}

# Node: Analyze Meeting
def analyze_meeting(state: MeetingAnalysisState) -> MeetingAnalysisState:
    """Calls the LLM to extract structured insights from the transcript."""
    transcript = state.get("cleaned_transcript") or state.get("transcript", "")
    
    if not transcript:
        return {"analysis_status": "failed", "validation_errors": ["Empty transcript"]}
        
    try:
        # We use strict structured output from LangChain
        # Configure model from settings, or fallback
        model_name = settings.LLM_MODEL or "gemini-1.5-flash"
        api_key = settings.GEMINI_API_KEY
        
        # If no API key, we fail gracefully rather than crashing the app
        if not api_key:
             return {"analysis_status": "failed", "validation_errors": ["GEMINI_API_KEY is not configured"]}

        llm = ChatGoogleGenerativeAI(model=model_name, google_api_key=api_key, temperature=0.2)
        structured_llm = llm.with_structured_output(MeetingAnalysisResult)
        
        prompt = ANALYSIS_PROMPT.format(transcript=transcript)
        
        # Invoke the LLM
        result: MeetingAnalysisResult = structured_llm.invoke(prompt)
        
        # Format the result into the state
        action_items = [ai.model_dump() for ai in result.action_items]
        
        return {
            "summary": result.summary,
            "key_decisions": result.key_decisions,
            "topics": result.topics,
            "action_items": action_items,
            "analysis_status": "analyzed" # Intermediate state
        }
    except Exception as e:
        return {"analysis_status": "failed", "validation_errors": [str(e)]}

# Node: Validate Analysis
def validate_analysis(state: MeetingAnalysisState) -> MeetingAnalysisState:
    """Validates the structure of the LLM output using Pydantic."""
    if state.get("analysis_status") == "failed":
        return state # Skip validation if already failed
        
    try:
        # Re-validate with our Pydantic model to be absolutely sure
        MeetingAnalysisResult(
            summary=state.get("summary", ""),
            key_decisions=state.get("key_decisions", []),
            topics=state.get("topics", []),
            action_items=state.get("action_items", [])
        )
        return {"analysis_status": "completed"}
    except ValidationError as e:
        errors = [err["msg"] for err in e.errors()]
        return {"analysis_status": "failed", "validation_errors": errors}
