from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound
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
