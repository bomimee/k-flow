import os
import json
from openai import OpenAI
from app.core.prompts import YOUTUBE_ANALYSIS_PROMPT

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def analyze_transcript_with_llm(transcript: str) -> dict:
    prompt = YOUTUBE_ANALYSIS_PROMPT.format(transcript=transcript[:4000])

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful language tutor."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4
    )

    content = response.choices[0].message.content
    return json.loads(content)
