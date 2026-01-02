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


def get_korean_transcript(video_id: str):
    try:
        api = YouTubeTranscriptApi()
        transcript = api.get_transcript(video_id, languages=["ko"])
        return " ".join([t["text"] for t in transcript])
    except NoTranscriptFound:
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
    오디오 파일에서 각 표현이 나오는 타임스탬프를 찾습니다.
    """
    # Whisper로 전체 오디오 transcribe (타임스탬프 포함)
    model = whisper.load_model("base")
    result = model.transcribe(audio_path, language="ko", word_timestamps=True)
    
    timestamps = {}
    
    for expression in expressions:
        # 각 표현이 나오는 위치 찾기
        for segment in result["segments"]:
            if expression in segment["text"]:
                timestamps[expression] = {
                    "start": segment["start"],
                    "end": segment["end"],
                    "text": segment["text"]
                }
                break
    
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

