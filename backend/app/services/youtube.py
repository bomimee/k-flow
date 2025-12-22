# backend/app/services/youtube.py
from youtube_transcript_api import YouTubeTranscriptApi
import re

def extract_video_id(url: str) -> str:
    match = re.search(r"v=([^&]+)", url)
    if not match:
        raise ValueError("Invalid YouTube URL")
    return match.group(1)

def get_korean_transcript(url: str) -> str:
    video_id = extract_video_id(url)

    transcript = YouTubeTranscriptApi.get_transcript(
        video_id,
        languages=["ko"]
    )

    text = " ".join([item["text"] for item in transcript])
    return text
