export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Meeting {
  id: number;
  meeting_code: string;
  title: string;
  description: string | null;
  scheduled_at: string | null;
  duration: number;
  meeting_type: "instant" | "scheduled";
  status: "scheduled" | "active" | "ended";
  created_at: string;
  invite_link: string;
  host: User;
}

export interface ScheduleMeetingRequest {
  title: string;
  description?: string;
  scheduled_at: string;
  duration: number;
}
