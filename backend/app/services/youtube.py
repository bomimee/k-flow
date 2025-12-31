from youtube_transcript_api import YouTubeTranscriptApi
from fastapi import HTTPException
import re
import yt_dlp
import os
import uuid

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
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

def get_korean_transcript(video_id: str) -> str:
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)

        # 1️⃣ 수동 자막 우선
        if transcript_list.find_manually_created_transcript(["ko", "en"]):
            transcript = transcript_list.find_manually_created_transcript(["ko", "en"])
        else:
            # 2️⃣ 자동 생성 자막 fallback
            transcript = transcript_list.find_generated_transcript(["ko", "en"])

        return " ".join(item["text"] for item in transcript.fetch())

    except Exception as e:
        print("❌ 자막 가져오기 실패:", e)
        return ""

    

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
