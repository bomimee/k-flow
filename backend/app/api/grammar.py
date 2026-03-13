from fastapi import APIRouter, HTTPException, Query
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from typing import List, Optional
from pydantic import BaseModel
from app.services.llm import generate_grammar_quiz

load_dotenv()

router = APIRouter()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
service_key: str = os.getenv("SUPABASE_SERVICE_KEY") or key
supabase: Client = create_client(url, service_key)

class QuizGenerationRequest(BaseModel):
    title: str
    meaning: str
    description: str

@router.get("/grammar")
async def get_grammar_points(
    level: Optional[int] = Query(None, ge=1, le=10),
    title: Optional[str] = Query(None)
):
    try:
        query = supabase.table("grammar_points").select("*")
        if level:
            query = query.eq("level", level)
        if title:
            query = query.eq("title", title)
        
        result = query.execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/grammar/generate-quiz")
async def generate_quiz(req: QuizGenerationRequest):
    try:
        result = generate_grammar_quiz(req.title, req.meaning, req.description)
        if "error" in result:
            raise HTTPException(status_code=500, detail=str(result))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
