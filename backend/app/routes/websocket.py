from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
import json
from typing import Dict, List, Any

router = APIRouter(prefix="/ws/meetings", tags=["websocket"])

class ConnectionManager:
    def __init__(self):
        # meeting_code -> { participant_id -> WebSocket }
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, meeting_code: str, participant_id: str):
        await websocket.accept()
        if meeting_code not in self.active_connections:
            self.active_connections[meeting_code] = {}
        self.active_connections[meeting_code][participant_id] = websocket

    def disconnect(self, meeting_code: str, participant_id: str):
        if meeting_code in self.active_connections:
            if participant_id in self.active_connections[meeting_code]:
                del self.active_connections[meeting_code][participant_id]
            if len(self.active_connections[meeting_code]) == 0:
                del self.active_connections[meeting_code]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str, meeting_code: str, exclude_participant: str = None):
        if meeting_code in self.active_connections:
            for participant_id, connection in self.active_connections[meeting_code].items():
                if participant_id != exclude_participant:
                    try:
                        await connection.send_text(message)
                    except Exception:
                        pass
                        
    async def send_to_participant(self, message: str, meeting_code: str, target_participant_id: str):
        if meeting_code in self.active_connections:
            connection = self.active_connections[meeting_code].get(target_participant_id)
            if connection:
                try:
                    await connection.send_text(message)
                except Exception:
                    pass

manager = ConnectionManager()

@router.websocket("/{meeting_code}/{participant_id}")
async def websocket_endpoint(websocket: WebSocket, meeting_code: str, participant_id: str):
    await manager.connect(websocket, meeting_code, participant_id)
    
    # Notify others that someone joined
    join_message = {
        "type": "participant_joined",
        "participant_id": participant_id
    }
    await manager.broadcast(json.dumps(join_message), meeting_code, exclude_participant=participant_id)
    
    try:
        while True:
            try:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                msg_type = message_data.get("type")
                target = message_data.get("target")
                
                # Message enrichment
                message_data["sender"] = participant_id
                
                if target:
                    # Direct message to a specific peer (offer, answer, ice_candidate)
                    await manager.send_to_participant(json.dumps(message_data), meeting_code, str(target))
                else:
                    # Broadcast message to all peers in room
                    await manager.broadcast(json.dumps(message_data), meeting_code, exclude_participant=participant_id)
            except WebSocketDisconnect:
                # Re-raise to break the loop and trigger cleanup
                raise
            except Exception as e:
                print(f"Error processing message: {e}")
                # Don't break the loop, just ignore bad messages
                
    except WebSocketDisconnect:
        manager.disconnect(meeting_code, participant_id)
        leave_message = {
            "type": "participant_left",
            "participant_id": participant_id
        }
        await manager.broadcast(json.dumps(leave_message), meeting_code)
