# Screen Share Architecture Guide

## Overview
The application supports native WebRTC screen sharing. The core requirement is that **the local camera must remain active** while presenting the screen, allowing a Picture-in-Picture (PiP) experience.

## Media Stream Separation
To support simultaneous camera and screen sharing, `useMediaStream` maintains two independent streams:
1. `localStream`: Contains the user's camera and microphone tracks.
2. `screenStream`: Contains the display media tracks when sharing is active.

When a user clicks "Share Screen", the application requests display permissions, but does **not** stop the tracks inside `localStream`.

## WebRTC Transmission (`replaceTrack`)
While the local client retains both streams, WebRTC transmits the active content to remote peers using `RTCRtpSender.replaceTrack()`.
- **Normal Mode**: The `outgoingStream` is composed of `localStream` (audio + video).
- **Presentation Mode**: The `outgoingStream` is composed of `localStream` (audio) + `screenStream` (video).
- `useWebRTC` dynamically replaces the video track on the active `RTCPeerConnection` instances. This means remote participants see the screen share *instead* of the presenter's camera. This approach avoids complex SDP renegotiation and transceiver management, ensuring high compatibility and performance.

## Signaling & Layout
To trigger the correct layout, the application must distinguish a regular camera stream from a screen share stream.
1. When a user starts sharing, `MeetingRoom` sends a `screen_share_started` signaling message via the WebSocket.
2. When stopped, it sends `screen_share_stopped`.
3. The `VideoGrid` component listens for these events and updates `screenSharingPeerId`.
4. If a screen share is active, the grid switches to a "Presenter Layout":
   - The shared stream occupies the main primary area (using `object-fit: contain`).
   - All other participant cameras (and the local PiP camera) are placed in a side/bottom panel.
   - Screen shares are intentionally **not** mirrored, unlike local camera feeds.
