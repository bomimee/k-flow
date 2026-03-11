from fastapi import APIRouter, HTTPException, Query
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from typing import List, Optional, Any
from pydantic import BaseModel
from app.api.streak_utils import update_streak, check_streak_achievements

load_dotenv()

router = APIRouter()

SUPABASE_URL: str = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")

# service key용 클라이언트 (achievement 업데이트에 사용)
def get_service_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# anon key용 클라이언트 (일반 읽기에 사용)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


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
            return {"item": existing.data[0], "new_achievements": []}

        result = supabase.table("saved_items").insert({
            "user_id": item.user_id,
            "item_type": item.item_type,
            "unique_key": item.unique_key,
            "content": item.content
        }).execute()

        saved = result.data[0]

        # achievement 체크 (유저가 auth uuid인 경우에만)
        new_achievements = []
        if item.user_id and item.user_id != "default_user":
            try:
                new_achievements = _check_saved_achievements(item.user_id, item.item_type)
            except Exception as e:
                print(f"⚠️ achievement check failed: {e}")

            # streak 업데이트
            try:
                sb = get_service_client()
                streak_info = update_streak(sb, item.user_id)
                if streak_info["changed"]:
                    streak_ach = check_streak_achievements(
                        sb, item.user_id,
                        streak_info["streak_days"],
                        streak_info["longest_streak"]
                    )
                    new_achievements.extend(streak_ach)
            except Exception as e:
                print(f"⚠️ streak update failed: {e}")

        return {"item": saved, "new_achievements": new_achievements}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _check_saved_achievements(user_id: str, item_type: str) -> list:
    sb = get_service_client()

    # 전체 저장 수
    all_res = sb.table("saved_items").select("id, item_type").eq("user_id", user_id).execute()
    items = all_res.data or []
    total = len(items)
    voc_count  = sum(1 for i in items if i["item_type"] == "vocabulary")
    expr_count = sum(1 for i in items if i["item_type"] == "expression")
    gram_count = sum(1 for i in items if i["item_type"] == "grammar")

    # 이미 unlock된 업적
    existing = sb.table("user_achievements").select("achievement_id").eq("user_id", user_id).execute()
    already = {r["achievement_id"] for r in (existing.data or [])}

    conditions = [
        ("save_first",   total >= 1),
        ("save_10",      total >= 10),
        ("save_25",      total >= 25),
        ("save_50",      total >= 50),
        ("save_100",     total >= 100),
        ("save_voc_10",  voc_count >= 10),
        ("save_expr_10", expr_count >= 10),
        ("save_gram_5",  gram_count >= 5),
    ]

    new_unlocks = []
    for ach_id, condition in conditions:
        if condition and ach_id not in already:
            sb.table("user_achievements").insert({
                "user_id": user_id,
                "achievement_id": ach_id,
            }).execute()
            ach = sb.table("achievements").select("*").eq("id", ach_id).execute()
            if ach.data:
                new_unlocks.append(ach.data[0])

    return new_unlocks


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


@router.get("/saved-items/stats")
async def get_saved_items_stats(user_id: str):
    """저장 단어 통계 + vocabulary 업적 진행도 반환"""
    try:
        sb = get_service_client()

        all_res = sb.table("saved_items").select("id, item_type").eq("user_id", user_id).execute()
        items = all_res.data or []
        total = len(items)
        voc_count  = sum(1 for i in items if i["item_type"] == "vocabulary")
        expr_count = sum(1 for i in items if i["item_type"] == "expression")
        gram_count = sum(1 for i in items if i["item_type"] == "grammar")

        stats = {
            "total": total,
            "vocabulary": voc_count,
            "expression": expr_count,
            "grammar": gram_count,
        }

        # 업적 목록 + 진행도
        ach_res = sb.table("achievements").select("*").eq("category", "vocabulary").order("threshold").execute()
        unlocked_res = sb.table("user_achievements").select("achievement_id, unlocked_at").eq("user_id", user_id).execute()
        unlocked_map = {r["achievement_id"]: r["unlocked_at"] for r in (unlocked_res.data or [])}

        def progress(ach_id):
            m = {
                "save_first":   (total, 1),
                "save_10":      (total, 10),
                "save_25":      (total, 25),
                "save_50":      (total, 50),
                "save_100":     (total, 100),
                "save_voc_10":  (voc_count, 10),
                "save_expr_10": (expr_count, 10),
                "save_gram_5":  (gram_count, 5),
            }
            return m.get(ach_id, (0, 1))

        achievements = []
        for ach in (ach_res.data or []):
            cur, tot = progress(ach["id"])
            achievements.append({
                **ach,
                "is_unlocked": ach["id"] in unlocked_map,
                "unlocked_at": unlocked_map.get(ach["id"]),
                "progress_current": cur,
                "progress_total": tot,
                "progress_pct": min(round(cur / max(tot, 1) * 100), 100),
            })

        return {"stats": stats, "achievements": achievements}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/saved-items/{item_id}")
async def delete_saved_item(item_id: str):
    try:
        supabase.table("saved_items").delete().eq("id", item_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
