"use client";

import { Plus, UserPlus, Calendar } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInstantMeeting } from "../../lib/api";
import { toast } from "sonner";
import JoinMeetingModal from "../meetings/JoinMeetingModal";
import ScheduleMeetingModal from "../meetings/ScheduleMeetingModal";

interface DashboardActionsProps {
  onMeetingCreated: () => void;
}

export default function DashboardActions({ onMeetingCreated }: DashboardActionsProps) {
  const router = useRouter();
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isCreatingInstant, setIsCreatingInstant] = useState(false);

  const handleNewMeeting = async () => {
    setIsCreatingInstant(true);
    try {
      const response = await createInstantMeeting();
      // The API returns meeting data plus participant_id for the host
      const participantId = (response as any).participant_id;
      sessionStorage.setItem("participantId", String(participantId));
      sessionStorage.setItem("displayName", response.host.name);
      toast.success("Meeting created successfully");
      router.push(`/meeting/${response.meeting_code}`);
    } catch (error) {
      toast.error("Failed to create meeting");
      setIsCreatingInstant(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button 
          onClick={handleNewMeeting}
          disabled={isCreatingInstant}
          className="bg-card dark:bg-background rounded-xl shadow-sm border border-border dark:border-border p-6 text-left hover:shadow-md transition-shadow group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="bg-orange-500 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg text-foreground dark:text-foreground mb-1">New Meeting</h3>
          <p className="text-muted-foreground dark:text-muted-foreground text-sm">Start an instant meeting</p>
        </button>

        <button 
          onClick={() => setIsJoinOpen(true)}
          className="bg-card dark:bg-background rounded-xl shadow-sm border border-border dark:border-border p-6 text-left hover:shadow-md transition-shadow group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4">
            <UserPlus className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg text-foreground dark:text-foreground mb-1">Join Meeting</h3>
          <p className="text-muted-foreground dark:text-muted-foreground text-sm">Join with a code or link</p>
        </button>

        <button 
          onClick={() => setIsScheduleOpen(true)}
          className="bg-card dark:bg-background rounded-xl shadow-sm border border-border dark:border-border p-6 text-left hover:shadow-md transition-shadow group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="bg-purple-500 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg text-foreground dark:text-foreground mb-1">Schedule</h3>
          <p className="text-muted-foreground dark:text-muted-foreground text-sm">Plan a future meeting</p>
        </button>
      </div>

      <JoinMeetingModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
      <ScheduleMeetingModal 
        isOpen={isScheduleOpen} 
        onClose={() => setIsScheduleOpen(false)} 
        onSuccess={onMeetingCreated} 
      />
    </>
  );
}
