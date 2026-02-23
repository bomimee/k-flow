# backend/app/main.py - Reloaded after installing supabase
from fastapi import FastAPI
from app.api.youtube import router as youtube_router
from app.api.vocabulary import router as vocabulary_router
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

app.include_router(youtube_router, prefix="/api", tags=["YouTube"])
app.include_router(vocabulary_router, prefix="/api", tags=["Vocabulary"])
@app.get("/")
def read_root():
    return {"message": "Korean Learning API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
