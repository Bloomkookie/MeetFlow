"use client";

import { Mic, MicOff, Video, VideoOff, Monitor, Users, PhoneOff } from "lucide-react";

interface MeetingControlsProps {
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleParticipants: () => void;
  onLeave: () => void;
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isParticipantsOpen: boolean;
}

export default function MeetingControls({
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleParticipants,
  onLeave,
  isMicOn,
  isCameraOn,
  isScreenSharing,
  isParticipantsOpen,
}: MeetingControlsProps) {
  return (
    <div className="h-20 bg-[#161B26] flex items-center justify-center px-6 border-t border-[#273244] absolute bottom-0 w-full z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMic}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors ${
            !isMicOn ? "bg-gray-500 text-[#F8FAFC]" : "bg-[#242C3B] text-[#F8FAFC] hover:bg-[#334155]"
          }`}
        >
          {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          <span className="text-[10px] mt-1 font-medium">{isMicOn ? "Mute" : "Unmute"}</span>
        </button>

        <button
          onClick={onToggleCamera}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors ${
            !isCameraOn ? "bg-gray-500 text-[#F8FAFC]" : "bg-[#242C3B] text-[#F8FAFC] hover:bg-[#334155]"
          }`}
        >
          {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          <span className="text-[10px] mt-1 font-medium">{isCameraOn ? "Stop Video" : "Start Video"}</span>
        </button>

        <button
          onClick={onToggleScreenShare}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors ${
            isScreenSharing ? "bg-[#3B82F6] text-white" : "bg-[#242C3B] text-[#F8FAFC] hover:bg-[#334155]"
          }`}
        >
          <Monitor className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium">{isScreenSharing ? "Stop Sharing" : "Share Screen"}</span>
        </button>

        <button
          onClick={onToggleParticipants}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors ${
            isParticipantsOpen ? "bg-[#3B82F6] text-white" : "bg-[#242C3B] text-[#F8FAFC] hover:bg-[#334155]"
          }`}
        >
          <Users className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium">People</span>
        </button>
        
        <div className="w-px h-10 bg-[#334155] mx-2"></div>

        <button
          onClick={onLeave}
          className="flex flex-col items-center justify-center w-16 h-14 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] dark:bg-[#EF4444] dark:hover:bg-[#DC2626] text-white transition-colors ml-2"
        >
          <PhoneOff className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium">Leave</span>
        </button>
      </div>
    </div>
  );
}
