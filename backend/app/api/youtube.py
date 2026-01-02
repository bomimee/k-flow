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

    transcript = None
    source = None

    # 1️⃣ 자막 먼저 시도
    try:
        transcript = get_korean_transcript(video_id)
        if transcript:
            source = "subtitle"
            print("✅ 자막 사용")
    except Exception as e:
        print("❌ 자막 가져오기 실패:", e)

    # 2️⃣ 자막 없으면 STT
    if not transcript:
        print("⚠️ 자막 없음 → STT 진행")
        audio_file = download_audio(req.url)

        if not os.path.exists(audio_file):
            raise HTTPException(status_code=500, detail="오디오 다운로드 실패")

        try:
            transcript = speech_to_text(audio_file)
            if not transcript:
                raise HTTPException(status_code=500, detail="음성 인식(STT) 실패")
            source = "speech"
        except Exception as e:
            print("❌ STT ERROR:", e)
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if os.path.exists(audio_file):
                os.remove(audio_file)

    # 3️⃣ LLM 분석
    try:
        analysis = analyze_transcript_with_llm(transcript, req.level)
        print("✅ LLM 분석 결과:", analysis)
    except Exception as e:
        print("❌ LLM ERROR:", e)
        raise HTTPException(status_code=500, detail="LLM 분석 실패")

    return {
        "video_id": video_id,
        "source": source,
        "analysis": analysis
    }
