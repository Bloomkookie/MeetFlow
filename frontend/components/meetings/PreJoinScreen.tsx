"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";
import LoadingSpinner from "../ui/LoadingSpinner";

interface PreJoinScreenProps {
  stream: MediaStream | null;
  isCameraOn: boolean;
  isMicOn: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onJoin: () => void;
  isLoading: boolean;
}

export default function PreJoinScreen({
  stream,
  isCameraOn,
  isMicOn,
  onToggleCamera,
  onToggleMic,
  onJoin,
  isLoading
}: PreJoinScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-card p-8 rounded-2xl shadow-sm border border-border">
        {/* Video Preview */}
        <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center text-white">
              <LoadingSpinner size="md" />
              <p className="mt-4 text-sm text-gray-300">Starting camera...</p>
            </div>
          ) : isCameraOn && stream ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="flex flex-col items-center text-muted-foreground">
              <CameraOff className="w-12 h-12 mb-2" />
              <p>Camera is off</p>
            </div>
          )}

          {/* Controls overlay */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={onToggleMic}
              className={`p-3 rounded-full flex items-center justify-center transition-colors ${
                isMicOn ? "bg-gray-800/80 hover:bg-gray-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={onToggleCamera}
              className={`p-3 rounded-full flex items-center justify-center transition-colors ${
                isCameraOn ? "bg-gray-800/80 hover:bg-gray-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {isCameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Join Controls */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="text-3xl font-bold text-foreground mb-2">Ready to join?</h2>
          <p className="text-muted-foreground mb-8">
            {!stream && !isLoading ? "You can join without video or audio." : "Setup your audio and video."}
          </p>

          <button
            onClick={onJoin}
            disabled={isLoading}
            className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-[#0948CC] disabled:opacity-50 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            {isLoading ? "Preparing..." : "Join Meeting"}
          </button>
        </div>
      </div>
    </div>
  );
}
