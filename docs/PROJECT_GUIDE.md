# Project Guide

This guide explains the inner workings of the Zoom Clone application, specifically tailored for interview preparation or technical deep dives.

## Frontend Architecture (Next.js + React)
The frontend uses **Next.js (App Router)** which allows for intuitive filesystem-based routing and a mix of Server and Client components.

### Core Concepts
- **App Router (`app/`):**
  - `page.tsx`: The main dashboard page displaying recent and upcoming meetings.
  - `layout.tsx`: Wraps the application with a consistent Navbar and notification system (Toaster).
  - `join/page.tsx`: A dedicated page where a user can enter a meeting code.
  - `meeting/[meetingId]/page.tsx`: Dynamic route for rendering a specific meeting room.
- **Client vs Server Components:**
  Components managing state (like Modals, Forms, or Web API interactions) are marked with `"use client"`. Static layouts remain as Server Components by default to optimize initial load times.
- **State Management & Hooks:**
  React's `useState` and `useEffect` are used extensively. For persisting session data (like if a user has joined a meeting and their participant ID), the frontend relies on `sessionStorage`.
- **API Centralization (`lib/api.ts`):**
  All fetch calls to the FastAPI backend are centralized here. This makes it easy to update the base URL, handle errors consistently, and provide strong TypeScript typings.

## Backend Architecture (FastAPI + SQLite)
The backend is built with **FastAPI**, renowned for its speed and developer experience (especially auto-generated Swagger docs).

### Core Concepts
- **Routes (`app/routes/`):**
  The entry points for API requests. They rely on Pydantic schemas for request/response validation and use FastAPI's Dependency Injection (`Depends`) to acquire a database session.
- **Services (`app/services/`):**
  The business logic layer. Routes pass validated data to services which interact directly with the database. This pattern keeps route definitions clean and makes business logic highly testable.
- **Database & Models (`app/models/` & `app/database.py`):**
  Uses **SQLAlchemy** (an ORM) to interact with the SQLite database. Models define the table schemas (`Base.metadata.create_all`).
- **Data Validation (`app/schemas/`):**
  Uses **Pydantic**. Schemas define the exact shape of JSON required for a POST request, or returned in a GET response.

## Data Flow (End-to-End)
Here is how data flows through the application when a user creates a meeting:

1. **Frontend Interaction:** User clicks "Instant Meeting" in `DashboardActions.tsx`.
2. **API Call:** The frontend invokes `createInstantMeeting()` in `lib/api.ts`.
3. **Route Handling:** The FastAPI backend receives the request at `POST /api/meetings/instant`.
4. **Service Logic:** The route calls `MeetingService.create_instant_meeting()`.
5. **Database Interaction:** The service uses the injected SQLAlchemy session to create a `Meeting` and a `Participant` object and commits them to SQLite.
6. **Response:** The backend returns the serialized meeting object (validated via Pydantic).
7. **Frontend Update:** The frontend receives the data and redirects the user to the dynamic route `/meeting/{meeting_code}`.

## Important Files
- **`frontend/app/page.tsx`**: Dashboard UI.
- **`frontend/lib/api.ts`**: The glue between the frontend and the FastAPI backend.
- **`backend/app/main.py`**: The FastAPI application entry point. Configures CORS, includes routers, and seeds the database on startup.
- **`backend/app/utils/meeting_id.py`**: Contains the logic to generate `XXX-XXX-XXX` style collision-free codes.
- **`backend/app/services/meeting_service.py`**: Where the heavy lifting for meeting logic lives.
