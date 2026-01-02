# app/schemas/youtube.py

from pydantic import BaseModel, Field
from typing import Literal, Optional

class YouTubeRequest(BaseModel):
    url: str = Field(..., description="YouTube video URL")
    level: Literal["beginner", "intermediate", "advanced"] = Field(
        default="intermediate",
        description="Learner's Korean level"
    )
    video_type: Optional[str] = Field(
        default="other",
        description="Type of video content (e.g., 'cooking show', 'variety', 'vlog', 'interview')"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "level": "intermediate",
                "video_type": "cooking show"
            }
        }