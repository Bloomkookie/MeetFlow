"use client";

import { Meeting } from "../../types/meeting";
import { Clock, Calendar, Hash } from "lucide-react";
import { formatDate, formatTime, formatDuration } from "../../lib/utils";
import { useRouter } from "next/navigation";

interface MeetingCardProps {
  meeting: Meeting;
  variant: "upcoming" | "recent";
}

export default function MeetingCard({ meeting, variant }: MeetingCardProps) {
  const router = useRouter();

  const handleJoin = () => {
    router.push(`/join?code=${meeting.meeting_code}`);
  };

  const statusColors = {
    scheduled: "bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-400",
    active: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    ended: "bg-secondary dark:bg-card text-slate-700 dark:text-secondary-foreground",
  };

  return (
    <div className="bg-card dark:bg-background rounded-xl shadow-sm border border-border dark:border-border p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg text-foreground dark:text-foreground line-clamp-1">
            {meeting.title}
          </h3>
          {variant === "recent" && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[meeting.status]}`}>
              {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground dark:text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(meeting.scheduled_at || meeting.created_at)}
          </div>
          <div className="flex items-center text-sm text-muted-foreground dark:text-muted-foreground">
            <Clock className="w-4 h-4 mr-2" />
            {meeting.scheduled_at ? formatTime(meeting.scheduled_at) : formatTime(meeting.created_at)} 
            <span className="mx-2">•</span> 
            {formatDuration(meeting.duration)}
          </div>
          <div className="flex items-center text-sm text-muted-foreground dark:text-muted-foreground font-mono">
            <Hash className="w-4 h-4 mr-2" />
            {meeting.meeting_code}
          </div>
        </div>
      </div>

      {variant === "upcoming" && (
        <button
          onClick={handleJoin}
          className="w-full bg-primary hover:bg-[#0948CC] text-white font-medium py-2 rounded-lg transition-colors mt-auto"
        >
          Join
        </button>
      )}
    </div>
  );
}
