"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "../ui/Modal";
import { joinMeeting } from "../../lib/api";
import { extractMeetingCode } from "../../lib/utils";
import { toast } from "sonner";
import LoadingSpinner from "../ui/LoadingSpinner";

interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinMeetingModal({ isOpen, onClose }: JoinMeetingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [meetingCode, setMeetingCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const code = extractMeetingCode(meetingCode);
    if (!code) {
      toast.error("Please enter a valid meeting code");
      return;
    }
    setMeetingCode(code);
    setStep(2);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsLoading(true);
    try {
      const response = await joinMeeting(meetingCode, displayName);
      sessionStorage.setItem("participantId", response.participant.id.toString());
      sessionStorage.setItem("displayName", response.participant.display_name);
      
      onClose();
      router.push(`/meeting/${response.meeting.meeting_code}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to join meeting");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join a Meeting">
      {step === 1 ? (
        <form onSubmit={handleNext} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Meeting ID or Personal Link Name
            </label>
            <input
              type="text"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              placeholder="e.g. 123-456-789"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF]"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-[#0948CC] text-white font-medium py-2 rounded-lg transition-colors"
          >
            Next
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoin} className="space-y-4">
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
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 bg-card border border-border hover:bg-secondary text-foreground font-medium py-2 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-[#0948CC] text-white font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : "Join"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
