from fastapi import APIRouter, HTTPException
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

        # ── 1. 기존 복습 대상 단어 가져오기 ────────────────────────────────
        due_result = supabase.table("user_vocabulary_progress") \
            .select("*, vocabulary(*)") \
            .eq("user_id", user_id) \
            .lte("next_review", now) \
            .execute()
        due_items = due_result.data or []

        # 이미 progress에 등록된 vocabulary_id 목록 (중복 투입 방지)
        all_progress_res = supabase.table("user_vocabulary_progress") \
            .select("vocabulary_id") \
            .eq("user_id", user_id) \
            .execute()
        known_vocab_ids = {row["vocabulary_id"] for row in (all_progress_res.data or [])}

        # ── 2. 유저 레벨 파악 (profiles.ttmik_level 우선) ──────────────────
        user_level = 1
        try:
            profile_res = supabase.table("profiles") \
                .select("ttmik_level") \
                .eq("id", user_id) \
                .single() \
                .execute()
            if profile_res.data and profile_res.data.get("ttmik_level"):
                user_level = int(profile_res.data["ttmik_level"])
        except Exception:
            pass  # profiles 조회 실패 시 기본 레벨 1 사용

        # ── 3. 커리큘럼 단어 투입 (레벨 ±1, 하루 최대 5개) ─────────────────
        NEW_WORDS_PER_DAY = 5
        level_min = max(1, user_level - 1)
        level_max = min(10, user_level + 1)

        # 오늘 이미 투입된 신규 단어 수 확인 (repetitions=0, 오늘 created)
        today_start = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        ).isoformat()
        today_injected_res = supabase.table("user_vocabulary_progress") \
            .select("vocabulary_id") \
            .eq("user_id", user_id) \
            .eq("repetitions", 0) \
            .gte("created_at", today_start) \
            .execute()
        today_injected_count = len(today_injected_res.data or [])
        remaining_slots = max(0, NEW_WORDS_PER_DAY - today_injected_count)

        newly_injected = []
        if remaining_slots > 0:
            # 해당 레벨 범위에서 아직 progress 없는 단어 후보
            candidate_res = supabase.table("vocabulary") \
                .select("*") \
                .gte("level", level_min) \
                .lte("level", level_max) \
                .limit(remaining_slots + 50) \
                .execute()
            candidates = [
                v for v in (candidate_res.data or [])
                if v["id"] not in known_vocab_ids
            ][:remaining_slots]

            for vocab in candidates:
                progress_row = {
                    "user_id": user_id,
                    "vocabulary_id": vocab["id"],
                    "interval": 1,
                    "repetitions": 0,
                    "ease_factor": 2.5,
                    "next_review": now,
                    "success_rate": 0,
                }
                supabase.table("user_vocabulary_progress").upsert(
                    progress_row, on_conflict="user_id,vocabulary_id"
                ).execute()
                newly_injected.append({
                    **progress_row,
                    "vocabulary": vocab,
                })
                known_vocab_ids.add(vocab["id"])

        # ── 4. 기존 복습 + 신규 커리큘럼 단어 합쳐서 반환 ──────────────────
        all_items = due_items + newly_injected
        print(f"✅ SRS: 복습 {len(due_items)}개 + 커리큘럼 신규 {len(newly_injected)}개 (레벨 {level_min}~{level_max}, user_level={user_level})")
        return all_items

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
        result = supabase.table("user_vocabulary_progress").upsert(
            data, on_conflict="user_id,vocabulary_id"
        ).execute()

        return {"status": "success", "data": result.data}
    except Exception as e:
        print(f"❌ Error in update_srs_progress: {type(e).__name__}: {str(e)}")
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

from app.services.llm import generate_srs_story
from pydantic import BaseModel as _BaseModel
from typing import List as _List

class StoryRequest(_BaseModel):
    user_id: str
    word_limit: int = 5

@router.post("/srs/generate-story")
async def create_story(req: StoryRequest):
    try:
        now = datetime.now(timezone.utc).isoformat()

        # 복습 대상 단어 가져오기 (next_review <= now)
        result = supabase.table("user_vocabulary_progress") \
            .select("vocabulary_id, vocabulary(word, meaning, pronunciation)") \
            .eq("user_id", req.user_id) \
            .lte("next_review", now) \
            .order("next_review", desc=False) \
            .limit(req.word_limit) \
            .execute()

        items = result.data or []
        if not items:
            raise HTTPException(status_code=404, detail="No due words available for story generation")

        words = []
        for item in items:
            vocab = item.get("vocabulary") or {}
            if vocab and vocab.get("word"):
                words.append({
                    "id": item.get("vocabulary_id"),
                    "word": vocab["word"],
                    "meaning": vocab.get("meaning", ""),
                    "pronunciation": vocab.get("pronunciation", ""),
                })

        if not words:
            raise HTTPException(status_code=404, detail="No valid words found")

        story = generate_srs_story(words)
        story["words_used"] = words
        return story

    except HTTPException:
        raise
    except Exception as e:
        print(f"Story generation endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
