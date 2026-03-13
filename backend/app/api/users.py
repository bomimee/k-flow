from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

url: str = os.getenv("SUPABASE_URL")
service_key: str = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, service_key)

@router.get("/users/{user_id}/profile")
async def get_user_profile(user_id: str):
    try:
        # Fetch profile from profiles table
        profile_res = supabase.table("profiles").select("*").eq("id", user_id).execute()
        
        if not profile_res.data:
            # Return a default if no profile exists yet
            return {
                "id": user_id,
                "ttmik_level": 1,
                "experience": 0,
                "streak_days": 0,
                "longest_streak": 0,
                "last_active_at": None,
                "nickname": None,
                "created_at": None
            }
            
        return profile_res.data[0]
        
    except Exception as e:
        print(f"❌ Error getting profile for {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
