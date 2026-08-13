"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Meeting } from "../../types/meeting";
import { leaveMeeting } from "../../lib/api";
import { toast } from "sonner";
import ParticipantPanel from "./ParticipantPanel";
import MeetingControls from "./MeetingControls";
import VideoGrid from "./VideoGrid";
import ConnectionQualityIndicator from "./ConnectionQualityIndicator";
import { useWebRTC } from "../../hooks/useWebRTC";
import { Info, X, Copy } from "lucide-react";

interface MeetingRoomProps {
  meetingCode: string;
  meeting: Meeting;
  participantId: number | null;
  localStream: MediaStream | null;
  screenStream?: MediaStream | null;
  isCameraOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onToggleScreenShare: () => void;
  onForceMuteMic: () => void;
  onStopMedia: () => void;
}

export default function MeetingRoom({ 
  meetingCode, 
  meeting, 
  participantId,
  localStream,
  screenStream,
  isCameraOn,
  isMicOn,
  isScreenSharing,
  onToggleCamera,
  onToggleMic,
  onToggleScreenShare,
  onForceMuteMic,
  onStopMedia
}: MeetingRoomProps) {
  const router = useRouter();
  
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  
  // Track who is sharing the screen (null = no one, number = participant ID)
  const [screenSharingPeerId, setScreenSharingPeerId] = useState<number | null>(null);

  // Construct the outgoing stream to send over WebRTC
  const outgoingStream = useMemo(() => {
    if (!localStream) return null;
    const stream = new MediaStream();
    
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) stream.addTrack(audioTrack);
    
    if (isScreenSharing && screenStream) {
      const screenTrack = screenStream.getVideoTracks()[0];
      if (screenTrack) stream.addTrack(screenTrack);
    } else {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) stream.addTrack(videoTrack);
    }
    
    return stream;
  }, [localStream, screenStream, isScreenSharing]);

  const handleMuteAllReceived = useCallback(() => {
    toast.info("The host has muted everyone.");
    onForceMuteMic();
  }, [onForceMuteMic]);

  const handleParticipantLeft = useCallback((leftId: number) => {
    setParticipants((prev) => prev.filter(p => p.id !== leftId));
    setScreenSharingPeerId(prev => prev === leftId ? null : prev);
  }, []);

  const handleScreenShareStarted = useCallback((senderId: number) => {
    setScreenSharingPeerId(senderId);
  }, []);

  const handleScreenShareStopped = useCallback((senderId: number) => {
    setScreenSharingPeerId(prev => prev === senderId ? null : prev);
  }, []);

  const { remoteStreams, sendHostCommand, broadcastMessage, getPeerConnections } = useWebRTC(
    meetingCode,
    participantId,
    outgoingStream,
    handleParticipantLeft,
    handleMuteAllReceived,
    handleScreenShareStarted,
    handleScreenShareStopped
  );

  // Broadcast to peers when our screen sharing state changes
  useEffect(() => {
    if (isScreenSharing) {
      setScreenSharingPeerId(participantId);
      broadcastMessage("screen_share_started");
    } else {
      if (screenSharingPeerId === participantId) {
        setScreenSharingPeerId(null);
      }
      broadcastMessage("screen_share_stopped");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScreenSharing, participantId]);

  const isLeavingRef = useRef(false);

  const handleLeave = useCallback(async () => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    
    try {
      if (participantId) {
        // Send a simulated transcript so the AI has something to analyze!
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
          const mockTranscript = `Alice: Hi everyone, thanks for joining the meeting today.
Bob: Hi Alice, glad to be here. What's on the agenda?
Alice: We need to finalize the Q3 marketing budget and decide on the new logo color.
Bob: I strongly suggest we use blue for the new logo, it looks more professional.
Alice: Agreed. Let's make it blue. I'll take the action item to update the design by Friday.
Bob: Sounds good. I'll review the budget numbers and send you an email tomorrow.
Alice: Perfect, let's wrap up. Thanks!`;
          
          await fetch(`${API_BASE}/meetings/${meetingCode}/transcript`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript: mockTranscript })
          });
          
          // Trigger analysis automatically
          await fetch(`${API_BASE}/meetings/${meetingCode}/analyze`, { method: 'POST' });
        } catch (e) {
          console.error("Failed to submit transcript", e);
        }

        await leaveMeeting(meetingCode, participantId);
      }
    } catch (error) {
      console.error("Failed to leave meeting properly", error);
    } finally {
      onStopMedia();
      sessionStorage.removeItem("participantId");
      sessionStorage.removeItem("displayName");

      toast.info("You left the meeting");
      router.replace("/");
    }
  }, [meetingCode, participantId, onStopMedia, router]);

  const copyInvite = () => {
    navigator.clipboard.writeText(meeting.invite_link);
    toast.success("Invite link copied!");
  };

  return (
    <div className="fixed inset-0 bg-[#0B0F19] flex flex-col z-50">
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-3">
          <div className="bg-card/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="font-medium text-sm">{meeting.title}</span>
            <span className="text-white/60 text-xs ml-2 border-l border-white/20 pl-2">{meeting.meeting_code}</span>
          </div>
          <ConnectionQualityIndicator getPeerConnections={getPeerConnections} />
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="bg-card/10 backdrop-blur-md p-2 rounded-lg border border-white/20 text-white hover:bg-card/20 transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex relative overflow-hidden pb-20">
        <div className={`flex-1 transition-all duration-300 flex items-center justify-center ${isParticipantsOpen ? "mr-80" : ""}`}>
          <VideoGrid 
            localStream={localStream}
            screenStream={screenStream}
            remoteStreams={remoteStreams}
            participants={participants}
            currentParticipantId={participantId}
            screenSharingPeerId={screenSharingPeerId}
          />
        </div>

        {/* Meeting Info Overlay */}
        {showInfo && (
          <div className={`absolute top-20 right-6 w-80 bg-card rounded-xl shadow-xl border border-border p-5 z-20 ${isParticipantsOpen ? "mr-80" : ""}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Meeting Details</h3>
              <button onClick={() => setShowInfo(false)} className="text-muted-foreground hover:bg-secondary p-1 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Meeting Link</p>
                <div className="flex">
                  <input
                    readOnly
                    value={meeting.invite_link}
                    className="flex-1 px-3 py-2 bg-secondary border border-border rounded-l-lg text-slate-700 text-sm outline-none w-full truncate"
                  />
                  <button
                    onClick={copyInvite}
                    className="bg-primary hover:bg-[#0948CC] text-white px-3 rounded-r-lg transition-colors flex items-center justify-center shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Meeting Code</p>
                <p className="font-mono text-foreground font-medium">{meeting.meeting_code}</p>
              </div>
            </div>
          </div>
        )}

        <ParticipantPanel
          meetingCode={meetingCode}
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          onParticipantsUpdate={setParticipants}
          sendHostCommand={sendHostCommand}
        />
      </div>

      <MeetingControls
        onToggleMic={onToggleMic}
        onToggleCamera={onToggleCamera}
        onToggleScreenShare={onToggleScreenShare}
        onToggleParticipants={() => setIsParticipantsOpen(!isParticipantsOpen)}
        onLeave={handleLeave}
        isMicOn={isMicOn}
        isCameraOn={isCameraOn}
        isScreenSharing={isScreenSharing}
        isParticipantsOpen={isParticipantsOpen}
      />
    </div>
  );
}
