"use client";

import ModernNavigation from "@/app/components/ModernNavigation";
import AchievementSystem from "@/app/components/AchievementSystem";
import { useState } from "react";
import type { UserProgress, AchievementNotification } from "@/app/types/achievement";

export default function AchievementsPage() {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleStartDashboard = () => {
    setShowWelcome(false);
  };

  const handleProgressUpdate = (progress: UserProgress) => {
    // 실제로는 상태 관리 시스템에 저장
    console.log('Progress updated:', progress);
  };

  const handleAchievementUnlock = (notification: AchievementNotification) => {
    // 실제로는 알림 시스템에 표시
    console.log('Achievement unlocked:', notification);
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernNavigation />
        
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Achievements & Progress
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track your Korean learning journey, unlock achievements, and celebrate your progress along the way.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-8">
              {/* Achievement System Overview */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 text-purple-900">
                  🏆 Achievement System
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">🎯</span>
                    </div>
                    <h4 className="font-semibold mb-1">Set Goals</h4>
                    <p className="text-gray-600">Clear learning objectives</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">📈</span>
                    </div>
                    <h4 className="font-semibold mb-1">Track Progress</h4>
                    <p className="text-gray-600">Monitor your improvement</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">🎉</span>
                    </div>
                    <h4 className="font-semibold mb-1">Celebrate Success</h4>
                    <p className="text-gray-600">Unlock achievements and rewards</p>
                  </div>
                </div>
              </div>

              {/* Progress Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">Level 5</div>
                  <div className="text-sm text-gray-600">Current Level</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">24/50</div>
                  <div className="text-sm text-gray-600">Achievements</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500 mb-1">1,250</div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">15</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Recent Achievements</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Word Collector', desc: 'Learn 10 vocabulary words', icon: '📚', points: 50, new: true },
                    { name: 'Three Day Streak', desc: 'Maintain a 3-day study streak', icon: '🔥', points: 100, new: true },
                    { name: 'Perfect Start', desc: 'Score 100% on 5 quizzes', icon: '💯', points: 200, new: false }
                  ].map((achievement, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">{achievement.icon}</span>
                        <div>
                          <div className="font-semibold">{achievement.name}</div>
                          <div className="text-sm text-gray-600">{achievement.desc}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                          +{achievement.points} pts
                        </div>
                        {achievement.new && (
                          <div className="text-green-500 text-xs mt-1">NEW!</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievement Categories */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Achievement Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { category: 'Vocabulary', count: 8, color: 'blue' },
                    { category: 'Grammar', count: 6, color: 'purple' },
                    { category: 'Pronunciation', count: 5, color: 'green' },
                    { category: 'Streak', count: 4, color: 'orange' },
                    { category: 'Time', count: 3, color: 'red' },
                    { category: 'Level', count: 5, color: 'yellow' }
                  ].map((cat) => (
                    <div key={cat.category} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold text-${cat.color}-600 mb-1`}>
                        {cat.count}
                      </div>
                      <div className="text-sm text-gray-600">{cat.category}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Progress Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-purple-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold">50+ Achievements</h4>
                      <p className="text-sm text-gray-600">Across all learning categories</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-purple-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold">Level System</h4>
                      <p className="text-sm text-gray-600">XP-based progression</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-purple-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold">Milestones</h4>
                      <p className="text-sm text-gray-600">Celebrate key achievements</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-purple-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold">Leaderboards</h4>
                      <p className="text-sm text-gray-600">Compare with other learners</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartDashboard}
                className="w-full btn-primary py-4 text-lg"
              >
                Open Achievement Dashboard
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
        <AchievementSystem
          userId="demo-user"
          onProgressUpdate={handleProgressUpdate}
          onAchievementUnlock={handleAchievementUnlock}
        />
      </main>
    </div>
  );
}