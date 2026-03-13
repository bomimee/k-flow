from fastapi import APIRouter, HTTPException, Query
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from typing import List, Optional

load_dotenv()

router = APIRouter()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
service_key: str = os.getenv("SUPABASE_SERVICE_KEY") or key
supabase: Client = create_client(url, service_key)

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
