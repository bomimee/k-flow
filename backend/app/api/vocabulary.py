from fastapi import APIRouter, HTTPException, Query
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from typing import List, Optional
import random

load_dotenv()

router = APIRouter()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

@router.get("/vocabulary")
async def get_vocabulary(
    level: Optional[int] = Query(None, ge=1, le=10),
    categories: Optional[List[str]] = Query(None),
    limit: int = Query(10, ge=1, le=100)
):
    try:
        query = supabase.table("vocabulary").select("*")
        
        if level:
            # Map TTMIK level (1-10) to DB vocabulary level (1-4)
            if level <= 3:
                db_levels = [1]
            elif level <= 6:
                db_levels = [2]
            else:
                # 7-10 maps to DB levels 3 and 4
                db_levels = [3, 4]
            
            query = query.in_("level", db_levels)
        if categories and "all" not in categories:
            query = query.in_("category", categories)
            
        result = query.execute()
        
        data = result.data
        if not data:
            return []
            
        # Map DB snake_case/different names to Frontend expected names
        mapped_data = []
        for item in data:
            mapped_data.append({
                "id": item.get("id"),
                "korean": item.get("word"), # DB 'word' -> Frontend 'korean'
                "meaning": item.get("meaning"),
                "pronunciation": item.get("pronunciation", ""),
                "level": item.get("level"),
                "category": item.get("category"),
                "partOfSpeech": item.get("part_of_speech", ""),
                "exampleSentence": item.get("example_sentence", ""),
                "exampleTranslation": item.get("example_translation", ""),
                "difficulty": "medium" # Default since it's not in DB yet
            })
            
        random.shuffle(mapped_data)
        return mapped_data[:limit]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/vocabulary/levels")
async def get_vocabulary_levels():
    try:
        # Get unique levels
        result = supabase.table("vocabulary").select("level").execute()
        levels = sorted(list(set(item['level'] for item in result.data)))
        return levels
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
