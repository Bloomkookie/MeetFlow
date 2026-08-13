import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

export function useMediaStream() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const startMedia = useCallback(async (video = true, audio = true) => {
    setIsLoading(true);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video,
        audio,
      });
      setLocalStream(mediaStream);
      localStreamRef.current = mediaStream;
      setIsCameraOn(video);
      setIsMicOn(audio);
      return mediaStream;
    } catch (err: any) {
      console.error("Error accessing media devices.", err);
      let errorMessage = "Could not access camera or microphone.";
      if (err.name === "NotAllowedError") {
        errorMessage = "Permission to access camera or microphone was denied.";
      } else if (err.name === "NotFoundError") {
        errorMessage = "No camera or microphone found on this device.";
      }
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
  }, []);

  const toggleCamera = useCallback(async () => {
    if (isCameraOn) {
      if (localStream) {
        localStream.getVideoTracks().forEach((track) => {
          track.stop();
          localStream.removeTrack(track);
        });
        const updatedStream = new MediaStream(localStream.getTracks());
        setLocalStream(updatedStream);
        localStreamRef.current = updatedStream;
      }
      setIsCameraOn(false);
    } else {
      try {
        const newMedia = await navigator.mediaDevices.getUserMedia({ video: true });
        const newVideoTrack = newMedia.getVideoTracks()[0];
        if (localStream) {
          localStream.addTrack(newVideoTrack);
          const updatedStream = new MediaStream(localStream.getTracks());
          setLocalStream(updatedStream);
          localStreamRef.current = updatedStream;
        } else {
          setLocalStream(newMedia);
          localStreamRef.current = newMedia;
        }
        setIsCameraOn(true);
      } catch (err) {
        console.error("Failed to turn camera back on", err);
        toast.error("Could not access camera.");
      }
    }
  }, [isCameraOn, localStream]);

  const toggleMic = useCallback(async () => {
    if (isMicOn) {
      if (localStream) {
        localStream.getAudioTracks().forEach((track) => {
          track.stop();
          localStream.removeTrack(track);
        });
        const updatedStream = new MediaStream(localStream.getTracks());
        setLocalStream(updatedStream);
        localStreamRef.current = updatedStream;
      }
      setIsMicOn(false);
    } else {
      try {
        const newMedia = await navigator.mediaDevices.getUserMedia({ audio: true });
        const newAudioTrack = newMedia.getAudioTracks()[0];
        if (localStream) {
          localStream.addTrack(newAudioTrack);
          const updatedStream = new MediaStream(localStream.getTracks());
          setLocalStream(updatedStream);
          localStreamRef.current = updatedStream;
        } else {
          setLocalStream(newMedia);
          localStreamRef.current = newMedia;
        }
        setIsMicOn(true);
      } catch (err) {
        console.error("Failed to turn mic back on", err);
        toast.error("Could not access microphone.");
      }
    }
  }, [isMicOn, localStream]);

  const forceMuteMic = useCallback(() => {
    if (isMicOn && localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.stop();
        localStream.removeTrack(track);
      });
      const updatedStream = new MediaStream(localStream.getTracks());
      setLocalStream(updatedStream);
      localStreamRef.current = updatedStream;
      setIsMicOn(false);
    }
  }, [isMicOn, localStream]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen sharing, clear screenStream. localStream remains untouched.
      try {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((track) => track.stop());
        }
        setScreenStream(null);
        screenStreamRef.current = null;
        setIsScreenSharing(false);
      } catch (err) {
        console.error("Failed to stop screen sharing", err);
      }
    } else {
      // Start screen sharing
      try {
        const displayMedia = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const displayTrack = displayMedia.getVideoTracks()[0];
        
        setScreenStream(displayMedia);
        screenStreamRef.current = displayMedia;
        setIsScreenSharing(true);
        
        displayTrack.onended = () => {
            // Revert back when browser UI "Stop Sharing" is clicked
            setIsScreenSharing(false);
            setScreenStream(null);
            screenStreamRef.current = null;
        };

      } catch (err) {
        console.error("Failed to start screen sharing", err);
      }
    }
  }, [isScreenSharing]);

  return {
    localStream,
    screenStream,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    error,
    isLoading,
    startMedia,
    stopMedia,
    toggleCamera,
    toggleMic,
    toggleScreenShare,
    forceMuteMic,
  };
}
