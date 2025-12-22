from app.services.youtube import extract_video_id, get_korean_transcript
from app.services.llm import analyze_transcript_with_llm
from fastapi import APIRouter

router = APIRouter()

@router.post("/analyze-youtube")
def analyze_youtube(req: YouTubeRequest):
    print("✅ 요청 URL:", req.url)

    video_id = extract_video_id(req.url)
    print("✅ video_id:", video_id)

    transcript = get_korean_transcript(video_id)
    print("✅ transcript 길이:", len(transcript))

    if not transcript:
        print("❌ 자막 없음")
        return {"message": "자막을 찾을 수 없습니다."}

    analysis = analyze_transcript_with_llm(transcript)
    print("✅ LLM 분석 결과:", analysis)

    return {
        "video_id": video_id,
        "analysis": analysis
    }
