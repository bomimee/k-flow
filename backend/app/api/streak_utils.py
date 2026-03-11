"""
streak_utils.py
공통 streak 업데이트 + streak 업적 체크 헬퍼.
quiz.py, saved_items.py에서 모두 활용.
"""

from datetime import datetime, timezone, timedelta
from supabase import Client


def update_streak(sb: Client, user_id: str) -> dict:
    """
    profiles 테이블의 streak_days / longest_streak / last_active_at 갱신.
    반환: { streak_days, longest_streak, changed: bool }
    """
    res = sb.table("profiles").select(
        "streak_days, longest_streak, last_active_at"
    ).eq("id", user_id).execute()

    if not res.data:
        return {"streak_days": 0, "longest_streak": 0, "changed": False}

    profile = res.data[0]
    now = datetime.now(timezone.utc)
    streak  = profile.get("streak_days") or 0
    longest = profile.get("longest_streak") or 0
    last_raw = profile.get("last_active_at")

    # 오늘 이미 활동했으면 갱신 불필요
    if last_raw:
        last_dt = datetime.fromisoformat(last_raw.replace("Z", "+00:00"))
        days_diff = (now.date() - last_dt.date()).days

        if days_diff == 0:
            return {"streak_days": streak, "longest_streak": longest, "changed": False}
        elif days_diff == 1:
            streak += 1          # 어제 했으면 연속
        else:
            streak = 1           # 끊겼으면 리셋
    else:
        streak = 1               # 첫 활동

    longest = max(longest, streak)

    sb.table("profiles").update({
        "streak_days":   streak,
        "longest_streak": longest,
        "last_active_at": now.isoformat(),
    }).eq("id", user_id).execute()

    return {"streak_days": streak, "longest_streak": longest, "changed": True}


def check_streak_achievements(sb: Client, user_id: str, streak: int, longest: int) -> list:
    """
    streak 조건에 맞는 업적을 unlock하고 새 업적 목록을 반환.
    """
    existing = sb.table("user_achievements").select("achievement_id").eq("user_id", user_id).execute()
    already = {r["achievement_id"] for r in (existing.data or [])}

    conditions = [
        ("streak_2",       streak >= 2),
        ("streak_3",       streak >= 3),
        ("streak_7",       streak >= 7),
        ("streak_14",      streak >= 14),
        ("streak_30",      streak >= 30),
        ("streak_60",      streak >= 60),
        ("streak_100",     streak >= 100),
        ("streak_best_7",  longest >= 7),
        ("streak_best_30", longest >= 30),
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


def get_streak_stats(sb: Client, user_id: str) -> dict:
    """현재 streak 통계 조회"""
    res = sb.table("profiles").select(
        "streak_days, longest_streak, last_active_at"
    ).eq("id", user_id).execute()

    if not res.data:
        return {"streak_days": 0, "longest_streak": 0, "last_active_at": None}

    p = res.data[0]
    return {
        "streak_days":    p.get("streak_days") or 0,
        "longest_streak": p.get("longest_streak") or 0,
        "last_active_at": p.get("last_active_at"),
    }


def build_streak_achievements_with_progress(sb: Client, user_id: str) -> list:
    """streak 업적 전체 목록 + 진행도 반환"""
    ach_res = sb.table("achievements").select("*").eq("category", "streak").order("threshold").execute()
    unlocked_res = sb.table("user_achievements").select("achievement_id, unlocked_at").eq("user_id", user_id).execute()
    unlocked_map = {r["achievement_id"]: r["unlocked_at"] for r in (unlocked_res.data or [])}

    stats = get_streak_stats(sb, user_id)
    streak  = stats["streak_days"]
    longest = stats["longest_streak"]

    def progress(ach_id: str):
        m = {
            "streak_2":       (streak, 2),
            "streak_3":       (streak, 3),
            "streak_7":       (streak, 7),
            "streak_14":      (streak, 14),
            "streak_30":      (streak, 30),
            "streak_60":      (streak, 60),
            "streak_100":     (streak, 100),
            "streak_best_7":  (longest, 7),
            "streak_best_30": (longest, 30),
        }
        return m.get(ach_id, (0, 1))

    result = []
    for ach in (ach_res.data or []):
        cur, tot = progress(ach["id"])
        result.append({
            **ach,
            "is_unlocked": ach["id"] in unlocked_map,
            "unlocked_at": unlocked_map.get(ach["id"]),
            "progress_current": cur,
            "progress_total": tot,
            "progress_pct": min(round(cur / max(tot, 1) * 100), 100),
        })
    return result
