<div align="center">

# 🎥 ZoomSense

### Real-Time Video Conferencing Platform with AI-Powered Meeting Intelligence

A modern full-stack video conferencing application inspired by Zoom, built with **Next.js, FastAPI, WebRTC, WebSockets, SQLite, and LangGraph**.

<br />

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-Real--Time-333333?style=for-the-badge)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--Time-010101?style=for-the-badge)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-AI%20Workflow-1C3C3C?style=for-the-badge)

<br />

🔗 **[Live Demo](exemplary-encouragement-production-c500.up.railway.app)** &nbsp;&nbsp;•&nbsp;&nbsp;
📂 **[GitHub Repository](https://github.com/Bloomkookie/MeetFlow)**

</div>

---

# 🚀 Overview

**ZoomSense** is a full-stack, real-time video conferencing platform inspired by modern meeting applications such as Zoom.

The application enables users to create instant meetings, join meetings using a Meeting ID or invite link, schedule future meetings, manage participants, and communicate using real-time audio and video.

Beyond standard video conferencing, ZoomSense introduces **AI-powered Meeting Intelligence** that analyzes meeting transcripts to generate summaries, extract key decisions, identify action items, detect assignees and deadlines, and organize searchable meeting history.

The project demonstrates full-stack development, real-time communication, WebRTC signaling, database design, API development, and AI workflow orchestration.

---

# ✨ Features

## 🎥 Real-Time Video Conferencing

- 📹 Real camera access using WebRTC
- 🎙️ Real microphone access
- 🔇 Mute and unmute controls
- 📷 Enable and disable camera
- 👥 Multi-participant meeting support
- 🔄 Real-time participant updates
- 🔌 WebSocket-based signaling
- 🖥️ Responsive video grid
- 🚪 Leave meeting functionality

```text
User A                  FastAPI Signaling Server                  User B

Camera ──┐                       │                                  ┌── Camera
         │                       │                                  │
         ▼                       ▼                                  ▼

      WebRTC  ◄──────── WebSocket Signaling ────────►  WebRTC

         │                                                   │
         └──────────── Direct Media Connection ──────────────┘

🏠 Zoom-Style Dashboard

The dashboard provides a clean and professional meeting management experience.

Users can:

Feature	Description
⚡ New Meeting	Create and start an instant meeting
🔗 Join Meeting	Join using a Meeting ID or invite link
📅 Schedule Meeting	Create a future meeting
🕒 Upcoming Meetings	View scheduled meetings
📝 Recent Meetings	View recently completed meetings
🔍 Meeting History	Search previous meetings and insights
🌙 Theme Support	Switch between Light and Dark modes

⚡ Instant Meeting Creation

Users can instantly create a meeting.

The application automatically:

Generates a unique Meeting ID
Creates a shareable invite link
Stores the meeting information
Redirects the host to the meeting room
⚡ New Meeting
      │
      ▼
🔢 Generate Unique Meeting ID
      │
      ▼
🔗 Generate Invite Link
      │
      ▼
💾 Store Meeting
      │
      ▼
🎥 Redirect to Meeting Room

🔗 Join Meeting

Users can join meetings using:

🔢 Meeting ID
🔗 Shareable invite link

Before entering the meeting, users can:

👤 Enter a display name
🎙️ Configure microphone
📹 Configure camera
✅ Validate whether the meeting exists
📅 Schedule Meetings

Users can schedule future meetings with:

📝 Meeting title
📄 Description
📆 Date
🕐 Start time
⏳ Duration
🔗 Automatically generated meeting link

Scheduled meetings are stored in SQLite and displayed in the Upcoming Meetings section.

👥 Participant Management

The meeting room provides participant-related functionality such as:

👤 Display participant names
➕ Detect users joining the meeting
➖ Detect users leaving the meeting
📊 Track participant count
🎙️ Display audio/video status

Additional host controls may include:

🔇 Mute all participants
❌ Remove participant
📡 Network Quality Indicator

ZoomSense provides a real-time network quality indicator based on WebRTC connection statistics.

Status	Meaning
🟢 Excellent	Strong and stable connection
🟡 Good	Stable connection
🟠 Weak	Possible audio or video degradation
🔴 Poor	Connection quality is significantly affected
⚪ Checking	Connection is currently being evaluated

The indicator provides both color and descriptive text for accessibility.

🤖 ZoomSense — AI Meeting Intelligence

Turn conversations into actionable insights.

ZoomSense extends the platform beyond video conferencing by analyzing meeting transcripts after a meeting.

Instead of simply storing conversations, the system extracts meaningful information that users can review and act upon.

ZoomSense can generate:
📝 Meeting Summary
📌 Key Decisions
✅ Action Items
👤 Action Item Assignees
📅 Mentioned Deadlines
🏷️ Important Discussion Topics
🔍 Searchable Meeting History
🧠 ZoomSense AI Workflow
                     🎥 Meeting
                         │
                         ▼
                    🚪 Meeting Ends
                         │
                         ▼
                   📝 Transcript
                         │
                         ▼
                    ⚡ FastAPI
                         │
                         ▼
                 🧠 LangGraph Workflow
                         │
                         ▼
                🧹 Prepare Transcript
                         │
                         ▼
                  🤖 AI Analysis
                         │
                         ▼
               📦 Structured Output
                         │
                         ▼
                🛡️ Pydantic Validation
                         │
                         ▼
                  📝 Draft Insights
                         │
                         ▼
                   👤 Human Review
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           Approve      Edit      Dismiss
              │
              ▼
                    💾 SQLite

The workflow is designed to ensure that AI-generated information is structured and validated before being presented to the user.

📝 Example AI Analysis
Example Meeting Transcript
Nafisa: We should use JWT authentication for the API.

Rahul: I will work on the database schema.

Nafisa: Great. Let's complete the initial implementation by Friday.
🤖 ZoomSense Generated Insights
📝 Meeting Summary

The team discussed authentication architecture and backend development responsibilities.

📌 Key Decisions
Use JWT authentication.
Complete the initial backend implementation.
🏷️ Discussion Topics

Authentication · Backend Development · Database Design

✅ Action Items
Task	Assignee	Deadline	Status
Implement JWT authentication	Nafisa	Friday	🟡 Pending Review
Design database schema	Rahul	Not specified	🟡 Pending Review
👤 Human-in-the-Loop AI

AI-generated information should not automatically be considered final.

ZoomSense follows a Human-in-the-Loop workflow where generated action items can be reviewed before being permanently accepted.

🤖 AI Generated Action Item

☐ Implement JWT Authentication

👤 Assigned to: Nafisa
📅 Deadline: Friday

[ ✓ Approve ]   [ ✏️ Edit ]   [ 🗑 Dismiss ]
AI Suggestion
      │
      ▼
Human Review
      │
      ▼
Approve / Edit / Dismiss
      │
      ▼
Final Action Item

This approach helps reduce the impact of inaccurate AI interpretations.

🔍 Searchable Meeting History

Users can search previous meetings using:

🔎 Meeting title
📝 AI-generated summary
🏷️ Discussion topics
📌 Key decisions

Example:

🔍 Search meetings, summaries, decisions, or topics...

This allows users to quickly retrieve important discussions from previous meetings.

🏗️ System Architecture
                              ┌─────────────────────────┐
                              │        FRONTEND         │
                              │                         │
                              │        Next.js          │
                              │       TypeScript        │
                              │      Tailwind CSS       │
                              └────────────┬────────────┘
                                           │
                              REST API / WebSocket
                                           │
                                           ▼
                              ┌─────────────────────────┐
                              │         BACKEND         │
                              │                         │
                              │         FastAPI         │
                              │                         │
                              │  ┌───────────────────┐  │
                              │  │   REST API Layer  │  │
                              │  └───────────────────┘  │
                              │                         │
                              │  ┌───────────────────┐  │
                              │  │ WebSocket Server  │  │
                              │  └───────────────────┘  │
                              │                         │
                              │  ┌───────────────────┐  │
                              │  │  AI Orchestration │  │
                              │  └─────────┬─────────┘  │
                              └────────────┼────────────┘
                                           │
                     ┌─────────────────────┼─────────────────────┐
                     ▼                     ▼                     ▼
              ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
              │    SQLite    │      │  LangGraph   │      │    WebRTC     │
              │              │      │              │      │               │
              │   Meetings   │      │ AI Workflow  │      │ Real-Time     │
              │   Insights   │      │              │      │ Audio/Video   │
              │ Action Items │      └──────┬───────┘      └──────────────┘
              └──────────────┘             │
                                           ▼
                                    ┌─────────────┐
                                    │     LLM     │
                                    │  Analysis   │
                                    └─────────────┘
🛠️ Tech Stack
🎨 Frontend
⚛️ Next.js
🔷 TypeScript
🎨 Tailwind CSS
🌙 Light and Dark Mode
⚙️ Backend
🐍 Python
⚡ FastAPI
🗃️ SQLAlchemy
🛡️ Pydantic
🔄 Real-Time Communication
🎥 WebRTC
🔌 WebSockets
🗄️ Database
SQLite
🤖 AI
LangGraph
Large Language Model
Structured Output
Pydantic Validation
📂 Project Structure
zoom-sense/
│
├── frontend/
│   │
│   ├── app/
│   │   ├── page.tsx
│   │   ├── meeting/
│   │   ├── meetings/
│   │   └── insights/
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   ├── meeting/
│   │   ├── meetings/
│   │   └── ui/
│   │
│   ├── hooks/
│   │   ├── useWebRTC.ts
│   │   └── useTheme.ts
│   │
│   └── lib/
│       └── api.ts
│
├── backend/
│   │
│   ├── app/
│   │   │
│   │   ├── ai/
│   │   │   ├── graph.py
│   │   │   ├── nodes.py
│   │   │   ├── prompts.py
│   │   │   ├── schemas.py
│   │   │   └── state.py
│   │   │
│   │   ├── models/
│   │   │   ├── meeting.py
│   │   │   ├── participant.py
│   │   │   ├── transcript.py
│   │   │   ├── meeting_insight.py
│   │   │   └── action_item.py
│   │   │
│   │   ├── routes/
│   │   │   ├── meetings.py
│   │   │   └── action_items.py
│   │   │
│   │   ├── services/
│   │   │   └── meeting_analysis_service.py
│   │   │
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── docs/
│   ├── ZOOMSENSE_GUIDE.md
│   ├── ZOOMSENSE_CODE_GUIDE.md
│   ├── DESIGN_SYSTEM.md
│   └── INTERVIEW_PREP.md
│
├── README.md
└── .env.example
🗄️ Database Design
                         ┌──────────────┐
                         │   Meeting    │
                         └──────┬───────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
       ┌─────────────┐   ┌─────────────┐   ┌──────────────┐
       │ Participant │   │ Transcript  │   │  AI Insight  │
       └─────────────┘   └─────────────┘   └──────┬───────┘
                                                  │
                                                  ▼
                                           ┌─────────────┐
                                           │ Action Item │
                                           └─────────────┘
Core Entities
Entity	Description
🗓️ Meeting	Stores meeting information and scheduling details
👤 Participant	Stores participant information
📝 Transcript	Stores meeting conversation data
🤖 Meeting Insight	Stores AI-generated summaries and decisions
✅ Action Item	Stores extracted tasks and assignments
🔌 API Overview
📅 Meeting APIs
Method	Endpoint	Description
POST	/api/meetings	Create a meeting
GET	/api/meetings/{meeting_id}	Retrieve meeting details
POST	/api/meetings/join	Validate and join a meeting
GET	/api/meetings/upcoming	Retrieve upcoming meetings
GET	/api/meetings/recent	Retrieve recent meetings
GET	/api/meetings/history	Search meeting history
🤖 ZoomSense APIs
Method	Endpoint	Description
POST	/api/meetings/{meeting_id}/transcript	Store meeting transcript
POST	/api/meetings/{meeting_id}/analyze	Generate AI insights
GET	/api/meetings/{meeting_id}/insights	Retrieve AI insights
✅ Action Item APIs
Method	Endpoint	Description
PATCH	/api/action-items/{id}	Update an action item
POST	/api/action-items/{id}/approve	Approve an AI-generated action item
DELETE	/api/action-items/{id}	Dismiss an action item
⚙️ Getting Started
📋 Prerequisites

Make sure the following are installed:

Node.js 18+
Python 3.10+
npm
Git
1️⃣ Clone the Repository
git clone YOUR_GITHUB_REPOSITORY_URL
cd zoom-sense
2️⃣ Backend Setup

Navigate to the backend directory:

cd backend

Create a virtual environment:

python -m venv venv

Activate the virtual environment.

macOS / Linux
source venv/bin/activate
Windows
venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Create your environment file:

cp .env.example .env

Add your environment variables:

LLM_API_KEY=your_api_key
LLM_MODEL=your_model_name

Run the FastAPI server:

uvicorn app.main:app --reload

The backend will run at:

http://localhost:8000

Interactive API documentation:

http://localhost:8000/docs
3️⃣ Frontend Setup

Open a new terminal and navigate to the frontend directory:

cd frontend

Install dependencies:

npm install

Create the environment file:

cp .env.example .env.local

Add the backend URL:

NEXT_PUBLIC_API_URL=http://localhost:8000

Start the development server:

npm run dev

Open:

http://localhost:3000
🧪 Testing the Application
🎥 Testing Video Meetings
Open the application in your browser.
Click New Meeting.
Allow camera and microphone permissions.
Copy the generated meeting link.
Open the meeting link in another browser or device.
Enter a different display name.
Join the meeting.
Verify real-time video and audio.
Test mute/unmute and camera controls.
Leave the meeting.
🤖 Testing ZoomSense
Complete or select a meeting.
Ensure a transcript is available.
Open the meeting details.
Click Generate AI Insights.
Review:
Meeting Summary
Key Decisions
Discussion Topics
Action Items
Approve, edit, or dismiss generated action items.
🌙 Design System

ZoomSense supports both Light and Dark themes.

☀️ Light Mode
Token	Color
Primary	#0B5CFF
Background	#F7F8FA
Card	#FFFFFF
Primary Text	#1F2937
Secondary Text	#667085
Border	#E4E7EC
🌙 Dark Mode
Token	Color
Primary	#3B82F6
Background	#111827
Secondary Surface	#172033
Card	#1E293B
Primary Text	#F8FAFC
Border	#334155

🎥 The meeting room uses a dedicated dark interface to keep the focus on video content.

🧠 Key Engineering Decisions
🎥 Why WebRTC?

WebRTC enables browsers to establish real-time audio and video connections.

It provides the foundation for peer-to-peer media communication between meeting participants.

🔌 Why WebSockets?

WebRTC requires signaling before a peer-to-peer connection can be established.

WebSockets are used for exchanging information such as:

Session descriptions
ICE candidates
Participant join events
Participant leave events
⚡ Why FastAPI?

FastAPI was selected because it provides:

High-performance APIs
Automatic OpenAPI documentation
Pydantic data validation
Async support
Native WebSocket support
Clean Python architecture
🗄️ Why SQLite?

SQLite was selected because it is lightweight and appropriate for the scope of this assignment.

The relational database design allows future migration to PostgreSQL without requiring major changes to the application architecture.

🤖 Why LangGraph?

LangGraph is used to orchestrate the AI meeting analysis workflow.

Prepare Transcript
        │
        ▼
Analyze Meeting
        │
        ▼
Generate Structured Output
        │
        ▼
Validate with Pydantic
        │
        ▼
Save AI Insights

The workflow can later be extended with:

Retry mechanisms
Human approval checkpoints
Background processing
Multiple AI agents
Additional analysis stages
🛡️ Why Pydantic?

AI-generated responses should not be directly trusted as valid application data.

Pydantic is used to validate structured AI output such as:

Meeting summaries
Action items
Assignees
Deadlines
Key decisions
Discussion topics

This helps ensure predictable and structured data before persistence.

📚 Documentation

The project includes additional documentation to explain the implementation.

Document	Description
📖 ZOOMSENSE_GUIDE.md	Explains the ZoomSense AI workflow
💻 ZOOMSENSE_CODE_GUIDE.md	Explains the implementation and major files
🎨 DESIGN_SYSTEM.md	Documents the Light and Dark mode design system
🎯 INTERVIEW_PREP.md	Contains technical questions and implementation explanations
🔮 Future Improvements
🎙️ Live speech-to-text transcription
📹 Meeting recording
🌍 Multi-language transcription
👥 Advanced host controls
🔐 Authentication and user accounts
📧 Email invitations
⏰ Automated follow-up reminders
🔔 Notifications
🔎 Semantic meeting search
🧠 Vector database integration
⚙️ Background task processing
📊 Meeting analytics
🐘 PostgreSQL for production deployment
🌐 TURN server integration for improved WebRTC connectivity
⚠️ Assumptions and Limitations
Authentication is not required for the current assignment scope.
A default user flow is assumed.
AI analysis requires an available meeting transcript.
Post-meeting analysis is prioritized over live transcription to maintain manageable system complexity.
SQLite is used for development and assignment purposes.
Production-scale deployments may require PostgreSQL.
Reliable WebRTC connectivity across restrictive networks may require a TURN server.
AI-generated insights should be reviewed by users before being treated as final information.
🎯 What This Project Demonstrates
                          🎥 ZoomSense
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
        🎨 Frontend       ⚙️ Backend         🤖 AI System
             │                 │                 │
          Next.js           FastAPI          LangGraph
        TypeScript        WebSockets           LLM
        Tailwind CSS      SQLAlchemy      Structured Output
             │                 │                 │
             └─────────────────┼─────────────────┘
                               │
                               ▼
                       🎥 Real-Time Systems
                               │
                             WebRTC
                               │
                               ▼
                         🗄️ SQLite

This project demonstrates:

Full-stack application development
REST API design
WebSocket communication
WebRTC real-time systems
Database schema design
State management
Responsive UI development
AI workflow orchestration
Structured LLM output
Data validation
Human-in-the-loop AI design
👩‍💻 Author

Nafisa Anjum Laskar

<div align="center">
⭐ If you found this project interesting, consider giving it a star!

Built with 🎥 WebRTC · ⚡ FastAPI · ⚛️ Next.js · 🤖 LangGraph

</div> ```
