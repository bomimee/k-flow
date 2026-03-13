"use client";

import ModernNavigation from "@/app/components/ModernNavigation";
import VocabularyQuiz from "@/app/components/VocabularyQuiz";
import { useState, useEffect } from "react";
import type { QuizResult } from "@/app/types/vocabulary";
import { useAuth } from "@/app/hooks/useAuth";
import { fetchUserProfile } from "@/app/services/users";

export default function VocabularyQuizPage() {
  const [showSetup, setShowSetup] = useState(true);
  const [quizConfig, setQuizConfig] = useState({
    mode: 'learning' as const,
    questionCount: 10,
    difficulty: 'mixed' as const,
    categories: ['all'],
    level: 1,
  });
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id).then(profile => {
        if (profile) {
          setQuizConfig(prev => ({ ...prev, level: profile.ttmik_level }));
        }
      });
    }
  }, [user]);

  const handleStartQuiz = () => {
    setShowSetup(false);
    setQuizResult(null);
  };

  const handleQuizComplete = (result: QuizResult) => {
    setQuizResult(result);
  };

  const handleRetakeQuiz = () => {
    setShowSetup(true);
    setQuizResult(null);
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernNavigation />

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Vocabulary Quiz Challenge
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Test your Korean vocabulary with our gamified quiz system featuring Hanja integration and multiple question types.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-8">
              {/* Quiz Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Mode
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'learning', label: 'Learning Mode', desc: 'Practice with immediate feedback' },
                    { value: 'review', label: 'Review Mode', desc: 'Focus on words you need to practice' },
                    { value: 'challenge', label: 'Challenge Mode', desc: 'Test your knowledge under pressure' },
                    { value: 'time-attack', label: 'Time Attack', desc: 'Race against the clock' }
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setQuizConfig({ ...quizConfig, mode: mode.value as any })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${quizConfig.mode === mode.value
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="font-semibold">{mode.label}</div>
                      <div className="text-sm text-gray-600">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {[5, 10, 15, 20].map((count) => (
                    <button
                      key={count}
                      onClick={() => setQuizConfig({ ...quizConfig, questionCount: count })}
                      className={`p-3 rounded-lg border-2 font-semibold transition-all ${quizConfig.questionCount === count
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { value: 'easy', label: 'Easy', color: 'green' },
                    { value: 'medium', label: 'Medium', color: 'yellow' },
                    { value: 'hard', label: 'Hard', color: 'red' },
                    { value: 'mixed', label: 'Mixed', color: 'blue' }
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setQuizConfig({ ...quizConfig, difficulty: level.value as any })}
                      className={`p-3 rounded-lg border-2 font-semibold transition-all ${quizConfig.difficulty === level.value
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories (Optional)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'all', label: 'All Categories' },
                    { value: 'emotions', label: 'Emotions' },
                    { value: 'education', label: 'Education' },
                    { value: 'daily', label: 'Daily Life' },
                    { value: 'business', label: 'Business' },
                    { value: 'culture', label: 'Culture' }
                  ].map((category) => (
                    <button
                      key={category.value}
                      onClick={() => {
                        if (category.value === 'all') {
                          setQuizConfig({ ...quizConfig, categories: ['all'] });
                        } else {
                          const newCategories = quizConfig.categories.includes('all')
                            ? [category.value]
                            : quizConfig.categories.includes(category.value)
                              ? quizConfig.categories.filter(c => c !== category.value)
                              : [...quizConfig.categories, category.value];
                          setQuizConfig({ ...quizConfig, categories: newCategories });
                        }
                      }}
                      className={`p-3 rounded-lg border-2 font-semibold transition-all ${quizConfig.categories.includes(category.value)
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TTMIK Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TTMIK Level
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <button
                      key={level}
                      onClick={() => setQuizConfig({ ...quizConfig, level: level as any })}
                      className={`p-2 rounded-lg border-2 font-semibold transition-all ${(quizConfig as any).level === level
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Quiz Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>• Mode: {quizConfig.mode}</div>
                  <div>• Questions: {quizConfig.questionCount}</div>
                  <div>• Difficulty: {quizConfig.difficulty}</div>
                  <div>• Categories: {quizConfig.categories.join(', ')}</div>
                </div>
              </div>

              <button
                onClick={handleStartQuiz}
                className="w-full btn-primary py-4 text-lg"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (quizResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernNavigation />

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl">🎉</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Quiz Complete!
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {quizResult.score}%
                </div>
                <div className="text-gray-600">Final Score</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-secondary mb-2">
                  {quizResult.totalPoints}
                </div>
                <div className="text-gray-600">Points Earned</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Questions Answered</span>
                <span className="font-semibold">{quizResult.totalQuestions}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Correct Answers</span>
                <span className="font-semibold text-green-600">{quizResult.correctAnswers}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Time Spent</span>
                <span className="font-semibold">{Math.floor(quizResult.timeSpent / 60)}m {quizResult.timeSpent % 60}s</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Best Streak</span>
                <span className="font-semibold text-orange-500">🔥 {quizResult.bestStreak}</span>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleRetakeQuiz}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                New Quiz
              </button>
              <a
                href="/achievements"
                className="btn-primary px-6 py-3"
              >
                View Achievements
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavigation />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <VocabularyQuiz
          mode={quizConfig.mode}
          config={{
            mode: quizConfig.mode,
            questionCount: quizConfig.questionCount,
            difficulty: quizConfig.difficulty,
            categories: quizConfig.categories,
            levelRange: [quizConfig.level, quizConfig.level],
          }}
          onQuizComplete={handleQuizComplete}
        />
      </main>
    </div>
  );
}