from langgraph.graph import StateGraph, START, END
from app.ai.state import MeetingAnalysisState
from app.ai.nodes import load_or_prepare_transcript, analyze_meeting, validate_analysis

# Define the LangGraph workflow
workflow = StateGraph(MeetingAnalysisState)

# Add nodes
workflow.add_node("prepare_transcript", load_or_prepare_transcript)
workflow.add_node("analyze_meeting", analyze_meeting)
workflow.add_node("validate_analysis", validate_analysis)

# Define edges
workflow.add_edge(START, "prepare_transcript")
workflow.add_edge("prepare_transcript", "analyze_meeting")
workflow.add_edge("analyze_meeting", "validate_analysis")
workflow.add_edge("validate_analysis", END)

# Compile the graph
app_graph = workflow.compile()

def run_zoomsense_analysis(meeting_id: int, transcript: str) -> MeetingAnalysisState:
    """Executes the ZoomSense LangGraph workflow for a meeting."""
    initial_state = {
        "meeting_id": meeting_id,
        "transcript": transcript,
        "summary": None,
        "key_decisions": [],
        "topics": [],
        "action_items": [],
        "validation_errors": [],
        "analysis_status": "processing"
    }
    
    # Run the graph
    final_state = app_graph.invoke(initial_state)
    return final_state
