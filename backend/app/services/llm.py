# backend/app/services/llm.py
import openai
from app.core.prompts import YOUTUBE_ANALYSIS_PROMPT

openai.api_key = "YOUR_API_KEY"

def analyze_korean(text: str) -> str:
    prompt = YOUTUBE_ANALYSIS_PROMPT.format(text=text[:3000])

    response = openai.ChatCompletion.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": "You are a Korean language coach."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.6
    )

    return response.choices[0].message.content
