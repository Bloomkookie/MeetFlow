# MeetFlow

MeetFlow is a modern, full-stack video conferencing and meeting intelligence platform inspired by Zoom. It features real-time WebRTC communication, AI-driven meeting insights, and a sleek, professional UI built with Next.js and Tailwind CSS.

## 🚀 Features

- **High-Quality Video Meetings**: Real-time video and audio communication powered by WebRTC and WebSocket signaling.
- **AI Meeting Intelligence**: Automatically generates meeting summaries, extracts key decisions, and creates action items from meeting transcripts using Google's Gemini AI.
- **Professional UI/UX**: Clean, responsive design with full Dark Mode support, inspired by industry standards.
- **Personal Meeting ID (PMI)**: Dedicated personal rooms for quick and easy meetups.
- **Meeting History & Insights Management**: View past meetings and instantly clear insights and history to maintain privacy.
- **Built-in Whiteboard**: A functional HTML5 canvas for collaborative drawing and note-taking during sessions.

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Theming**: next-themes (Light/Dark mode)
- **State Management**: React Hooks & SessionStorage

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **AI Engine**: LangChain & Google Gemini API (`gemini-3.6-flash`)
- **Real-time Signaling**: FastAPI WebSockets

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Gemini API Key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install langchain-google-genai
   ```
4. Configure environment variables. Create a `.env` file in the `backend` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
5. Seed the database and start the server:
   ```bash
   python app/seed.py
   uvicorn app.main:app --reload
   ```
   The backend will be running at `http://localhost:8000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be running at `http://localhost:3000`.

## 📸 Screenshots
*(Add screenshots of your application here)*

## 📄 License
This project is licensed under the MIT License.
