# SDE Interview Preparation Guide: Zoom Clone

This document is designed to help you prepare for a technical interview where you might be asked to explain the design, architecture, and implementation details of this Zoom Clone project. 

## 1. Architecture & Technology Choices

**Q: Why did you choose Next.js for the frontend?**
A: Next.js (specifically the App Router) was chosen for several reasons:
- **Server and Client Components**: It allows us to clearly separate interactive UI (Client Components using `"use client"`, like the Meeting Room controls) from static or server-rendered content (like the dashboard layout), improving initial load performance.
- **Routing**: The folder-based routing (`app/meeting/[meetingId]/page.tsx`) makes dynamic routes intuitive to build and maintain.
- **API Integration**: It's trivial to consume backend APIs cleanly.
- **Production Readiness**: Next.js provides built-in optimizations (like font loading with `next/font`) and is highly scalable.

**Q: Why did you choose FastAPI for the backend?**
A: FastAPI is a modern, high-performance web framework for Python. Key benefits include:
- **Automatic Validation**: It uses Pydantic to automatically validate incoming request payloads. If a user sends a string instead of an integer for `duration`, FastAPI automatically returns a 422 Unprocessable Entity error without writing custom validation logic.
- **Auto-generated Documentation**: It automatically generates Swagger UI (`/docs`), which is incredibly helpful for frontend integration and debugging.
- **Performance**: It's built on Starlette and Pydantic, making it one of the fastest Python frameworks available.
- **Type Hints**: It heavily leverages Python type hints, making the codebase robust and easy to reason about.

**Q: Why separate the frontend and backend instead of building a monolith (e.g., Django templates or Next.js API routes)?**
A: A decoupled architecture (Next.js frontend + FastAPI backend) provides better scalability and flexibility:
- **Independent Scaling**: The frontend (mostly static/CDN-cacheable) scales differently than the backend (database-heavy).
- **Client Diversity**: If we want to build a mobile app (React Native, iOS, Android) later, the FastAPI backend can serve it without any changes. 
- **Separation of Concerns**: Frontend engineers can work on the UI, while backend engineers optimize database queries.

## 2. Database Design

**Q: Why are there three tables (Users, Meetings, Participants)?**
A: The schema is fully normalized to represent the domain accurately:
- **Users**: Represents registered accounts (even though auth is mocked as a default user).
- **Meetings**: Represents the event/room itself.
- **Participants**: Acts as a junction table but with added metadata. It represents the "Many-to-Many" relationship between Users and Meetings, but since guest users can join without accounts, `user_id` is nullable. It tracks *when* someone joined/left and their *role* (host vs. participant) for a specific meeting.

**Q: Why is `meeting_code` set to UNIQUE?**
A: The `meeting_code` (e.g., `482-739-152`) is the public identifier used in the URL. If it weren't unique, the backend wouldn't know which meeting room to route the user to when they hit `/api/meetings/{meeting_code}`. The unique constraint enforces this at the database level, preventing race conditions during meeting creation.

**Q: Explain the relationships in your SQLAlchemy models.**
A: 
- **One-to-Many (Users to Meetings)**: A user can host multiple meetings (`User.hosted_meetings`), but a meeting has exactly one host (`Meeting.host_id`).
- **One-to-Many (Meetings to Participants)**: A meeting can have multiple participants. We use `cascade="all, delete-orphan"` so if a meeting is deleted, all participant records for that meeting are automatically cleaned up.

## 3. Backend Implementation Details

**Q: What is the difference between a Pydantic model (Schema) and an SQLAlchemy model?**
A: 
- **SQLAlchemy Models** (`app/models/`): Define how data is stored in the database (tables, columns, foreign keys).
- **Pydantic Models** (`app/schemas/`): Define how data enters and leaves the API (JSON serialization/deserialization, input validation). 
Separating them prevents accidentally leaking sensitive database fields (like password hashes, if we had them) to the client.

**Q: How does Dependency Injection work in your FastAPI routes?**
A: We use `Depends(get_db)` in our routes. `get_db` is a generator that yields a database session and ensures `db.close()` is called in a `finally` block. This guarantees that every HTTP request gets an isolated database transaction, and connections are always returned to the pool, preventing memory leaks or connection exhaustion.

**Q: Why use a Service Layer (`meeting_service.py`) instead of putting business logic in the router?**
A: Putting logic in the router makes it hard to test and reuse. By moving logic (like `generate_meeting_code` and database inserts) into a service layer, the router's only job is handling HTTP (parsing input, returning output). We can test the service functions directly without spinning up a test HTTP client.

## 4. Frontend Implementation Details

**Q: How is state managed in the frontend?**
A: We use React's built-in hooks (`useState`, `useEffect`) for component-level state. For cross-page state (like remembering a guest's `participantId` and `displayName` after they join and redirect to the meeting room), we use browser `sessionStorage`. This avoids the complexity of Redux or Zustand for data that only needs to persist for the duration of the browser tab session.

**Q: How does the dynamic routing work for the meeting room?**
A: The folder structure `app/meeting/[meetingId]/page.tsx` tells Next.js to capture the URL segment as a parameter. We use the `useParams()` hook to extract `meetingId`, and then pass it to our API client to fetch the specific meeting details.

**Q: Why centralize API calls in `lib/api.ts`?**
A: Instead of calling `fetch()` in every component, centralizing it allows us to:
1. Define a single base URL (`NEXT_PUBLIC_API_BASE_URL`).
2. Have a single place to handle non-200 HTTP responses and throw standardized `ApiError`s.
3. Provide strict TypeScript return types for every endpoint, so components know exactly what data shape to expect.

## 5. System Design & Future Scaling

**Q: How would you add real Video/Audio (WebRTC) to this app?**
A: WebRTC is peer-to-peer, but peers need a way to discover each other (Signaling). I would add WebSockets to the FastAPI backend (using `fastapi.websockets`). When a user joins a room, they connect via WebSocket. When another user joins, the backend broadcasts a message. The peers then exchange SDP offers/answers and ICE candidates through the WebSocket to establish the direct WebRTC connection.

**Q: How would you scale the database if the app becomes wildly popular?**
A:
1. **Migrate to PostgreSQL**: SQLite is great for prototyping but locks the entire database for writes. Postgres handles high concurrency.
2. **Connection Pooling**: Use PgBouncer to manage database connections efficiently.
3. **Caching**: Since fetching "Upcoming Meetings" might happen frequently, I would introduce a Redis cache in front of the database. When a meeting is scheduled, we invalidate the cache.
4. **Read Replicas**: Route all `GET` requests to database replicas, keeping the primary database free for `POST` (writes).

**Q: How would you implement Authentication?**
A: I would use JWT (JSON Web Tokens). When a user logs in, the backend issues a JWT containing their `user_id`. The Next.js frontend stores this in an HttpOnly cookie or localStorage, and attaches it as a `Bearer` token in the `Authorization` header of every API request. FastAPI's `Depends` would decode the token, find the user, and pass the `User` object to the route.

## ZoomSense AI
Q: How does ZoomSense handle AI action item generation?
A: We use LangGraph and Pydantic structured outputs with OpenAI. The LLM extracts action items, which are saved in the DB as `is_approved=False`. A human must review them via the UI.
