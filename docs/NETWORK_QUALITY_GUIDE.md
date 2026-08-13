# Network Quality Indicator Guide

## Overview
The application monitors WebRTC connection quality in real-time by extracting statistical metrics directly from the `RTCPeerConnection.getStats()` API.

## Implementation Details

### Connection State Lifecycle
The `useConnectionQuality` hook tracks the underlying WebRTC state machine (`pc.connectionState`):
- `new` / `connecting`: The UI displays "Checking connection..." or "Connecting..." without attempting to parse metrics.
- `connected`: The system begins polling `getStats()` every 2 seconds.
- `disconnected` / `failed` / `closed`: The UI reflects the failure state immediately (e.g., "Connection interrupted").

### Metric Extraction & Fallbacks
WebRTC metrics are notoriously inconsistent across browsers (e.g., Safari vs Chrome). 
The application implements defensive parsing:
1. It iterates over all active `RTCPeerConnection` instances.
2. It looks for `candidate-pair` reports to extract `currentRoundTripTime` or `roundTripTime`.
3. It looks for `inbound-rtp` reports to extract `jitter`, `packetsLost`, and `packetsReceived`.
4. If a metric is completely missing (e.g., jitter on some platforms), it is ignored. The quality score is averaged *only* across available metrics.
5. If **no** metrics are found despite being "connected", the state gracefully falls back to "Checking connection...".

### Development Diagnostics
In development mode (`NODE_ENV === "development"`), clicking the quality indicator reveals a detailed diagnostic overlay showing raw RTT, Packet Loss, Jitter, Bitrate, and the raw connection state.
