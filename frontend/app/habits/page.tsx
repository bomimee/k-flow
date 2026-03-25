"use client";

import ModernNavigation from "@/app/components/ModernNavigation";
import HabitFormationDashboard from "@/app/components/HabitFormationDashboard";
import { useState, useEffect } from "react";
import type { Behavior } from "@/app/types/behavior";
import { useAuth } from "@/app/hooks/useAuth";
import { fetchHabits, type HabitStats } from "@/app/services/habits";

export default function HabitsPage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const { user } = useAuth();
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [habitCount, setHabitCount] = useState(0);

  // 실제 데이터로 Welcome 화면 통계 채우기
  useEffect(() => {
    if (!user) return;
    fetchHabits(user.id)
      .then(data => {
        setStats(data.stats);
        setHabitCount(data.habits.length);
      })
      .catch(() => { /* 실패 시 0으로 표시 */ });
  }, [user]);

  const handleBehaviorUpdate = (behaviors: Behavior[]) => {
    console.log('Behaviors updated:', behaviors);
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernNavigation />

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Habit Formation
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Build sustainable Korean learning habits using the BJ Fogg Behavior Model.
              Make progress automatic and enjoyable.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-8">
              {/* BJ Fogg Model */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 text-yellow-900">
                  🎯 The BJ Fogg Behavior Model
                </h3>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-yellow-600 mb-2">B = M × A × P</div>
                  <p className="text-gray-600">Behavior = Motivation × Ability × Prompt</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {[
                    { letter: 'M', label: 'Motivation', desc: 'Your desire to do the behavior' },
                    { letter: 'A', label: 'Ability', desc: 'How easy the behavior is to do' },
                    { letter: 'P', label: 'Prompt', desc: 'The trigger to perform the behavior' },
                  ].map(({ letter, label, desc }) => (
                    <div key={letter} className="text-center">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold">{letter}</span>
                      </div>
                      <h4 className="font-semibold mb-1">{label}</h4>
                      <p className="text-gray-600">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 실제 통계 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500 mb-1">
                    🔥 {stats ? stats.streak_days : '—'}
                  </div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {habitCount || '—'}
                  </div>
                  <div className="text-sm text-gray-600">Active Habits</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {stats ? `${stats.avg_success_rate}%` : '—'}
                  </div>
                  <div className="text-sm text-gray-600">SRS Accuracy</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {stats ? stats.saved_items_total : '—'}
                  </div>
                  <div className="text-sm text-gray-600">Saved Items</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Habit Building Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Behavior Design', desc: 'Custom habits for your goals' },
                    { title: 'Real Activity Stats', desc: 'Powered by your SRS & saved words' },
                    { title: 'Smart Prompts', desc: 'Timely reminders and cues' },
                    { title: 'Streak Tracking', desc: 'Visual habit formation analytics' },
                  ].map(({ title, desc }) => (
                    <div key={title} className="flex items-start space-x-3">
                      <span className="text-yellow-500 text-xl">✓</span>
                      <div>
                        <h4 className="font-semibold">{title}</h4>
                        <p className="text-sm text-gray-600">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowWelcome(false)}
                className="w-full btn-secondary py-4 text-lg"
              >
                Open Habit Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavigation />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <HabitFormationDashboard onBehaviorUpdate={handleBehaviorUpdate} />
      </main>
    </div>
  );
}