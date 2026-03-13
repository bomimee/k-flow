from fastapi import APIRouter, HTTPException, Depends
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import List, Optional

load_dotenv()

router = APIRouter()

url: str = os.getenv("SUPABASE_URL")
# Use service_role key on the backend to bypass RLS — server is trusted
service_key: str = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, service_key)

class SRSProgressUpdate(BaseModel):
    vocabulary_id: str
    user_id: str
    interval: int
    repetitions: int
    ease_factor: float
    next_review: str  # ISO timestamp
    success_rate: float

class GrammarSRSProgressUpdate(BaseModel):
    grammar_id: str
    user_id: str
    interval: int
    repetitions: int
    ease_factor: float
    next_review: str  # ISO timestamp
    success_rate: float

@router.get("/srs/due/{user_id}")
async def get_due_items(user_id: str):
    try:
        now = datetime.now(timezone.utc).isoformat()
        
        # 1. Get due progress items for this user
        result = supabase.table("user_vocabulary_progress") \
            .select("*, vocabulary(*)") \
            .eq("user_id", user_id) \
            .lte("next_review", now) \
            .execute()
        
        return result.data
    except Exception as e:
        print(f"Error in get_due_items: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/srs/grammar/due/{user_id}")
async def get_due_grammar_items(user_id: str):
    try:
        now = datetime.now(timezone.utc).isoformat()
        
        result = supabase.table("user_grammar_progress") \
            .select("*, grammar_points(*)") \
            .eq("user_id", user_id) \
            .lte("next_review", now) \
            .execute()
        
        # We need to reshape this if needed, but we can do it on the frontend
        return result.data
    except Exception as e:
        print(f"Error in get_due_grammar_items: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/srs/update")
async def update_srs_progress(update: SRSProgressUpdate):
    try:
        data = {
            "user_id": update.user_id,
            "vocabulary_id": update.vocabulary_id,
            "interval": update.interval,
            "repetitions": update.repetitions,
            "ease_factor": update.ease_factor,
            "next_review": update.next_review,
            "success_rate": update.success_rate,
            "last_review": datetime.now(timezone.utc).isoformat()
        }
        
        # upsert based on (user_id, vocabulary_id) unique constraint
        # ensure on_conflict reflects the DB unique constraint exactly
        result = supabase.table("user_vocabulary_progress").upsert(
            data, on_conflict="user_id,vocabulary_id"
        ).execute()
        
        return {"status": "success", "data": result.data}
    except Exception as e:
        print(f"❌ Error in update_srs_progress: {type(e).__name__}: {str(e)}")
        # If it's a supabase error, it might have more details
        detail = str(e)
        if hasattr(e, 'message'):
            detail = e.message
        raise HTTPException(status_code=500, detail=detail)

@router.post("/srs/grammar/update")
async def update_grammar_srs_progress(update: GrammarSRSProgressUpdate):
    try:
        data = {
            "user_id": update.user_id,
            "grammar_id": update.grammar_id,
            "interval": update.interval,
            "repetitions": update.repetitions,
            "ease_factor": update.ease_factor,
            "next_review": update.next_review,
            "success_rate": update.success_rate,
            "last_review": datetime.now(timezone.utc).isoformat()
        }
        
        result = supabase.table("user_grammar_progress").upsert(
            data, on_conflict="user_id,grammar_id"
        ).execute()
        
        return {"status": "success", "data": result.data}
    except Exception as e:
        print(f"❌ Error in update_grammar_srs_progress: {type(e).__name__}: {str(e)}")
        detail = str(e)
        if hasattr(e, 'message'):
            detail = e.message
        raise HTTPException(status_code=500, detail=detail)
