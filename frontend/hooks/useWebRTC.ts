import { useEffect, useRef, useState, useCallback } from "react";
import { Participant } from "../types/participant";
import { toast } from "sonner";

interface PeerConnectionData {
  pc: RTCPeerConnection;
  stream: MediaStream | null;
}

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8000/ws/meetings";

// Configuration for WebRTC
const RTC_CONFIG = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

export function useWebRTC(
  meetingCode: string, 
  participantId: number | null, 
  outgoingStream: MediaStream | null,
  onParticipantLeft?: (id: number) => void,
  onMuteAllReceived?: () => void,
  onScreenShareStarted?: (id: number) => void,
  onScreenShareStopped?: (id: number) => void,
  onTranscriptReceived?: (senderId: number, text: string) => void
) {
  const [remoteStreams, setRemoteStreams] = useState<Record<number, MediaStream>>({});
  const wsRef = useRef<WebSocket | null>(null);
  
  // Track peer connections by participant ID
  const peersRef = useRef<Record<number, PeerConnectionData>>({});

  // Maintain latest references to callbacks to avoid triggering useEffect unnecessarily
  const callbacksRef = useRef({
    onParticipantLeft,
    onMuteAllReceived,
    onScreenShareStarted,
    onScreenShareStopped
  });

  useEffect(() => {
    callbacksRef.current = {
      onParticipantLeft,
      onMuteAllReceived,
      onScreenShareStarted,
      onScreenShareStopped,
      onTranscriptReceived
    };
  }, [onParticipantLeft, onMuteAllReceived, onScreenShareStarted, onScreenShareStopped, onTranscriptReceived]);

  // Helper to cleanly close a single peer connection
  const closePeerConnection = useCallback((peerId: number) => {
    const peerData = peersRef.current[peerId];
    if (peerData) {
      peerData.pc.close();
      delete peersRef.current[peerId];
      
      setRemoteStreams((prev) => {
        if (!prev[peerId]) return prev;
        const next = { ...prev };
        delete next[peerId];
        return next;
      });
    }
  }, []);

  // Initialize a new peer connection
  const createPeerConnection = useCallback((peerId: number, isInitiator: boolean) => {
    if (peersRef.current[peerId]) {
      // Already exists
      return peersRef.current[peerId].pc;
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    
    // Add local tracks to the connection
    if (outgoingStream) {
      outgoingStream.getTracks().forEach((track) => {
        pc.addTrack(track, outgoingStream);
      });
    }

    // Handle incoming remote tracks
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams((prev) => ({
        ...prev,
        [peerId]: remoteStream,
      }));
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "ice_candidate",
            target: peerId,
            candidate: event.candidate,
          })
        );
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        closePeerConnection(peerId);
      }
    };

    peersRef.current[peerId] = { pc, stream: null };

    // If we are the initiator, create the offer
    if (isInitiator) {
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: "offer",
                target: peerId,
                sdp: pc.localDescription,
              })
            );
          }
        })
        .catch((e) => console.error("Error creating offer", e));
    }

    return pc;
  }, [outgoingStream, closePeerConnection]);


  // Sync outgoing stream tracks to all peers if the stream object changes
  useEffect(() => {
    if (!outgoingStream) return;
    Object.values(peersRef.current).forEach(({ pc }) => {
      const senders = pc.getSenders();
      
      const audioTrack = outgoingStream.getAudioTracks()[0];
      if (audioTrack) {
        const audioSender = senders.find(s => s.track?.kind === "audio");
        if (audioSender && audioSender.track !== audioTrack) {
          audioSender.replaceTrack(audioTrack);
        } else if (!audioSender) {
          pc.addTrack(audioTrack, outgoingStream);
        }
      }
      
      const videoTrack = outgoingStream.getVideoTracks()[0];
      if (videoTrack) {
        const videoSender = senders.find(s => s.track?.kind === "video");
        if (videoSender && videoSender.track !== videoTrack) {
          videoSender.replaceTrack(videoTrack);
        } else if (!videoSender) {
          pc.addTrack(videoTrack, outgoingStream);
        }
      }
    });
  }, [outgoingStream]);

  // Initialize WebSocket and set up message handlers
  useEffect(() => {
    if (!meetingCode || !participantId) return;

    // We don't reconnect if we already have an active WS to avoid loops during state changes.
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        return;
    }

    const ws = new WebSocket(`${WEBSOCKET_URL}/${meetingCode}/${participantId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected for WebRTC signaling");
    };

    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        const senderId = parseInt(message.sender);
        const callbacks = callbacksRef.current;
        
        switch (message.type) {
          case "participant_joined":
            // When someone new joins, they expect offers from existing participants
            // So we (an existing participant) create a PeerConnection as the initiator
            const newPeerId = parseInt(message.participant_id);
            if (newPeerId !== participantId) {
              createPeerConnection(newPeerId, true);
            }
            break;

          case "offer":
            {
              // We received an offer, so we create a connection and answer
              const pc = createPeerConnection(senderId, false);
              await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              ws.send(
                JSON.stringify({
                  type: "answer",
                  target: senderId,
                  sdp: pc.localDescription,
                })
              );
            }
            break;

          case "answer":
            {
              const peerData = peersRef.current[senderId];
              if (peerData) {
                await peerData.pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
              }
            }
            break;

          case "ice_candidate":
            {
              const peerData = peersRef.current[senderId];
              if (peerData) {
                await peerData.pc.addIceCandidate(new RTCIceCandidate(message.candidate));
              }
            }
            break;

          case "participant_left":
            {
              const leftPeerId = parseInt(message.participant_id);
              closePeerConnection(leftPeerId);
              if (callbacks.onParticipantLeft) {
                callbacks.onParticipantLeft(leftPeerId);
              }
            }
            break;
            
          case "mute_all":
            if (callbacks.onMuteAllReceived) {
                callbacks.onMuteAllReceived();
            }
            break;
            
          case "remove_participant":
            if (parseInt(message.target) === participantId) {
                toast.error("You have been removed by the host.");
                setTimeout(() => {
                    window.location.href = "/";
                }, 1000);
            } else {
                closePeerConnection(parseInt(message.target));
                if (callbacks.onParticipantLeft) {
                    callbacks.onParticipantLeft(parseInt(message.target));
                }
            }
            break;
            
          case "screen_share_started":
            if (callbacks.onScreenShareStarted) {
                callbacks.onScreenShareStarted(senderId);
            }
            break;
            
          case "screen_share_stopped":
            if (callbacks.onScreenShareStopped) {
                callbacks.onScreenShareStopped(senderId);
            }
            break;

          case "transcript_chunk":
            if (callbacks.onTranscriptReceived) {
                callbacks.onTranscriptReceived(senderId, message.text);
            }
            break;
        }
      } catch (err) {
        console.error("Error processing websocket message", err);
      }
    };

    ws.onerror = (error) => {
      console.log("WebSocket encountered an error or disconnected.");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
      }
      wsRef.current = null;
      
      // Clean up all peer connections idempotently
      Object.values(peersRef.current).forEach(({ pc }) => {
        pc.close();
      });
      peersRef.current = {};
      
      setRemoteStreams(prev => {
          if (Object.keys(prev).length === 0) return prev;
          return {};
      });
    };
  }, [meetingCode, participantId, createPeerConnection, closePeerConnection]);

  const sendHostCommand = useCallback((type: "mute_all" | "remove_participant", targetId?: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
            type,
            target: targetId
        }));
    }
  }, []);
  
  const broadcastMessage = useCallback((type: string, payload?: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
            type,
            ...payload
        }));
    }
  }, []);

  const getPeerConnections = useCallback(() => {
    return Object.values(peersRef.current).map(p => p.pc);
  }, []);

  return { remoteStreams, sendHostCommand, broadcastMessage, getPeerConnections };
}
