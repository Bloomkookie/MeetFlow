# API Reference Guide

Base URL: `/api`

## Meetings Endpoints

### 1. Create Instant Meeting
- **Method:** `POST`
- **URL:** `/meetings/instant`
- **Purpose:** Instantly creates and starts a meeting.
- **Request Body:** None
- **Response:**
  ```json
  {
    "id": 1,
    "meeting_code": "abc-def-ghi",
    "title": "Instant Meeting",
    "status": "active",
    "meeting_type": "instant"
  }
  ```

### 2. Create Scheduled Meeting
- **Method:** `POST`
- **URL:** `/meetings`
- **Purpose:** Schedules a meeting for the future.
- **Request Body:**
  ```json
  {
    "title": "Team Sync",
    "description": "Weekly catchup",
    "scheduled_at": "2024-05-01T10:00:00Z",
    "duration": 60
  }
  ```
- **Response:** Meeting Object (status="scheduled")

### 3. List Upcoming Meetings
- **Method:** `GET`
- **URL:** `/meetings/upcoming`
- **Purpose:** Returns a list of scheduled meetings that haven't ended.

### 4. List Recent Meetings
- **Method:** `GET`
- **URL:** `/meetings/recent`
- **Purpose:** Returns a list of meetings that have already ended or recently occurred.

### 5. Get Meeting Details
- **Method:** `GET`
- **URL:** `/meetings/{meeting_code}`
- **Purpose:** Fetch the details of a specific meeting room.
- **Error Cases:** 404 Not Found if code does not exist.

## Participant Endpoints

### 6. Join a Meeting
- **Method:** `POST`
- **URL:** `/meetings/{meeting_code}/join`
- **Purpose:** Adds a user to a meeting room as a participant.
- **Request Body:**
  ```json
  {
    "display_name": "John Doe"
  }
  ```
- **Response:**
  ```json
  {
    "participant": {
      "id": 5,
      "display_name": "John Doe",
      "role": "participant"
    },
    "meeting": { ... }
  }
  ```

### 7. Leave a Meeting
- **Method:** `POST`
- **URL:** `/meetings/{meeting_code}/leave?participant_id={id}`
- **Purpose:** Marks a participant as having left by setting their `left_at` timestamp.

### 8. List Participants
- **Method:** `GET`
- **URL:** `/meetings/{meeting_code}/participants`
- **Purpose:** Retrieves a list of all currently active participants in the meeting room.
