from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional

load_dotenv()

router = APIRouter()

url: str = os.getenv("SUPABASE_URL")
service_key: str = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, service_key)


# ── Models ──────────────────────────────────────────────────────────────────

class HabitCreate(BaseModel):
    user_id: str
    name: str
    description: Optional[str] = None
    category: str = "vocabulary"
    frequency: str = "daily"
    motivation: int = 5
    ability: int = 5
    prompt_type: str = "time"
    prompt_trigger: Optional[str] = None
    prompt_cue: Optional[str] = None
    prompt_enabled: bool = True


class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    motivation: Optional[int] = None
    ability: Optional[int] = None
    prompt_enabled: Optional[bool] = None


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/habits/{user_id}")
async def get_habits(user_id: str):
    """유저의 모든 habit + 오늘 완료 여부 + streak 통계 반환"""
    try:
        # 1. habits
        habits_result = supabase.table("user_habits") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at") \
            .execute()

        # 2. 오늘 completions
        today_start = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        ).isoformat()
        completions_result = supabase.table("habit_completions") \
            .select("habit_id") \
            .eq("user_id", user_id) \
            .gte("completed_at", today_start) \
            .execute()

        completed_today = {c["habit_id"] for c in completions_result.data}

        # 3. profile stats (streak, study time)
        profile_result = supabase.table("profiles") \
            .select("streak_days, longest_streak, total_study_time, last_active_at") \
            .eq("id", user_id) \
            .maybe_single() \
            .execute()

        # 4. SRS activity: 오늘 복습한 단어 수
        srs_result = supabase.table("user_vocabulary_progress") \
            .select("vocabulary_id, success_rate, repetitions") \
            .eq("user_id", user_id) \
            .gte("last_review", today_start) \
            .execute()

        # 5. 저장 단어 수 (전체)
        saved_result = supabase.table("saved_items") \
            .select("id", count="exact") \
            .eq("user_id", user_id) \
            .execute()

        habits_with_status = [
            {**h, "completed_today": h["id"] in completed_today}
            for h in habits_result.data
        ]

        profile = profile_result.data or {}

        return {
            "habits": habits_with_status,
            "stats": {
                "streak_days": profile.get("streak_days", 0),
                "longest_streak": profile.get("longest_streak", 0),
                "total_study_time": profile.get("total_study_time", 0),
                "last_active_at": profile.get("last_active_at"),
                "srs_reviewed_today": len(srs_result.data),
                "saved_items_total": saved_result.count or 0,
                "avg_success_rate": (
                    round(
                        sum(r["success_rate"] for r in srs_result.data) / len(srs_result.data) * 100
                    )
                    if srs_result.data else 0
                ),
            }
        }
    except Exception as e:
        print(f"Error in get_habits: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/habits")
async def create_habit(habit: HabitCreate):
    """새 habit 생성"""
    try:
        data = {
            "user_id": habit.user_id,
            "name": habit.name,
            "description": habit.description,
            "category": habit.category,
            "frequency": habit.frequency,
            "motivation": habit.motivation,
            "ability": habit.ability,
            "prompt_type": habit.prompt_type,
            "prompt_trigger": habit.prompt_trigger,
            "prompt_cue": habit.prompt_cue,
            "prompt_enabled": habit.prompt_enabled,
        }
        result = supabase.table("user_habits").insert(data).execute()
        return result.data[0]
    except Exception as e:
        print(f"Error creating habit: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/habits/{habit_id}/complete")
async def complete_habit(habit_id: str, user_id: str):
    """habit 완료 처리 + streak 업데이트"""
    try:
        now = datetime.now(timezone.utc)

        # 오늘 이미 완료했는지 확인
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        existing = supabase.table("habit_completions") \
            .select("id") \
            .eq("habit_id", habit_id) \
            .eq("user_id", user_id) \
            .gte("completed_at", today_start) \
            .execute()

        if existing.data:
            return {"status": "already_completed"}

        # completion 기록
        supabase.table("habit_completions").insert({
            "habit_id": habit_id,
            "user_id": user_id,
            "completed_at": now.isoformat()
        }).execute()

        # streak 증가
        habit_result = supabase.table("user_habits") \
            .select("streak, last_completed_at") \
            .eq("id", habit_id) \
            .single() \
            .execute()

        current = habit_result.data
        new_streak = current["streak"] + 1

        supabase.table("user_habits").update({
            "streak": new_streak,
            "last_completed_at": now.isoformat()
        }).eq("id", habit_id).execute()

        # profile streak 업데이트
        profile = supabase.table("profiles") \
            .select("streak_days, longest_streak") \
            .eq("id", user_id) \
            .maybe_single() \
            .execute()

        if profile.data:
            new_profile_streak = (profile.data.get("streak_days") or 0) + 1
            longest = max(new_profile_streak, profile.data.get("longest_streak") or 0)
            supabase.table("profiles").update({
                "streak_days": new_profile_streak,
                "longest_streak": longest,
                "last_active_at": now.isoformat()
            }).eq("id", user_id).execute()

        return {"status": "completed", "new_streak": new_streak}
    except Exception as e:
        print(f"Error completing habit: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/habits/{habit_id}")
async def update_habit(habit_id: str, update: HabitUpdate):
    """habit motivation/ability/prompt 수정"""
    try:
        patch = {k: v for k, v in update.model_dump().items() if v is not None}
        if not patch:
            raise HTTPException(status_code=400, detail="No fields to update")
        result = supabase.table("user_habits").update(patch).eq("id", habit_id).execute()
        return result.data[0]
    except Exception as e:
        print(f"Error updating habit: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/habits/{habit_id}")
async def delete_habit(habit_id: str):
    """habit 삭제"""
    try:
        supabase.table("user_habits").delete().eq("id", habit_id).execute()
        return {"status": "deleted"}
    except Exception as e:
        print(f"Error deleting habit: {e}")
        raise HTTPException(status_code=500, detail=str(e))
