"""
Quiz session result API
- POST /api/quiz/sessions  : 퀴즈 결과 저장 + achievement 자동 체크
- GET  /api/quiz/stats     : 유저 퀴즈 통계 조회
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import uuid
from supabase import create_client
from app.api.streak_utils import update_streak, check_streak_achievements


def _validate_uuid(user_id: str):
    """user_id가 유효한 UUID 형식인지 확인. 아니면 400 반환."""
    try:
        uuid.UUID(user_id)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=400, detail=f"Invalid user_id format: {user_id!r}")

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

def get_supabase():
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# ── Request / Response schemas ─────────────────────────────────────────────────

class QuizSessionCreate(BaseModel):
    user_id: str
    mode: str
    score: int             # correct answers (0~total_questions)
    total_points: int
    correct_answers: int
    total_questions: int
    accuracy: int          # 0~100
    time_spent: int        # seconds
    best_streak: int


class QuizStats(BaseModel):
    total_completed: int
    average_accuracy: float
    perfect_scores: int
    total_points: int
    best_streak: int
    recent_sessions: list


# ── POST /quiz/sessions ────────────────────────────────────────────────────────

@router.post("/quiz/sessions")
async def save_quiz_session(payload: QuizSessionCreate):
    sb = get_supabase()

    # 1. 세션 저장
    insert_data = {
        "user_id":        payload.user_id,
        "mode":           payload.mode,
        "score":          payload.score,
        "total_points":   payload.total_points,
        "correct_answers": payload.correct_answers,
        "total_questions": payload.total_questions,
        "accuracy":       payload.accuracy,
        "time_spent":     payload.time_spent,
        "best_streak":    payload.best_streak,
    }

    res = sb.table("quiz_sessions").insert(insert_data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to save quiz session")

    session_id = res.data[0]["id"]

    # 2. 전체 통계 재집계
    stats = _get_stats(sb, payload.user_id)

    # 3. quiz achievement 체크
    new_achievements = _check_quiz_achievements(sb, payload.user_id, stats, payload.accuracy)

    # 4. streak 업데이트 + streak achievement 체크
    streak_info = update_streak(sb, payload.user_id)
    if streak_info["changed"]:
        streak_ach = check_streak_achievements(
            sb, payload.user_id,
            streak_info["streak_days"],
            streak_info["longest_streak"]
        )
        new_achievements.extend(streak_ach)

    # 5. profiles.experience 누적
    xp_gain = round(payload.accuracy * 0.2) + 10
    _add_experience(sb, payload.user_id, xp_gain)

    return {
        "session_id": session_id,
        "new_achievements": new_achievements,
        "xp_gained": xp_gain,
        "stats": stats,
        "streak": streak_info,
    }


# ── GET /quiz/stats ────────────────────────────────────────────────────────────

@router.get("/quiz/stats")
async def get_quiz_stats(user_id: str):
    _validate_uuid(user_id)
    sb = get_supabase()
    stats = _get_stats(sb, user_id)

    # unlock된 quiz 업적도 함께 반환
    unlocked_res = (
        sb.table("user_achievements")
        .select("achievement_id, unlocked_at, achievements(name, icon, points, description, rarity)")
        .eq("user_id", user_id)
        .execute()
    )
    unlocked = [
        {
            "id": row["achievement_id"],
            "unlocked_at": row["unlocked_at"],
            **(row.get("achievements") or {}),
        }
        for row in (unlocked_res.data or [])
    ]

    # 전체 quiz 업적 정의 목록
    all_ach_res = (
        sb.table("achievements")
        .select("*")
        .eq("category", "quizzes")
        .order("threshold")
        .execute()
    )
    unlocked_ids = {u["id"] for u in unlocked}

    achievements_with_progress = []
    for ach in (all_ach_res.data or []):
        ach_id = ach["id"]
        # 진행도 계산
        current, total = _progress_for(ach_id, stats)
        achievements_with_progress.append({
            **ach,
            "is_unlocked": ach_id in unlocked_ids,
            "unlocked_at": next((u["unlocked_at"] for u in unlocked if u["id"] == ach_id), None),
            "progress_current": current,
            "progress_total": total,
            "progress_pct": min(round(current / max(total, 1) * 100), 100),
        })

    return {
        "stats": stats,
        "achievements": achievements_with_progress,
    }


# ── GET /quiz/streak-stats ─────────────────────────────────────────────────────

@router.get("/quiz/streak-stats")
async def get_streak_stats_endpoint(user_id: str):
    """streak 현황 + streak 업적 목록 반환"""
    _validate_uuid(user_id)
    from app.api.streak_utils import get_streak_stats, build_streak_achievements_with_progress
    sb = get_supabase()
    streak = get_streak_stats(sb, user_id)
    achievements = build_streak_achievements_with_progress(sb, user_id)
    return {"streak": streak, "achievements": achievements}



def _get_stats(sb, user_id: str) -> dict:
    res = (
        sb.table("quiz_sessions")
        .select("accuracy, total_points, best_streak, correct_answers, total_questions")
        .eq("user_id", user_id)
        .execute()
    )
    sessions = res.data or []
    total = len(sessions)
    if total == 0:
        return {
            "total_completed": 0,
            "average_accuracy": 0.0,
            "perfect_scores": 0,
            "total_points": 0,
            "best_streak": 0,
            "recent_sessions": [],
        }

    avg_acc = round(sum(s["accuracy"] for s in sessions) / total, 1)
    perfect = sum(1 for s in sessions if s["accuracy"] == 100)
    total_pts = sum(s["total_points"] for s in sessions)
    best_streak = max(s["best_streak"] for s in sessions)

    # 최근 5개 세션 (별도 조회)
    recent_res = (
        sb.table("quiz_sessions")
        .select("id, mode, accuracy, total_questions, correct_answers, total_points, time_spent, start_time")
        .eq("user_id", user_id)
        .order("start_time", desc=True)
        .limit(5)
        .execute()
    )

    return {
        "total_completed": total,
        "average_accuracy": avg_acc,
        "perfect_scores": perfect,
        "total_points": total_pts,
        "best_streak": best_streak,
        "recent_sessions": recent_res.data or [],
    }


def _progress_for(ach_id: str, stats: dict) -> tuple[int, int]:
    """각 업적의 (current, total) 진행도 반환"""
    m = {
        "quiz_first":     (stats["total_completed"], 1),
        "quiz_5":         (stats["total_completed"], 5),
        "quiz_10":        (stats["total_completed"], 10),
        "quiz_25":        (stats["total_completed"], 25),
        "quiz_50":        (stats["total_completed"], 50),
        "quiz_perfect_1": (stats["perfect_scores"], 1),
        "quiz_perfect_5": (stats["perfect_scores"], 5),
        "quiz_acc_80":    (int(stats["average_accuracy"]), 80),
        "quiz_acc_90":    (int(stats["average_accuracy"]), 90),
    }
    return m.get(ach_id, (0, 1))


def _check_quiz_achievements(sb, user_id: str, stats: dict, accuracy: int) -> list:
    """조건 충족한 업적 중 아직 unlock 안 된 것을 unlock 하고 반환"""
    # 이미 unlock된 것
    existing = (
        sb.table("user_achievements")
        .select("achievement_id")
        .eq("user_id", user_id)
        .execute()
    )
    already_unlocked = {r["achievement_id"] for r in (existing.data or [])}

    to_check = [
        ("quiz_first",     stats["total_completed"] >= 1),
        ("quiz_5",         stats["total_completed"] >= 5),
        ("quiz_10",        stats["total_completed"] >= 10),
        ("quiz_25",        stats["total_completed"] >= 25),
        ("quiz_50",        stats["total_completed"] >= 50),
        ("quiz_perfect_1", stats["perfect_scores"] >= 1),
        ("quiz_perfect_5", stats["perfect_scores"] >= 5),
        # acc 업적은 10회 이상 완료했을 때만 체크
        ("quiz_acc_80",    stats["total_completed"] >= 10 and stats["average_accuracy"] >= 80),
        ("quiz_acc_90",    stats["total_completed"] >= 10 and stats["average_accuracy"] >= 90),
    ]

    new_unlocks = []
    for ach_id, condition in to_check:
        if condition and ach_id not in already_unlocked:
            sb.table("user_achievements").insert({
                "user_id": user_id,
                "achievement_id": ach_id,
            }).execute()
            # 업적 정보 가져오기
            ach_res = sb.table("achievements").select("*").eq("id", ach_id).execute()
            if ach_res.data:
                new_unlocks.append(ach_res.data[0])

    return new_unlocks


def _add_experience(sb, user_id: str, xp: int):
    """profiles 테이블의 experience를 증가시킴"""
    try:
        current = sb.table("profiles").select("experience").eq("id", user_id).execute()
        if current.data:
            old_xp = current.data[0].get("experience") or 0
            new_xp = old_xp + xp
            new_level = (new_xp // 1000) + 1
            sb.table("profiles").update({
                "experience": new_xp,
                "ttmik_level": min(new_level, 10),
            }).eq("id", user_id).execute()
    except Exception as e:
        print(f"⚠️ XP update failed: {e}")
