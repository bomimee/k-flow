# backend/app/api/youtube.py
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.youtube import get_korean_transcript
from app.services.llm import analyze_korean

router = APIRouter()

class YouTubeRequest(BaseModel):
    url: str

@router.post("/analyze-youtube")
def analyze_youtube(req: YouTubeRequest):
    transcript = get_korean_transcript(req.url)
    result = analyze_korean(transcript)
    return {"result": result}
