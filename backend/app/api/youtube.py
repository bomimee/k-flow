from fastapi import APIRouter, HTTPException
from app.services.youtube import (
    extract_video_id, 
    check_video_duration,
    get_korean_transcript, 
    get_korean_transcript_raw,
    download_audio, 
    extract_audio_timestamps, 
    extract_audio_clips
)
from app.services.llm import analyze_transcript_with_llm, speech_to_text
from app.schemas.youtube import YouTubeRequest
import os
from yt_dlp.utils import DownloadError
from supabase import create_client, Client
import requests

router = APIRouter()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

@router.get("/trending-youtube")
def get_trending_youtube():
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        return [
            {"title": "한국어 발음 연습하기 좋은 영상", "url": "https://www.youtube.com/watch?v=LIpyJY7QA1M", "thumbnail": "https://img.youtube.com/vi/LIpyJY7QA1M/mqdefault.jpg"},
            {"title": "KBS News 유튜브 뉴스", "url": "https://www.youtube.com/watch?v=Gj972I5QamI", "thumbnail": "https://img.youtube.com/vi/Gj972I5QamI/mqdefault.jpg"},
            {"title": "침착맨 - 일상 이야기", "url": "https://www.youtube.com/watch?v=KzVb3s89w1s", "thumbnail": "https://img.youtube.com/vi/KzVb3s89w1s/mqdefault.jpg"}
        ]
        
    try:
        url = "https://www.googleapis.com/youtube/v3/videos"
        params = {
            "part": "snippet",
            "chart": "mostPopular",
            "regionCode": "KR",
            "videoCategoryId": "24",
            "maxResults": 10,
            "key": api_key
        }
        res = requests.get(url, params=params)
        data = res.json()
        
        videos = []
        for item in data.get("items", []):
            videos.append({
                "title": item["snippet"]["title"],
                "url": f"https://www.youtube.com/watch?v={item['id']}",
                "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"]
            })
        return videos
    except Exception as e:
        print("❌ 트렌딩 비디오 가져오기 실패:", e)
        raise HTTPException(status_code=500, detail="인기 동영상을 가져오는데 실패했습니다.")


@router.post("/analyze-youtube")
def analyze_youtube(req: YouTubeRequest):
    video_id = extract_video_id(req.url)
    
    # ⏱️ Check video duration (Shorts max 2 mins, Regular max 5 mins)
    max_mins = 2 if req.video_type == "shorts" else 5
    check_video_duration(req.url, max_minutes=max_mins)

    transcript = None
    source = None
    audio_file = None  # 오디오 파일 경로 저장용
    is_cached = False

    # 0️⃣ DB에서 먼저 확인 (캐싱)
    try:
        db_result = supabase.table("transcripts").select("*").eq("video_id", video_id).execute()
        if db_result.data:
            transcript = db_result.data[0]["transcript"]
            source = db_result.data[0]["source"]
            is_cached = True
            print(f"✅ DB에서 자막 가져옴 (source: {source})")
    except Exception as e:
        print("❌ DB 조회 실패:", e)

    # 1️⃣ 자막 먼저 시도
    if not transcript:
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

        try:
            audio_file = download_audio(req.url)
        except DownloadError as e:
            print("❌ yt-dlp 다운로드 실패:", e)
            raise HTTPException(
                status_code=403,
                detail="YouTube 오디오 다운로드가 차단되었습니다 (403)"
            )
        except Exception as e:
            print("❌ 오디오 다운로드 예외:", e)
            raise HTTPException(
                status_code=500,
                detail="오디오 다운로드 중 오류 발생"
            )

        if not audio_file or not os.path.exists(audio_file):
            raise HTTPException(status_code=500, detail="오디오 파일 생성 실패")

        try:
            transcript = speech_to_text(audio_file)
            if not transcript:
                raise HTTPException(status_code=500, detail="음성 인식(STT) 실패")

            source = "speech"
            print("✅ STT 사용")

        except Exception as e:
            print("❌ STT ERROR:", e)
            if audio_file and os.path.exists(audio_file):
                os.remove(audio_file)
            raise HTTPException(status_code=500, detail="STT 처리 실패")

    # [NEW] DB에 저장
    if transcript and not is_cached:
        try:
            supabase.table("transcripts").insert({
                "video_id": video_id,
                "transcript": transcript,
                "source": source
            }).execute()
            print("✅ DB에 자막 저장 완료")
        except Exception as e:
            print("❌ DB 자막 저장 실패:", e)

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

    # 4️⃣ 자막 타임스탬프 매칭 (자막이 원본인 경우)
    if source == "subtitle" and "key_expressions" in analysis:
        print("🕒 자막에서 타임스탬프 매칭 시작...")
        transcript_raw = get_korean_transcript_raw(video_id)
        if transcript_raw:
            for expr in analysis.get("key_expressions", []):
                target_text = expr.get("example_in_context", "") or expr.get("expression", "")
                if not target_text:
                    continue
                
                target_clean = target_text.replace(" ", "")
                best_match = None
                for t in transcript_raw:
                    t_clean = t["text"].replace(" ", "")
                    if (target_clean in t_clean or t_clean in target_clean) and len(t_clean) > 2:
                        best_match = t
                        break
                        
                if best_match:
                    expr["audio_timestamp"] = {
                        "start": best_match["start"],
                        "end": best_match["start"] + best_match.get("duration", 3.0),
                        "text": best_match["text"]
                    }

    # 5️⃣ 오디오 클립 추출 (오디오 다운로드 STT인 경우)
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