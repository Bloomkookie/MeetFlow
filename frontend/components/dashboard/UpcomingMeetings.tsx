"use client";

import { useEffect, useState } from "react";
import { Meeting } from "../../types/meeting";
import { getUpcomingMeetings } from "../../lib/api";
import MeetingCard from "./MeetingCard";
import LoadingSpinner from "../ui/LoadingSpinner";
import EmptyState from "../ui/EmptyState";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

interface UpcomingMeetingsProps {
  refreshKey?: number;
}

export default function UpcomingMeetings({ refreshKey = 0 }: UpcomingMeetingsProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMeetings() {
      setLoading(true);
      try {
        const data = await getUpcomingMeetings();
        setMeetings(data);
      } catch (error) {
        toast.error("Failed to load upcoming meetings");
      } finally {
        setLoading(false);
      }
    }
    loadMeetings();
  }, [refreshKey]);

  if (loading) {
    return <div className="py-10"><LoadingSpinner /></div>;
  }

  if (meetings.length === 0) {
    return (
      <EmptyState 
        icon={<Calendar className="w-8 h-8" />}
        title="No upcoming meetings"
        description="Schedule a new meeting to see it here."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {meetings.map(meeting => (
        <MeetingCard key={meeting.id} meeting={meeting} variant="upcoming" />
      ))}
    </div>
  );
}
