import { Meeting } from "./meeting";

export interface Participant {
  id: number;
  display_name: string;
  role: "host" | "participant";
  is_muted: number;
  joined_at: string;
  left_at: string | null;
  meeting_id: number;
}

export interface JoinMeetingRequest {
  display_name: string;
}

export interface JoinMeetingResponse {
  meeting: Meeting;
  participant: Participant;
}
