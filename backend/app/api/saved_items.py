from fastapi import APIRouter, HTTPException, Query
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from typing import List, Optional, Any
from pydantic import BaseModel

load_dotenv()

router = APIRouter()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

class SavedItemRequest(BaseModel):
    user_id: str = "default_user"
    item_type: str
    unique_key: str
    content: Any

@router.post("/saved-items")
async def save_item(item: SavedItemRequest):
    try:
        # Check if already exists
        existing = supabase.table("saved_items").select("*").eq("user_id", item.user_id).eq("unique_key", item.unique_key).execute()
        if existing.data:
            return existing.data[0] # Already saved

        result = supabase.table("saved_items").insert({
            "user_id": item.user_id,
            "item_type": item.item_type,
            "unique_key": item.unique_key,
            "content": item.content
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/saved-items")
async def get_saved_items(user_id: str = "default_user", item_type: Optional[str] = None):
    try:
        query = supabase.table("saved_items").select("*").eq("user_id", user_id)
        if item_type:
            query = query.eq("item_type", item_type)
        result = query.execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@router.delete("/saved-items/{item_id}")
async def delete_saved_item(item_id: str):
    try:
        result = supabase.table("saved_items").delete().eq("id", item_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
