# WebRTC and WebSockets Guide

This guide explains the real-time communication architecture used in the Zoom Clone application.

## Overview

To enable real-time video and audio, the application uses **WebRTC** (Web Real-Time Communication) to establish direct peer-to-peer media connections, and **WebSockets** for the initial signaling process.

## Signaling with WebSockets

Before two peers can stream video to each other, they need to know how to connect. This process of exchanging connection information is called **Signaling**.

We use a **FastAPI WebSocket** endpoint (`/ws/meetings/{meeting_code}/{participant_id}`) to handle signaling because WebSockets provide a persistent, full-duplex communication channel.

When a participant joins:
1. They connect to the WebSocket room.
2. The server broadcasts a `participant_joined` event to all other clients.
3. Existing clients generate an **SDP Offer** and send it via the WebSocket.
4. The new client receives the offer and sends an **SDP Answer** back.

## What is an SDP Offer and Answer?
SDP (Session Description Protocol) is a standard format for describing multimedia communication sessions.
- **Offer**: A proposal sent by the initiator describing their media capabilities (e.g., "I can send H.264 video and Opus audio").
- **Answer**: The response from the receiver accepting the terms and providing their own capabilities.

## ICE Candidates and STUN/TURN

Even after agreeing on media capabilities, peers need to figure out how to physically route data to each other across the internet (through routers, NATs, and firewalls).

- **ICE (Interactive Connectivity Establishment)**: The framework used to find the best path between peers. Clients generate ICE candidates (potential network paths) and exchange them via our WebSocket signaling server.
- **STUN (Session Traversal Utilities for NAT)**: A lightweight server that helps a client discover its own public IP address and port so it can share it with the peer. We use Google's public STUN servers for this project.
- **TURN (Traversal Using Relays around NAT)**: If a direct peer-to-peer connection is blocked (e.g., by a strict corporate firewall), a TURN server acts as a relay to pass the media data. (Not used in this simplified assignment).

## Why not send video through FastAPI REST or WebSockets?
Sending continuous, high-bandwidth video data through HTTP REST endpoints is extremely inefficient and introduces massive latency. While WebSockets are better for real-time text, they run over TCP, which guarantees packet delivery. In video streaming, waiting for a delayed packet causes buffering. 
WebRTC uses UDP by default, which allows dropping late packets to keep the video feed live and responsive. WebRTC also handles the complexities of echo cancellation, bandwidth estimation, and packet loss automatically.

## Mesh Architecture vs. SFU
This assignment uses a **Mesh Architecture**, meaning every participant establishes a direct peer-to-peer connection with every other participant.
- If there are 4 participants, each person uploads their video 3 times and downloads 3 videos.
- This works well for small meetings (2-4 people) because it's cheap and requires no media server.

### Scaling to 100 Participants
A Mesh network collapses under its own weight around 6-10 participants because the bandwidth and CPU requirements grow exponentially.
To support 100 participants, the architecture must evolve to use an **SFU (Selective Forwarding Unit)** like Mediasoup or LiveKit.
In an SFU architecture, each client uploads their video exactly *once* to a central server, and the server selectively forwards the videos to everyone else.

## Summary of the Flow
1. User clicks Join -> `navigator.mediaDevices.getUserMedia` acquires hardware access.
2. User connects to WebSocket -> `useWebRTC` hook starts signaling.
3. SDP Offers, Answers, and ICE Candidates are exchanged.
4. `RTCPeerConnection` establishes a direct path.
5. The `onTrack` event fires, and the remote `MediaStream` is attached to a `<video>` element in `VideoTile`.
