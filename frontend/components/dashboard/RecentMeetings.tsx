"use client";

import { useEffect, useState } from "react";
import { Meeting } from "../../types/meeting";
import { getRecentMeetings } from "../../lib/api";
import MeetingCard from "./MeetingCard";
import LoadingSpinner from "../ui/LoadingSpinner";
import EmptyState from "../ui/EmptyState";
import { Clock } from "lucide-react";
import { toast } from "sonner";

interface RecentMeetingsProps {
  refreshKey?: number;
}

export default function RecentMeetings({ refreshKey = 0 }: RecentMeetingsProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMeetings() {
      setLoading(true);
      try {
        const data = await getRecentMeetings();
        setMeetings(data);
      } catch (error) {
        toast.error("Failed to load recent meetings");
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
        icon={<Clock className="w-8 h-8" />}
        title="No recent meetings"
        description="You haven't attended any meetings recently."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {meetings.map(meeting => (
        <MeetingCard key={meeting.id} meeting={meeting} variant="recent" />
      ))}
    </div>
  );
}
