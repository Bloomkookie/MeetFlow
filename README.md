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
📂 **[GitHub Repository](YOUR_GITHUB_REPO_URL)**

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
