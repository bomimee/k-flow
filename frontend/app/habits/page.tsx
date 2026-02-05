"use client";

import ModernNavigation from "@/app/components/ModernNavigation";
import HabitFormationDashboard from "@/app/components/HabitFormationDashboard";
import { useState } from "react";
import type { Behavior } from "@/app/types/behavior";

export default function HabitsPage() {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleStartDashboard = () => {
    setShowWelcome(false);
  };

  const handleBehaviorUpdate = (behaviors: Behavior[]) => {
    // 실제로는 상태 관리 시스템에 저장
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
              {/* BJ Fogg Model Explanation */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 text-yellow-900">
                  🎯 The BJ Fogg Behavior Model
                </h3>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-yellow-600 mb-2">B = M × A × P</div>
                  <p className="text-gray-600">Behavior = Motivation × Ability × Prompt</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">M</span>
                    </div>
                    <h4 className="font-semibold mb-1">Motivation</h4>
                    <p className="text-gray-600">Your desire to do the behavior</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">A</span>
                    </div>
                    <h4 className="font-semibold mb-1">Ability</h4>
                    <p className="text-gray-600">How easy the behavior is to do</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">P</span>
                    </div>
                    <h4 className="font-semibold mb-1">Prompt</h4>
                    <p className="text-gray-600">The trigger to perform the behavior</p>
                  </div>
                </div>
              </div>

              {/* Habit Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">85%</div>
                  <div className="text-sm text-gray-600">Formation Score</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
                  <div className="text-sm text-gray-600">Active Habits</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500 mb-1">7</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">92%</div>
                  <div className="text-sm text-gray-600">Consistency</div>
                </div>
              </div>

              {/* Micro-Habits */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Your Micro-Habits</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Review 5 flashcards', time: '2 min', completed: true },
                    { name: 'Learn 1 new word', time: '3 min', completed: true },
                    { name: 'Practice 1 pronunciation', time: '1 min', completed: false },
                    { name: 'Watch 1 min K-drama', time: '1 min', completed: false }
                  ].map((habit, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={habit.completed}
                          className="w-5 h-5 text-yellow-500 rounded"
                          readOnly
                        />
                        <div>
                          <div className="font-medium">{habit.name}</div>
                          <div className="text-sm text-gray-500">{habit.time}</div>
                        </div>
                      </div>
                      <span className={`text-sm ${habit.completed ? 'text-green-600' : 'text-gray-400'}`}>
                        {habit.completed ? '✓ Done' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Habit Building Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold">Behavior Design</h4>
                      <p className="text-sm text-gray-600">Custom habits for your goals</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold">Micro-Habits</h4>
                      <p className="text-sm text-gray-600">Tiny steps for big results</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold">Smart Prompts</h4>
                      <p className="text-sm text-gray-600">Timely reminders and cues</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold">Progress Tracking</h4>
                      <p className="text-sm text-gray-600">Visual habit formation analytics</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartDashboard}
                className="w-full btn-primary py-4 text-lg"
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