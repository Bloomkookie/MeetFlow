"use client";

import VideoTile from "./VideoTile";
import { Participant } from "../../types/participant";

interface VideoGridProps {
  localStream: MediaStream | null;
  screenStream?: MediaStream | null;
  remoteStreams: Record<number, MediaStream>;
  participants: Participant[];
  currentParticipantId: number | null;
  screenSharingPeerId: number | null;
}

export default function VideoGrid({
  localStream,
  screenStream,
  remoteStreams,
  participants,
  currentParticipantId,
  screenSharingPeerId
}: VideoGridProps) {
  
  if (screenSharingPeerId !== null) {
    // Determine the main screen share stream
    const isLocalSharing = screenSharingPeerId === currentParticipantId;
    const mainStream = isLocalSharing ? screenStream : remoteStreams[screenSharingPeerId];
    
    // Find the participant object for the sharer
    const sharer = participants.find(p => p.id === screenSharingPeerId);
    const sharerName = sharer ? sharer.display_name : "Someone";

    return (
      <div className="w-full h-full max-h-[85vh] p-4 flex flex-col md:flex-row gap-4">
        {/* Main Screen Share Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800 relative">
          <VideoTile
            stream={mainStream || null}
            displayName={`${sharerName}'s Screen`}
            isLocal={false} // Never mirror screen shares
            isScreenSharing={true}
            objectFit="contain"
          />
          
          {/* Local Camera PiP overlay if local user is sharing */}
          {isLocalSharing && localStream && (
             <div className="absolute bottom-4 right-4 w-48 aspect-video shadow-2xl rounded-lg overflow-hidden border-2 border-white/20 z-10">
               <VideoTile
                  stream={localStream}
                  displayName="You"
                  isLocal={true}
                  objectFit="cover"
               />
             </div>
          )}
        </div>

        {/* Side Panel for other participants */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto min-h-[120px]">
          {/* Always show local camera here if NOT the one sharing (since if sharing, it's PiP) */}
          {!isLocalSharing && (
            <div className="w-40 md:w-full flex-shrink-0 aspect-video">
              <VideoTile
                stream={localStream}
                displayName="You"
                isLocal={true}
              />
            </div>
          )}

          {/* Other remote participants (excluding the sharer) */}
          {participants.map((participant) => {
            if (participant.id === currentParticipantId) return null; // Handled above
            if (participant.id === screenSharingPeerId) return null; // Handled in main area

            return (
              <div key={participant.id} className="w-40 md:w-full flex-shrink-0 aspect-video">
                <VideoTile
                  stream={remoteStreams[participant.id] || null}
                  displayName={participant.display_name}
                  isLocal={false}
                  isHost={participant.role === "host"}
                  isMuted={participant.is_muted === 1}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Normal Grid Layout (No one is sharing)
  const totalTiles = participants.length;
  
  let gridCols = "grid-cols-1";
  if (totalTiles === 2) gridCols = "grid-cols-1 md:grid-cols-2";
  else if (totalTiles === 3 || totalTiles === 4) gridCols = "grid-cols-2";
  else if (totalTiles > 4) gridCols = "grid-cols-2 md:grid-cols-3";

  return (
    <div className={`w-full h-full max-h-[85vh] p-4 mx-auto grid gap-4 place-content-center aspect-video ${gridCols}`}>
      {participants.map((participant) => {
        const isLocal = participant.id === currentParticipantId;
        const stream = isLocal ? localStream : remoteStreams[participant.id] || null;
        
        return (
          <VideoTile
            key={participant.id}
            stream={stream}
            displayName={participant.display_name}
            isLocal={isLocal}
            isHost={participant.role === "host"}
            isMuted={participant.is_muted === 1}
          />
        );
      })}
    </div>
  );
}
