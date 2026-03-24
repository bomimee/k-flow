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

def correct_korean_transcript(raw_transcript: str) -> str:
    """
    Whisper STT 결과를 LLM으로 한국어 어법에 맞게 교정합니다.
    내용(뜻)은 바꾸지 않고, 맞춤법·어법·띄어쓰기만 수정합니다.
    """
    if not raw_transcript or not raw_transcript.strip():
        return raw_transcript

    prompt = f"""You are a Korean language proofreader.

The following text was produced by a speech-to-text (STT) model and may contain:
- Spacing errors (띄어쓰기 오류)
- Incorrect Korean spelling (맞춤법 오류)
- Unnatural grammar caused by mishearing (어법 오류)

Please correct ONLY the above issues. Do NOT:
- Change the meaning or content
- Add or remove sentences
- Translate anything

Return ONLY the corrected Korean text, nothing else.

STT Text:
{raw_transcript[:3000]}
"""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are a Korean language proofreader. Return only the corrected text.",
                temperature=0.1,  # 낮은 temperature = 일관성 높음
            ),
        )
        corrected = response.text.strip()
        print(f"✅ STT 교정 완료 ({len(raw_transcript)}자 → {len(corrected)}자)")
        return corrected if corrected else raw_transcript
    except Exception as e:
        print(f"⚠️ STT 교정 실패 (원본 사용): {e}")
        return raw_transcript  # 실패 시 원본 사용


def evaluate_pronunciation(target_sentence: str, audio_path: str) -> dict:
    user_text = speech_to_text(audio_path)
    
    prompt = f"""
    You are a Korean pronunciation coach.
    The learner was supposed to say: "{target_sentence}"
    The Speech-to-Text model heard: "{user_text}"
    
    Evaluate the learner's pronunciation based on the differences.
    Return a strictly formatted JSON object with:
    {{
       "score": <an integer between 0 and 100 representing accuracy>,
       "feedback": ["A short list (1-2) of positive points"],
       "improvements": ["A short list (1-2) of constructive feedback or what they need to fix"]
    }}
    
    If the text matches very closely, give a high score. If there are major mistakes or completely different words, lower it.
    Only return valid JSON syntax, NO markdown.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are a helpful language tutor.",
                temperature=0.3,
            ),
        )

        content = response.text
        cleaned = extract_json(content)
        
        if not cleaned:
            return {
                "score": 0,
                "srs_quality": 1,
                "heard_text": user_text,
                "feedback": ["Could not properly evaluate the audio."],
                "improvements": ["Please try recording again."]
            }
        
        result = json.loads(cleaned)
        
        # score(0~100) → srs_quality(0~5) 변환
        score = result.get("score", 0)
        if score >= 90:
            srs_quality = 5
        elif score >= 75:
            srs_quality = 4
        elif score >= 60:
            srs_quality = 3
        elif score >= 40:
            srs_quality = 2
        else:
            srs_quality = 1
        
        result["srs_quality"] = srs_quality
        result["heard_text"] = user_text
        return result
    except Exception as e:
        print("Pronunciation Eval Error:", e)
        return {
            "score": 0,
            "srs_quality": 1,
            "heard_text": "",
            "feedback": ["Error during evaluation."],
            "improvements": ["Please try again later."]
        }


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

