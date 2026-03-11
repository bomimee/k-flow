"use client";

import { useState, useEffect } from "react";
import ModernNavigation from "@/app/components/ModernNavigation";
import { fetchQuizStats, fetchStreakStats } from "@/app/services/quiz";
import { getSavedItemsStats } from "@/app/services/savedItems";
import type { QuizStats, StreakInfo } from "@/app/services/quiz";
import { useAuth } from "@/app/hooks/useAuth";

type Tab = "quiz" | "vocabulary" | "streak";

const rarityColor: Record<string, string> = {
  common:    "text-gray-600 bg-gray-100",
  uncommon:  "text-green-700 bg-green-100",
  rare:      "text-blue-700 bg-blue-100",
  epic:      "text-purple-700 bg-purple-100",
  legendary: "text-yellow-700 bg-yellow-100",
};

interface AnyAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  rarity: string;
  category?: string;
  threshold?: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
  progress_current: number;
  progress_total: number;
  progress_pct: number;
}

function AchievementCard({ ach }: { ach: AnyAchievement }) {
  return (
    <div
      className={`bg-white rounded-xl shadow overflow-hidden transition-all ${
        ach.is_unlocked
          ? "ring-2 ring-yellow-400 ring-offset-1"
          : "opacity-65 hover:opacity-85"
      }`}
    >
      <div className={`p-5 ${ach.is_unlocked ? "bg-gradient-to-br from-yellow-50 to-orange-50" : ""}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className={`text-3xl ${ach.is_unlocked ? "" : "grayscale opacity-50"}`}>{ach.icon}</span>
            <div>
              <h3 className="font-bold text-sm">{ach.name}</h3>
              <p className="text-xs text-gray-500">{ach.description}</p>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize shrink-0 ml-2 ${rarityColor[ach.rarity] ?? rarityColor.common}`}>
            {ach.rarity}
          </span>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.min(ach.progress_current, ach.progress_total)} / {ach.progress_total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${ach.is_unlocked ? "bg-green-500" : "bg-[var(--background)]"}`}
              style={{ width: `${ach.progress_pct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold bg-[var(--lemon)] text-black px-2 py-1 rounded-full">
            +{ach.points} pts
          </span>
          {ach.is_unlocked && ach.unlocked_at ? (
            <span className="text-xs text-green-600">🎉 {new Date(ach.unlocked_at).toLocaleDateString()}</span>
          ) : (
            <span className="text-xs text-gray-400">🔒 Locked</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("quiz");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  const [quizStats, setQuizStats]   = useState<QuizStats | null>(null);
  const [quizAch,   setQuizAch]     = useState<AnyAchievement[]>([]);

  const [savedStats, setSavedStats] = useState<{
    total: number; vocabulary: number; expression: number; grammar: number;
  } | null>(null);
  const [savedAch, setSavedAch]     = useState<AnyAchievement[]>([]);

  const [streakInfo, setStreakInfo]  = useState<StreakInfo | null>(null);
  const [streakAch,  setStreakAch]   = useState<AnyAchievement[]>([]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      fetchQuizStats(user.id),
      getSavedItemsStats(user.id),
      fetchStreakStats(user.id),
    ]).then(([quiz, saved, streak]) => {
      if (quiz)   { setQuizStats(quiz.stats);       setQuizAch(quiz.achievements as AnyAchievement[]); }
      if (saved)  { setSavedStats(saved.stats);     setSavedAch(saved.achievements as AnyAchievement[]); }
      if (streak) { setStreakInfo(streak.streak);   setStreakAch(streak.achievements as AnyAchievement[]); }
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  const achByTab: Record<Tab, AnyAchievement[]> = {
    quiz:       quizAch,
    vocabulary: savedAch,
    streak:     streakAch,
  };
  const activeAch = achByTab[tab];
  const displayed  = activeAch.filter(a => {
    if (filter === "unlocked") return a.is_unlocked;
    if (filter === "locked")   return !a.is_unlocked;
    return true;
  });

  const unlockedCount = activeAch.filter(a => a.is_unlocked).length;
  const allUnlocked = [...quizAch, ...savedAch, ...streakAch].filter(a => a.is_unlocked).length;
  const allTotal    = quizAch.length + savedAch.length + streakAch.length;
  const totalPtsEarned = [...quizAch, ...savedAch, ...streakAch]
    .filter(a => a.is_unlocked).reduce((s, a) => s + a.points, 0);

  const tabs = [
    { key: "quiz"       as Tab, label: "🎯 Quiz",         count: quizAch.length   },
    { key: "vocabulary" as Tab, label: "📚 Saved Words",   count: savedAch.length  },
    { key: "streak"     as Tab, label: "🔥 Streak",        count: streakAch.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavigation />

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 Achievements</h1>
          <p className="text-gray-600">Complete quizzes, save words, and maintain your streak</p>
        </div>

        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 font-medium">로그인 후 업적을 확인할 수 있습니다.</p>
          </div>
        )}

        {user && loading && (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[var(--background)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {user && !loading && (
          <>
            {/* Global progress banner */}
            <div className="bg-gradient-to-r from-[var(--background)] to-[var(--lightblue)] text-white rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{allUnlocked} / {allTotal} Achievements</p>
                <p className="text-sm opacity-80 mt-1">{totalPtsEarned.toLocaleString()} pts earned</p>
                <div className="mt-3 w-72 bg-white/30 rounded-full h-3">
                  <div
                    className="bg-[var(--lemon)] h-3 rounded-full transition-all duration-700"
                    style={{ width: `${allTotal ? (allUnlocked / allTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <span className="text-6xl select-none">🎯</span>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Quizzes Done",  value: quizStats?.total_completed ?? 0,          color: "text-blue-600"   },
                { label: "Avg Accuracy",  value: `${quizStats?.average_accuracy ?? 0}%`,   color: "text-green-600"  },
                { label: "Words Saved",   value: savedStats?.total ?? 0,                   color: "text-indigo-600" },
                {
                  label: "Streak",
                  value: streakInfo ? `${streakInfo.streak_days} 🔥` : "0 🔥",
                  color: "text-orange-500"
                },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-xl shadow p-5 text-center">
                  <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setFilter("all"); }}
                  className={`px-5 py-2.5 font-medium text-sm rounded-t-lg transition border-b-2 -mb-px ${
                    tab === t.key
                      ? "border-[var(--background)] text-[var(--background)] bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t.label} <span className="ml-1 text-xs text-gray-400">({t.count})</span>
                </button>
              ))}
            </div>

            {/* Streak panel (streak tab only) */}
            {tab === "streak" && streakInfo && (
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Current Streak", value: streakInfo.streak_days,    icon: "🔥", color: "text-orange-500" },
                  { label: "Longest Streak", value: streakInfo.longest_streak, icon: "🏆", color: "text-yellow-600" },
                  {
                    label: "Last Active",
                    value: streakInfo.last_active_at
                      ? new Date(streakInfo.last_active_at).toLocaleDateString()
                      : "—",
                    icon: "📅",
                    color: "text-blue-600"
                  },
                ].map(item => (
                  <div key={item.label} className="bg-white rounded-xl shadow p-5 text-center">
                    <p className="text-3xl">{item.icon}</p>
                    <p className={`text-2xl font-bold ${item.color} mt-1`}>{item.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Filter */}
            <div className="flex gap-2">
              {(["all", "unlocked", "locked"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition capitalize ${
                    filter === f
                      ? "bg-[var(--background)] text-white"
                      : "bg-white text-gray-600 border hover:border-gray-400"
                  }`}
                >
                  {f}
                  {f === "unlocked" ? ` (${unlockedCount})`
                    : f === "locked" ? ` (${activeAch.length - unlockedCount})`
                    : ""}
                </button>
              ))}
            </div>

            {/* Achievement grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayed.map(ach => <AchievementCard key={ach.id} ach={ach} />)}
              {displayed.length === 0 && (
                <div className="col-span-3 text-center py-12 text-gray-400">
                  <p className="text-4xl mb-2">🔍</p>
                  <p>No achievements found</p>
                </div>
              )}
            </div>

            {/* Recent quiz sessions */}
            {tab === "quiz" && quizStats && quizStats.recent_sessions.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-bold mb-4">📜 Recent Quizzes</h2>
                <div className="space-y-3">
                  {quizStats.recent_sessions.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📝</span>
                        <div>
                          <p className="text-sm font-medium capitalize">{s.mode} mode</p>
                          <p className="text-xs text-gray-500">
                            {new Date(s.start_time).toLocaleDateString()} · {s.time_spent}s
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${s.accuracy >= 80 ? "text-green-600" : s.accuracy >= 50 ? "text-yellow-600" : "text-red-500"}`}>
                          {s.accuracy}%
                        </p>
                        <p className="text-xs text-gray-500">{s.correct_answers}/{s.total_questions} correct</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved items breakdown */}
            {tab === "vocabulary" && savedStats && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-bold mb-4">📦 Saved Items Breakdown</h2>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: "Vocabulary", count: savedStats.vocabulary, icon: "🔤" },
                    { label: "Expressions", count: savedStats.expression, icon: "💬" },
                    { label: "Grammar",     count: savedStats.grammar,    icon: "📐" },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-2xl">{item.icon}</p>
                      <p className="text-2xl font-bold text-[var(--background)] mt-1">{item.count}</p>
                      <p className="text-xs text-gray-500">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {allTotal === 0 && (
              <div className="text-center py-20 text-gray-500">
                <p className="text-5xl mb-4">🎯</p>
                <p className="text-lg font-medium">아직 기록이 없어요!</p>
                <p className="text-sm mt-2">퀴즈를 완료하거나 단어를 저장하면 업적이 쌓입니다.</p>
                <a href="/vocabulary-quiz" className="mt-6 inline-block btn-primary px-6 py-3">
                  퀴즈 시작하기
                </a>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}