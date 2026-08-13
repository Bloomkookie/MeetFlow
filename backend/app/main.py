from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes.meetings import router as meeting_router
from app.routes.participants import router as participant_router
from app.routes.websocket import router as websocket_router
from app.routes.users import router as user_router
from app.routes import zoomsense
from app.seed import seed_db

app = FastAPI(
    title="Zoom Clone API",
    description="Backend API for the Zoom Clone application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_BASE_URL, "http://localhost:3000"],
    allow_origin_regex="https://.*\.railway\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    seed_db()

app.include_router(meeting_router)
app.include_router(participant_router)
app.include_router(websocket_router)
app.include_router(user_router)
app.include_router(zoomsense.router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Zoom Clone API"}
