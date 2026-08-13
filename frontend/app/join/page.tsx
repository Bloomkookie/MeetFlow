"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { joinMeeting } from "../../lib/api";
import { toast } from "sonner";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Video } from "lucide-react";

function JoinMeetingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialCode = searchParams.get("code") || "";
  
  const [meetingCode, setMeetingCode] = useState(initialCode);
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meetingCode.trim()) {
      toast.error("Please enter a meeting code");
      return;
    }
    
    if (!displayName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsLoading(true);
    try {
      const response = await joinMeeting(meetingCode, displayName);
      sessionStorage.setItem("participantId", response.participant.id.toString());
      sessionStorage.setItem("displayName", response.participant.display_name);
      
      router.push(`/meeting/${response.meeting.meeting_code}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to join meeting");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-card p-8 rounded-xl shadow-sm border border-border w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary p-3 rounded-2xl text-white mb-4">
            <Video className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Join Meeting</h1>
          <p className="text-muted-foreground mt-1 text-center">Enter meeting details to join the session</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Meeting ID or Code
            </label>
            <input
              type="text"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              placeholder="e.g. 123-456-789"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF]"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-[#0948CC] text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center mt-2"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : "Join Meeting"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
      <JoinMeetingContent />
    </Suspense>
  );
}
