"use client";

import { useEffect, useRef } from "react";
import { MicOff, CameraOff } from "lucide-react";

interface VideoTileProps {
  stream: MediaStream | null;
  displayName: string;
  isLocal?: boolean;
  isHost?: boolean;
  isMuted?: boolean;
  isScreenSharing?: boolean;
  objectFit?: "cover" | "contain";
}

export default function VideoTile({
  stream,
  displayName,
  isLocal = false,
  isHost = false,
  isMuted = false,
  isScreenSharing = false,
  objectFit = "cover",
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if camera is off by looking at the video tracks of the stream
  const isVideoOff = !stream || stream.getVideoTracks().length === 0 || !stream.getVideoTracks()[0].enabled;

  useEffect(() => {
    if (videoRef.current && stream && !isVideoOff) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isVideoOff]);

  return (
    <div className="relative w-full h-full bg-[#161B26] hover:bg-[#1D2533] transition-colors rounded-xl overflow-hidden shadow-md border border-[#273244] flex items-center justify-center">
      {!isVideoOff && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Always mute local video to prevent echo
          className={`w-full h-full ${objectFit === "contain" ? "object-contain bg-black" : "object-cover"} ${isLocal && !isScreenSharing ? "transform -scale-x-100" : ""}`}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-[#A8B3C7] h-full w-full bg-[#161B26]">
          <div className="w-20 h-20 bg-[#242C3B] rounded-full flex items-center justify-center text-3xl text-[#F8FAFC] font-bold mb-4 shadow-lg border-2 border-[#273244]">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Name tag and indicators */}
      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-white text-xs font-medium flex items-center gap-2">
        <span className="truncate max-w-[120px]">{displayName} {isLocal && "(You)"}</span>
        {isHost && (
            <span className="text-[9px] uppercase tracking-wider font-semibold text-primary bg-blue-50/20 px-1.5 rounded-sm">
            Host
            </span>
        )}
        {isMuted && <MicOff className="w-3.5 h-3.5 text-red-500" />}
      </div>
    </div>
  );
}
