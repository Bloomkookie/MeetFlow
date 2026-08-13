"use client";

import { useEffect, useState, useCallback } from "react";
import { Participant } from "../../types/participant";
import { getParticipants, muteAllParticipants, toggleParticipantMute, leaveMeeting } from "../../lib/api";
import { X, User, Mic, MicOff, LogOut } from "lucide-react";
import LoadingSpinner from "../ui/LoadingSpinner";
import { toast } from "sonner";

interface ParticipantPanelProps {
  meetingCode: string;
  isOpen: boolean;
  onClose: () => void;
  onParticipantsUpdate?: (participants: Participant[]) => void;
  sendHostCommand?: (type: "mute_all" | "remove_participant", targetId?: number) => void;
}

export default function ParticipantPanel({ 
  meetingCode, 
  isOpen, 
  onClose,
  onParticipantsUpdate,
  sendHostCommand
}: ParticipantPanelProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  
  const currentParticipantId = typeof window !== "undefined" ? Number(sessionStorage.getItem("participantId")) : null;
  const isHost = participants.find(p => p.id === currentParticipantId)?.role === "host";

  const loadParticipants = useCallback(async () => {
    try {
      const data = await getParticipants(meetingCode);
      setParticipants(data);
      if (onParticipantsUpdate) {
        onParticipantsUpdate(data);
      }
    } catch (error) {
      console.error("Failed to load participants", error);
    } finally {
      setLoading(false);
    }
  }, [meetingCode, onParticipantsUpdate]);

  useEffect(() => {
    loadParticipants();
    const intervalId = setInterval(loadParticipants, 3000);
    return () => clearInterval(intervalId);
  }, [loadParticipants]);

  const handleMuteAll = async () => {
    if (!currentParticipantId) return;
    try {
      await muteAllParticipants(meetingCode, currentParticipantId);
      if (sendHostCommand) {
        sendHostCommand("mute_all");
      }
      toast.success("All participants muted");
      loadParticipants();
    } catch (error) {
      toast.error("Failed to mute participants");
    }
  };

  const handleToggleMute = async (participantId: number, currentMuted: boolean) => {
    try {
      await toggleParticipantMute(meetingCode, participantId, !currentMuted);
      toast.success(currentMuted ? "Participant unmuted" : "Participant muted");
      loadParticipants();
    } catch (error) {
      toast.error("Failed to toggle mute");
    }
  };

  const handleRemove = async (participantId: number) => {
    try {
      await leaveMeeting(meetingCode, participantId);
      if (sendHostCommand) {
        sendHostCommand("remove_participant", participantId);
      }
      toast.success("Participant removed");
      loadParticipants();
    } catch (error) {
      toast.error("Failed to remove participant");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-card border-l border-border h-full flex flex-col absolute right-0 top-0 bottom-0 z-20 shadow-xl transition-transform transform">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Participants ({participants.length})</h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors rounded-full p-1 hover:bg-secondary"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && participants.length === 0 ? (
          <div className="py-10"><LoadingSpinner size="sm" /></div>
        ) : (
          participants.map((participant) => (
            <div key={participant.id} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-medium border border-blue-200">
                {participant.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{participant.display_name} {participant.id === currentParticipantId && "(You)"}</p>
                {participant.role === "host" && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded-full">
                    Host
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {participant.is_muted ? (
                  <MicOff className="w-4 h-4 text-red-500" />
                ) : (
                  <Mic className="w-4 h-4 text-muted-foreground" />
                )}
                
                {isHost && participant.id !== currentParticipantId && (
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button 
                      onClick={() => handleToggleMute(participant.id, !!participant.is_muted)}
                      className="p-1.5 hover:bg-secondary rounded-md text-slate-600 transition-colors"
                      title={participant.is_muted ? "Unmute" : "Mute"}
                    >
                      {participant.is_muted ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={() => handleRemove(participant.id)}
                      className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md text-slate-600 transition-colors"
                      title="Remove Participant"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isHost && (
        <div className="p-4 border-t border-border bg-secondary">
          <button 
            onClick={handleMuteAll}
            className="w-full bg-card border border-border hover:bg-secondary text-foreground font-medium py-2 rounded-lg transition-colors text-sm shadow-sm"
          >
            Mute All
          </button>
        </div>
      )}
    </div>
  );
}
