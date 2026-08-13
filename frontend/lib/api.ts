import { Meeting, ScheduleMeetingRequest } from "../types/meeting";
import { Participant, JoinMeetingResponse } from "../types/participant";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = "An error occurred";
    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch {
      // Ignore
    }
    throw new ApiError(response.status, message);
  }

  return response.json();
}

export async function createInstantMeeting(): Promise<Meeting> {
  return apiFetch<Meeting>("/meetings/instant", { method: "POST" });
}

export async function createScheduledMeeting(data: ScheduleMeetingRequest): Promise<Meeting> {
  return apiFetch<Meeting>("/meetings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getUpcomingMeetings(): Promise<Meeting[]> {
  return apiFetch<Meeting[]>("/meetings/upcoming");
}

export async function getRecentMeetings(): Promise<Meeting[]> {
  return apiFetch<Meeting[]>("/meetings/recent");
}

export async function getMeeting(meetingCode: string): Promise<Meeting> {
  return apiFetch<Meeting>(`/meetings/${meetingCode}`);
}

export async function joinMeeting(meetingCode: string, displayName: string): Promise<JoinMeetingResponse> {
  return apiFetch<JoinMeetingResponse>(`/meetings/${meetingCode}/join`, {
    method: "POST",
    body: JSON.stringify({ display_name: displayName }),
  });
}

export async function leaveMeeting(meetingCode: string, participantId: number): Promise<Participant> {
  return apiFetch<Participant>(`/meetings/${meetingCode}/leave?participant_id=${participantId}`, {
    method: "POST",
  });
}

export async function getParticipants(meetingCode: string): Promise<Participant[]> {
  return apiFetch<Participant[]>(`/meetings/${meetingCode}/participants`);
}

export async function toggleParticipantMute(meetingCode: string, participantId: number, isMuted: boolean): Promise<Participant> {
  return apiFetch<Participant>(`/meetings/${meetingCode}/participants/${participantId}/mute?is_muted=${isMuted}`, {
    method: "POST",
  });
}

export async function muteAllParticipants(meetingCode: string, hostId: number): Promise<{message: string}> {
  return apiFetch<{message: string}>(`/meetings/${meetingCode}/participants/mute_all?host_id=${hostId}`, {
    method: "POST",
  });
}
