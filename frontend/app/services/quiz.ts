// Quiz session service
// - saveQuizSession: 퀴즈 완료 후 서버에 결과 저장 + 업적 체크
// - fetchQuizStats:  업적 + 통계 조회

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface QuizSessionPayload {
  user_id: string;
  mode: string;
  score: number;
  total_points: number;
  correct_answers: number;
  total_questions: number;
  accuracy: number;        // 0-100
  time_spent: number;      // seconds
  best_streak: number;
}

export interface QuizAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  rarity: string;
  threshold: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
  progress_current: number;
  progress_total: number;
  progress_pct: number;
}

export interface QuizStats {
  total_completed: number;
  average_accuracy: number;
  perfect_scores: number;
  total_points: number;
  best_streak: number;
  recent_sessions: {
    id: string;
    mode: string;
    accuracy: number;
    total_questions: number;
    correct_answers: number;
    total_points: number;
    time_spent: number;
    start_time: string;
  }[];
}

export interface SaveQuizResult {
  session_id: string;
  new_achievements: QuizAchievement[];
  xp_gained: number;
  stats: QuizStats;
}

export async function saveQuizSession(payload: QuizSessionPayload): Promise<SaveQuizResult> {
  const res = await fetch(`${API_BASE_URL}/api/quiz/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to save quiz session: ${res.status}`);
  }
  return res.json();
}

export async function fetchQuizStats(userId: string): Promise<{ stats: QuizStats; achievements: QuizAchievement[] } | null> {
  if (!userId || userId === 'undefined') return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/quiz/stats?user_id=${userId}`);
    if (!res.ok) throw new Error(`Failed to fetch quiz stats: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error('Error fetching quiz stats:', error);
    return null;
  }
}

export interface StreakInfo {
  streak_days: number;
  longest_streak: number;
  last_active_at: string | null;
}

export async function fetchStreakStats(userId: string): Promise<{
  streak: StreakInfo;
  achievements: QuizAchievement[];
} | null> {
  if (!userId || userId === 'undefined') return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/quiz/streak-stats?user_id=${userId}`);
    if (!res.ok) throw new Error(`Failed to fetch streak stats: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error('Error fetching streak stats:', error);
    return null;
  }
}
