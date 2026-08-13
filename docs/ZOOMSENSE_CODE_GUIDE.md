# ZoomSense Code Guide

## Architecture

ZoomSense is built using **FastAPI** on the backend and **Next.js** on the frontend.
The core AI orchestration is powered by **LangGraph**.

### Database Schema (SQLAlchemy)
Located in `backend/app/models/zoomsense.py`:
- `MeetingTranscript`: Stores raw transcript text.
- `MeetingInsight`: Stores summary, decisions, and topics (JSON strings), along with analysis status (`pending`, `processing`, `completed`, `failed`).
- `ActionItem`: Stores task details with `is_approved` and `ai_generated` flags.

### LangGraph Workflow
Located in `backend/app/ai/`:
1. `prepare_transcript` (Node): Cleans text.
2. `analyze_meeting` (Node): Calls `ChatOpenAI.with_structured_output` using Pydantic schemas.
3. `validate_analysis` (Node): Verifies the Pydantic schema constraints.

### Service Layer
`backend/app/services/zoomsense_service.py` connects the FastAPI routes to LangGraph and database transactions, preventing duplicate graph executions.

### Frontend
- `ActionItemCard.tsx`: Reusable component for approving/dismissing tasks.
- `MeetingHistory.tsx`: Searchable table displaying insights readiness.
- `app/meeting/[meetingId]/insights/page.tsx`: The primary dashboard for viewing the AI output.
