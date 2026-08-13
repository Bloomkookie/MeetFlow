# Feature Flows

This document outlines the core workflows in the application using sequence diagrams.

## Instant Meeting Flow
When a user decides to start an immediate meeting.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database

    User->>Frontend: Clicks "New Meeting"
    Frontend->>API: POST /api/meetings/instant
    API->>Database: Insert Meeting (type=instant, status=active)
    API->>Database: Insert Participant (role=host)
    Database-->>API: Meeting & Participant Data
    API-->>Frontend: Returns Meeting Details
    Frontend->>Frontend: Save Participant ID to sessionStorage
    Frontend->>User: Redirects to /meeting/{meeting_code}
```

## Schedule Meeting Flow
When a user sets up a meeting for the future.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database

    User->>Frontend: Submits Schedule Form
    Frontend->>API: POST /api/meetings (with title, time)
    API->>Database: Insert Meeting (type=scheduled, status=scheduled)
    Database-->>API: Meeting Data
    API-->>Frontend: Returns Meeting Details
    Frontend->>User: Updates Upcoming Meetings List
```

## Join Meeting Flow
When a user attempts to join a meeting using a code.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database

    User->>Frontend: Enters Code and Display Name
    Frontend->>API: POST /api/meetings/{code}/join
    API->>Database: Verify Meeting exists and is active/scheduled
    API->>Database: Insert Participant
    Database-->>API: Participant Data
    API-->>Frontend: Returns Participant Details
    Frontend->>Frontend: Save Participant ID to sessionStorage
    Frontend->>User: Redirects to /meeting/{meeting_code}
```

## Leave Meeting Flow
When a user exits an ongoing meeting room.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database

    User->>Frontend: Clicks "Leave"
    Frontend->>API: POST /api/meetings/{code}/leave?participant_id={id}
    API->>Database: Update Participant (set left_at = now)
    Database-->>API: Success
    API-->>Frontend: Success Response
    Frontend->>Frontend: Clear sessionStorage
    Frontend->>User: Redirects to Dashboard
```
