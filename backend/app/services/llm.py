import os
import json
from google import genai
from google.genai import types
from app.core.prompts import YOUTUBE_ANALYSIS_PROMPT
import whisper
import re

from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_transcript_with_llm(transcript: str, level: str) -> dict:
    prompt = f"""
    You are a Korean language teacher.

    The learner's level is: {level}  # beginner / intermediate / advanced

    Analyze the following Korean transcript and return the result in JSON.

    Transcript:
    {transcript[:4000]}

    {YOUTUBE_ANALYSIS_PROMPT}
    """

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction="You are a helpful language tutor.",
            temperature=0.4,
        ),
    )

    content = response.text
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

def generate_grammar_quiz(title: str, meaning: str, description: str) -> dict:
    prompt = f"""
    You are an expert Korean language teacher. 
    A student is practicing the grammar point: {title}
    Meaning: {meaning}
    Rule: {description}
    
    Please generate ONE new practice question for this grammar point.
    Return exactly ONLY a JSON object with this structure:
    {{
      "question": "A short, complete Korean sentence with an English translation, but replace the grammar point with a blank '___'.",
      "options": ["conjugated word option 1", "conjugated word option 2", "conjugated word option 3", "conjugated word option 4"],
      "answer": 0  // index of the correct option
    }}
    
    Make the distractor options plausible grammatical mistakes or inappropriate conjugations for the context.
    Do not use markdown blocks, just the JSON string directly.
    """

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction="You are a helpful language tutor.",
            temperature=0.7,
        ),
    )

    content = response.text
    cleaned = extract_json(content)
    
    if not cleaned:
        return {
            "error": "LLM returned empty or invalid response",
            "raw_output": content
        }
        
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {
            "error": "Failed to parse json",
            "raw_output": cleaned
        }

model = whisper.load_model("base")

def speech_to_text(audio_path: str) -> str:
    model = whisper.load_model("base")  # tiny ❌ / large ❌
    result = model.transcribe(audio_path, fp16=False)
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

