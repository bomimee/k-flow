from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound
from fastapi import HTTPException
import re
import yt_dlp
import os
import uuid
import whisper
from pydub import AudioSegment
import os

def extract_video_id(url: str) -> str:
    patterns = [
        r"v=([a-zA-Z0-9_-]{11})",
        r"youtu\.be/([a-zA-Z0-9_-]{11})",
        r"shorts/([a-zA-Z0-9_-]{11})",
        r"embed/([a-zA-Z0-9_-]{11})"
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)

    raise ValueError("Invalid YouTube URL format")

def check_video_duration(url: str, max_minutes: int = 3):
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            duration = info.get('duration', 0)
            
            if duration > max_minutes * 60:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Video is too long ({int(duration/60)}m {duration%60}s). Please use a video under {max_minutes} minutes for optimal analysis."
                )
            return duration
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Failed to check duration: {e}")
        # If we can't fetch duration, just let it pass or raise an error. We'll let it pass smoothly relying on other checks if yt-dlp flat extract fails.
        return 0


def get_korean_transcript_raw(video_id: str):
    try:
        api = YouTubeTranscriptApi()
        return api.get_transcript(video_id, languages=["ko"])
    except Exception as e:
        print("❌ Raw transcript error:", e)
        return None

def get_korean_transcript_structured(video_id: str) -> str:
    """Returns transcript as a string with [ID] prefixes for LLM analysis."""
    try:
        transcript = get_korean_transcript_raw(video_id)
        if transcript:
            return "\n".join([f"[{i}] {t['text']}" for i, t in enumerate(transcript)])
        return None
    except Exception as e:
        print("❌ Structured transcript error:", e)
        return None

def get_korean_transcript(video_id: str):
    try:
        transcript = get_korean_transcript_raw(video_id)
        if transcript:
            return " ".join([t["text"] for t in transcript])
        return None
    except Exception as e:
        print("❌ Transcript error:", e)
        return None

    

def download_audio(video_url: str) -> str:
    os.makedirs("tmp", exist_ok=True)

    file_id = str(uuid.uuid4())
    output_template = f"tmp/{file_id}.%(ext)s"

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": output_template,
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
        }],
        "quiet": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([video_url])

    final_path = f"tmp/{file_id}.mp3"
    print(f"final_path={final_path}")
    return final_path


def extract_audio_timestamps(audio_path: str, expressions: list[str]) -> dict:
    """
    오디오 파일에서 각 표현이 나오는 타임스탬프를 Whisper word_timestamps를 이용해 정밀하게 찾습니다.
    """
    import whisper
    import re
    
    # Whisper로 전체 오디오 transcribe (단어 단위 타임스탬프 활성화)
    model = whisper.load_model("base")
    result = model.transcribe(audio_path, language="ko", word_timestamps=True)
    
    # 모든 단어 정보를 하나의 리스트로 통합
    all_words = []
    for segment in result["segments"]:
        if "words" in segment:
            for word_info in segment["words"]:
                all_words.append({
                    "word": re.sub(r'[^가-힣a-zA-Z0-9]', '', word_info["word"]),
                    "start": word_info["start"],
                    "end": word_info["end"]
                })
    
    def clean_text(t):
        return re.sub(r'[^가-힣a-zA-Z0-9]', '', t)

    timestamps = {}
    for expression in expressions:
        target_tokens = [clean_text(word) for word in expression.split() if clean_text(word)]
        if not target_tokens:
            continue
            
        best_match = None
        # 슬라이딩 윈도우로 단어 뭉치 찾기
        for i in range(len(all_words) - len(target_tokens) + 1):
            match_count = 0
            for j in range(len(target_tokens)):
                if target_tokens[j] in all_words[i+j]["word"] or all_words[i+j]["word"] in target_tokens[j]:
                    match_count += 1
            
            if match_count >= len(target_tokens) * 0.7: # 70% 이상 일치 시 매칭으로 간주
                best_match = {
                    "start": max(0, all_words[i]["start"] - 0.2), # 200ms 리드인
                    "end": all_words[i + len(target_tokens) - 1]["end"] + 0.3, # 300ms 여운
                    "text": expression
                }
                break
        
        if best_match:
            timestamps[expression] = best_match
        else:
            # Fallback: 세그먼트 단위 탐색
            for segment in result["segments"]:
                if clean_text(expression) in clean_text(segment["text"]):
                    timestamps[expression] = {
                        "start": max(0, segment["start"] - 0.2),
                        "end": segment["end"] + 0.3,
                        "text": segment["text"]
                    }
                    break
    
    return timestamps
    
    return timestamps

def extract_audio_clips(audio_path: str, timestamps: dict, output_dir: str) -> dict:
    """
    타임스탬프 기반으로 오디오 클립 추출
    """
    audio = AudioSegment.from_file(audio_path)
    clip_urls = {}
    
    os.makedirs(output_dir, exist_ok=True)
    
    for expression, ts in timestamps.items():
        start_ms = int(ts["start"] * 1000)
        end_ms = int(ts["end"] * 1000)
        
        # 클립 추출
        clip = audio[start_ms:end_ms]
        
        # 파일명 생성 (안전하게)
        safe_filename = "".join(c for c in expression if c.isalnum() or c in (' ', '_')).rstrip()
        output_path = os.path.join(output_dir, f"{safe_filename}.mp3")
        
        # 저장
        clip.export(output_path, format="mp3")
        clip_urls[expression] = f"/audio_clips/{safe_filename}.mp3"
    
    return clip_urls

