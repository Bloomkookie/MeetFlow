# ZoomSense Feature Guide

## Overview
**ZoomSense** is an AI-powered Meeting Intelligence workflow integrated into MeetFlow. It transforms raw meeting transcripts into actionable intelligence.

## How it works
1. **Meeting Occurs:** Users communicate using our WebRTC implementation.
2. **Transcript Generation:** (Mocked for now via API) Audio is transcribed.
3. **AI Analysis:** Using **LangGraph** and **LangChain** with OpenAI, the transcript is sent through a state graph.
4. **Structured Output:** The AI extracts:
   - **Executive Summary**
   - **Key Decisions**
   - **Discussion Topics**
   - **Action Items** (Assignee, Deadline, Task)
5. **Human-in-the-Loop:** AI action items are marked as `Pending Review`. A human must explicitly **Approve** or **Dismiss** them from the insights dashboard before they become final.

## Interacting with ZoomSense
- Navigate to the **Home** dashboard.
- Scroll down to the **Meeting History & Insights** section.
- Search for past meetings or topics.
- Click the chevron (>) next to a meeting to view its Insights page.
- If analysis hasn't run yet, click **Generate Insights**.
- Review Action items and approve them!
