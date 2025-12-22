from youtube_transcript_api import YouTubeTranscriptApi
from fastapi import HTTPException
import re

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

def get_korean_transcript(video_id: str) -> str:
    try:
        transcript = YouTubeTranscriptApi.get_transcript(
            video_id,
            languages=["ko", "en"]
        )

        return " ".join(item["text"] for item in transcript)

    except Exception as e:
        # 🔥 여기서 XML 파싱 에러, 자막 없음 등을 모두 잡음
        return ""
