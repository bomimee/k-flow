from fastapi import APIRouter, HTTPException
from app.services.youtube import extract_video_id, get_korean_transcript, download_audio
from app.services.llm import analyze_transcript_with_llm, speech_to_text
from app.schemas.youtube import YouTubeRequest
import os

router = APIRouter()

@router.post("/analyze-youtube")
def analyze_youtube(req: YouTubeRequest):
    print("✅ req 분석 결과:", req)
    video_id = extract_video_id(req.url)
    transcript = get_korean_transcript(video_id)

    print(transcript)
    print("자막")

    if not transcript:
        audio_file = download_audio(req.url)

        if not os.path.exists(audio_file):
            return {"error": "오디오 다운로드 실패"}
        try:
            transcript = speech_to_text(audio_file)
            if not transcript:
                return {"error": "음성 인식 (STT) 실패"}
        except Exception as e:
            raise HTTPException(status_code=500, detail="음성 분석 실패")

        finally:
            if os.path.exists(audio_file):
                os.remove(audio_file)

    analysis = analyze_transcript_with_llm(transcript, req.level)
    print("✅ LLM 분석 결과:", analysis)

    return {
        "video_id": video_id,
        "source": "subtitle" if transcript else "speech",
        "analysis": analysis
    }