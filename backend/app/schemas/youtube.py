from pydantic import BaseModel

class YouTubeRequest(BaseModel):
    url: str
    level: str
