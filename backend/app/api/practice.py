from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from app.services.llm import evaluate_pronunciation
import os
import uuid
from typing import Dict, Any

router = APIRouter()

@router.post("/evaluate-pronunciation")
async def evaluate_pronunciation_api(
    audio: UploadFile = File(...),
    target_sentence: str = Form(...)
):
    # Create temp directory if not exists
    os.makedirs("tmp", exist_ok=True)
    ext = audio.filename.split('.')[-1] if '.' in audio.filename else 'webm'
    temp_file_path = f"tmp/{uuid.uuid4()}.{ext}"
    
    try:
        with open(temp_file_path, "wb") as f:
            f.write(await audio.read())
            
        result = evaluate_pronunciation(target_sentence, temp_file_path)
        return result
    except Exception as e:
        print(f"Error evaluating pronunciation: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate pronunciation.")
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
