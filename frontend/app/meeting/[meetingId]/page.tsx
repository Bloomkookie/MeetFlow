"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Meeting } from "../../../types/meeting";
import { getMeeting } from "../../../lib/api";
import MeetingRoom from "../../../components/meetings/MeetingRoom";
import PreJoinScreen from "../../../components/meetings/PreJoinScreen";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useMediaStream } from "../../../hooks/useMediaStream";

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params?.meetingId as string;
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<number | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  const {
    localStream,
    screenStream,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    isLoading: isMediaLoading,
    startMedia,
    stopMedia,
    toggleCamera,
    toggleMic,
    toggleScreenShare,
    forceMuteMic
  } = useMediaStream();

  useEffect(() => {
    async function loadMeeting() {
      if (!meetingId) return;
      
      try {
        const data = await getMeeting(meetingId);
        setMeeting(data);
        
        // Check if user is already a participant
        const storedParticipantId = sessionStorage.getItem("participantId");
        
        if (storedParticipantId) {
          setParticipantId(parseInt(storedParticipantId));
          // Start media for pre-join screen
          await startMedia(true, true);
        } else {
          // If not host and no participant ID, redirect to join
          router.push(`/join?code=${meetingId}`);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load meeting");
      } finally {
        setLoading(false);
      }
    }
    
    loadMeeting();

    // Clean up media unconditionally on unmount
    return () => {
      stopMedia();
    };
  }, [meetingId, router, startMedia, stopMedia]);

  const handleJoin = () => {
    setHasJoined(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Preparing meeting environment...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <EmptyState 
            icon={<AlertCircle className="w-10 h-10 text-red-500" />}
            title="Meeting Not Found"
            description={error || "The meeting you are trying to join does not exist or has ended."}
          />
          <div className="mt-6 flex justify-center">
            <Link 
              href="/"
              className="bg-primary hover:bg-[#0948CC] text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!participantId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary">
        <LoadingSpinner size="md" />
        <p className="mt-4 text-muted-foreground">Redirecting to join screen...</p>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <PreJoinScreen
        stream={localStream}
        isCameraOn={isCameraOn}
        isMicOn={isMicOn}
        onToggleCamera={toggleCamera}
        onToggleMic={toggleMic}
        onJoin={handleJoin}
        isLoading={isMediaLoading}
      />
    );
  }

  return (
    <MeetingRoom 
      meetingCode={meetingId} 
      meeting={meeting} 
      participantId={participantId}
      localStream={localStream}
      screenStream={screenStream}
      isCameraOn={isCameraOn}
      isMicOn={isMicOn}
      isScreenSharing={isScreenSharing}
      onToggleCamera={toggleCamera}
      onToggleMic={toggleMic}
      onToggleScreenShare={toggleScreenShare}
      onForceMuteMic={forceMuteMic}
      onStopMedia={stopMedia}
    />
  );
}
