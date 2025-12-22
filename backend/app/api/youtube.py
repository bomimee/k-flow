# backend/app/api/youtube.py
from fastapi import APIRouter
from pydantic import BaseModel
from fastapi import APIRouter
from app.services.youtube import extract_video_id, get_korean_transcript


router = APIRouter()

class YouTubeRequest(BaseModel):
    url: str

@router.post("/analyze-youtube")
def analyze_youtube(req: YouTubeRequest):
    video_id = extract_video_id(req.url)   # ⭐ 핵심
    transcript = get_korean_transcript(video_id)

    return {
        "video_id": video_id,
        "transcript": transcript
    }
