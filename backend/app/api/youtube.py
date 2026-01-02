from fastapi import APIRouter, HTTPException
from app.services.youtube import (
    extract_video_id, 
    get_korean_transcript, 
    download_audio, 
    extract_audio_timestamps, 
    extract_audio_clips
)
from app.services.llm import analyze_transcript_with_llm, speech_to_text
from app.schemas.youtube import YouTubeRequest
import os

router = APIRouter()

@router.post("/analyze-youtube")
def analyze_youtube(req: YouTubeRequest):
    video_id = extract_video_id(req.url)
    transcript = None
    source = None
    audio_file = None  # 오디오 파일 경로 저장용

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
            print("✅ STT 사용")
            # ⚠️ 여기서는 audio_file을 삭제하지 않음 (나중에 클립 추출에 사용)
        except Exception as e:
            print("❌ STT ERROR:", e)
            # STT 실패 시에만 오디오 파일 삭제
            if audio_file and os.path.exists(audio_file):
                os.remove(audio_file)
            raise HTTPException(status_code=500, detail=str(e))

    # 3️⃣ LLM 분석
    try:
        analysis = analyze_transcript_with_llm(transcript, req.level)
        print("✅ LLM 분석 결과 받음")
    except Exception as e:
        print("❌ LLM ERROR:", e)
        # LLM 실패 시 오디오 파일 삭제
        if audio_file and os.path.exists(audio_file):
            os.remove(audio_file)
        raise HTTPException(status_code=500, detail="LLM 분석 실패")

    # 4️⃣ 오디오 클립 추출 (오디오 파일이 있을 경우에만)
    audio_clip_info = {}
    if audio_file and os.path.exists(audio_file):
        try:
            print("🎵 오디오 클립 추출 시작...")
            
            # LLM 분석 결과에서 주요 표현 추출
            expressions_to_find = []
            if "key_expressions" in analysis:
                expressions_to_find = [
                    expr.get("expression", "")
                    for expr in analysis["key_expressions"]
                    if expr.get("expression")
                ]
            
            if expressions_to_find:
                print(f"📝 추출할 표현 개수: {len(expressions_to_find)}")
                
                # 타임스탬프 찾기
                timestamps = extract_audio_timestamps(audio_file, expressions_to_find)
                print(f"⏰ 찾은 타임스탬프: {len(timestamps)}개")
                
                # 오디오 클립 생성
                clips = extract_audio_clips(audio_file, timestamps, "static/audio_clips")
                print(f"🎵 생성된 클립: {len(clips)}개")
                
                # 분석 결과에 오디오 정보 추가
                for expr in analysis["key_expressions"]:
                    expression_text = expr.get("expression", "")
                    
                    if expression_text in timestamps:
                        expr["audio_timestamp"] = timestamps[expression_text]
                    
                    if expression_text in clips:
                        expr["audio_clip_url"] = clips[expression_text]
                
                audio_clip_info = {
                    "total_clips": len(clips),
                    "total_timestamps": len(timestamps)
                }
                print("✅ 오디오 클립 추출 완료")
            else:
                print("⚠️ 추출할 표현이 없습니다")
                
        except Exception as e:
            print(f"❌ 오디오 클립 추출 실패: {e}")
            # 클립 추출 실패는 치명적이지 않으므로 계속 진행
            # 단, 로그는 남김
        finally:
            # 오디오 클립 추출 완료 후 원본 오디오 파일 삭제
            if os.path.exists(audio_file):
                try:
                    os.remove(audio_file)
                    print("🗑️ 원본 오디오 파일 삭제 완료")
                except Exception as e:
                    print(f"⚠️ 오디오 파일 삭제 실패: {e}")

    # 5️⃣ 최종 결과 반환
    result = {
        "video_id": video_id,
        "youtube_url": req.url,  # 프론트엔드에서 유튜브 재생에 사용
        "source": source,
        "analysis": analysis
    }
    
    # 오디오 클립 정보가 있으면 추가
    if audio_clip_info:
        result["audio_info"] = audio_clip_info
    
    # 원본 오디오 파일 URL (클립이 있을 경우)
    if source == "speech":
        result["has_audio_clips"] = bool(audio_clip_info)
    
    return result