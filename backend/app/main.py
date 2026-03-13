# backend/app/main.py - Reloaded after installing supabase
from fastapi import FastAPI
from app.api.youtube import router as youtube_router
from app.api.vocabulary import router as vocabulary_router
from app.api.saved_items import router as saved_items_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Simplified for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#uvicorn app.main:app --reload
#https://www.youtube.com/watch?v=LIpyJY7QA1M

# Static 파일 서빙 설정 (오디오 클립용)
STATIC_DIR = "static"
os.makedirs(f"{STATIC_DIR}/audio_clips", exist_ok=True)

app.mount("/audio_clips", StaticFiles(directory=f"{STATIC_DIR}/audio_clips"), name="audio_clips")

from app.api.srs import router as srs_router
from app.api.habits import router as habits_router
from app.api.quiz import router as quiz_router
from app.api.users import router as users_router
from app.api.grammar import router as grammar_router

app.include_router(youtube_router, prefix="/api", tags=["YouTube"])
app.include_router(vocabulary_router, prefix="/api", tags=["Vocabulary"])
app.include_router(srs_router, prefix="/api", tags=["SRS"])
app.include_router(saved_items_router, prefix="/api", tags=["Saved Items"])
app.include_router(habits_router, prefix="/api", tags=["Habits"])
app.include_router(quiz_router, prefix="/api", tags=["Quiz"])
app.include_router(users_router, prefix="/api", tags=["Users"])
app.include_router(grammar_router, prefix="/api", tags=["Grammar"])
@app.get("/")
def read_root():
    return {"message": "Korean Learning API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
