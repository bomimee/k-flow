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
service_key: str = os.getenv("SUPABASE_SERVICE_KEY") or key
supabase: Client = create_client(url, service_key)


def _map_vocab_row(item: dict) -> dict:
    """Map vocabulary table row → frontend VocabularyItem shape."""
    return {
        "id": item.get("id"),
        "korean": item.get("word"),
        "meaning": item.get("meaning"),
        "pronunciation": item.get("pronunciation", ""),
        "level": item.get("level"),
        "category": item.get("category"),
        "partOfSpeech": item.get("part_of_speech", ""),
        "exampleSentence": item.get("example_sentence", ""),
        "exampleTranslation": item.get("example_translation", ""),
        "difficulty": "medium",
        "srsData": {
            "interval": 1, "repetitions": 0,
            "easeFactor": 2.5, "nextReview": None, "successRate": 0
        },
    }


def _db_levels_for_ttmik(level: int) -> List[int]:
    if level <= 3:
        return [1]
    elif level <= 6:
        return [2]
    else:
        return [3, 4]


@router.get("/vocabulary")
async def get_vocabulary(
    level: Optional[int] = Query(None, ge=1, le=10),
    categories: Optional[List[str]] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    week: Optional[int] = Query(None, ge=1)
):
    try:
        query = supabase.table("vocabulary").select("*")
        if level:
            query = query.in_("level", _db_levels_for_ttmik(level))
        if categories and "all" not in categories:
            query = query.in_("category", categories)
        result = query.execute()
        if not result.data:
            return []
        
        mapped = [_map_vocab_row(item) for item in result.data]

        if week:
            # Deterministic sorting for curriculum
            mapped.sort(key=lambda x: x["korean"])
            
            total_words = len(mapped)
            start_idx = ((week - 1) * limit) % total_words
            end_idx = start_idx + limit

            # If end_idx goes beyond total_words, we wrap around
            sliced = mapped[start_idx:end_idx]
            if len(sliced) < limit:
                remaining_needed = limit - len(sliced)
                sliced.extend(mapped[:remaining_needed])
            return sliced
        else:
            random.shuffle(mapped)
            return mapped[:limit]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/vocabulary/quiz-words/mixed")
async def get_mixed_quiz_words(
    user_id: Optional[str] = Query(None),
    level: Optional[int] = Query(None, ge=1, le=10),
    categories: Optional[List[str]] = Query(None),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Automatically mix saved words + DB words for the vocabulary quiz.
    - Checks both real UUID and legacy 'default_user' for saved items.
    - If saved words exist: up to 50% saved, rest from DB.
    - If no saved words: DB only.
    """
    try:
        saved_items: List[dict] = []

        # ── Load saved vocabulary (try real user_id + legacy 'default_user') ──
        if user_id:
            user_ids_to_check = list({user_id, "default_user"})
            for uid in user_ids_to_check:
                result = (
                    supabase.table("saved_items")
                    .select("*")
                    .eq("user_id", uid)
                    .eq("item_type", "vocabulary")
                    .execute()
                )
                for row in (result.data or []):
                    c = row.get("content", {})
                    word = c.get("word") or c.get("korean") or c.get("expression")
                    meaning = c.get("meaning") or c.get("meaning_en")
                    if not word or not meaning:
                        continue
                    saved_items.append({
                        "id": f"saved-{row.get('id')}",
                        "korean": word,
                        "meaning": meaning,
                        "pronunciation": c.get("pronunciation", ""),
                        "level": 1,
                        "category": c.get("category", "saved"),
                        "partOfSpeech": c.get("part_of_speech", ""),
                        "exampleSentence": c.get("example_in_context") or c.get("example_sentence", ""),
                        "exampleTranslation": c.get("example_translation", ""),
                        "difficulty": "medium",
                        "source": "saved",
                        "srsData": {
                            "interval": 1, "repetitions": 0,
                            "easeFactor": 2.5, "nextReview": None, "successRate": 0
                        },
                    })
            # Deduplicate by korean word
            seen: set = set()
            deduped: List[dict] = []
            for item in saved_items:
                k = item["korean"]
                if k not in seen:
                    seen.add(k)
                    deduped.append(item)
            saved_items = deduped

        # ── Determine split ─────────────────────────────────────────────────
        random.shuffle(saved_items)
        saved_count = min(len(saved_items), limit // 2)  # up to 50%
        db_needed = limit - saved_count

        # ── Load DB words ────────────────────────────────────────────────────
        db_query = supabase.table("vocabulary").select("*")
        if level:
            db_query = db_query.in_("level", _db_levels_for_ttmik(level))
        if categories and "all" not in categories:
            db_query = db_query.in_("category", categories)
        db_result = db_query.execute()

        saved_words = {item["korean"] for item in saved_items[:saved_count]}
        db_items = [
            _map_vocab_row(row)
            for row in (db_result.data or [])
            if row.get("word") not in saved_words
        ]
        random.shuffle(db_items)

        merged = saved_items[:saved_count] + db_items[:db_needed]
        random.shuffle(merged)

        return {
            "items": merged[:limit],
            "saved_count": saved_count,
            "db_count": min(db_needed, len(db_items)),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/vocabulary/levels")
async def get_vocabulary_levels():
    try:
        result = supabase.table("vocabulary").select("level").execute()
        levels = sorted(list(set(item['level'] for item in result.data)))
        return levels
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
