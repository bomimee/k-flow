import os
import json
from openai import OpenAI
from app.core.prompts import YOUTUBE_ANALYSIS_PROMPT
import whisper
import re

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def analyze_transcript_with_llm(transcript: str) -> dict:
    prompt = f"""
    {YOUTUBE_ANALYSIS_PROMPT}

    Transcript:
    {transcript[:4000]}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful language tutor."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4
    )

    content = response.choices[0].message.content
    print("🧠 LLM RAW RESPONSE ↓↓↓")
    print(repr(content))
    # 이후 JSON 파싱
    cleaned = extract_json(content)

    if not cleaned:
        return {
            "error": "LLM returned empty or invalid response",
            "raw_output": content
        }

    try:
        return json.loads(cleaned)

    except json.JSONDecodeError as e:
        return {
            "error": "JSON parsing failed",
            "exception": str(e),
            "raw_output": cleaned
        }

model = whisper.load_model("base")

def speech_to_text(audio_path: str) -> str:
    result = model.transcribe(audio_path, language="ko")
    return result["text"]


def extract_json(text: str) -> str | None:
    if not text:
        return None

    # ✅ markdown code block 제거
    text = re.sub(r"^```(?:json)?\s*", "", text.strip())
    text = re.sub(r"\s*```$", "", text)

    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1:
        return None

    return text[start:end+1]

# def speech_to_text(audio_path: str) -> str:
#     try:
#         print("🎧 STT 시작, 파일:", audio_path)

#         with open(audio_path, "rb") as f:
#             transcript = client.audio.transcriptions.create(
#                 model="gpt-4o-transcribe",
#                 file=f,
#                 language="ko"
#             )

#         print("✅ STT 성공")
#         return transcript.text

#     except Exception as e:
#         print("❌ STT 실패:", e)
#         return ""


#OPENAI_API_KEY="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"