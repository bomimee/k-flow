"use client";

import ModernNavigation from "@/app/components/ModernNavigation";
import SRSStudySession from "@/app/components/SRSStudySession";
import SRSStoryMode from "@/app/components/SRSStoryMode";
import { useState, useEffect } from "react";
import type { VocabularyItem, SRSStudyResults } from "@/app/types/vocabulary";
import { useAuth } from "@/app/hooks/useAuth";
import { fetchDueItems, fetchDueGrammarItems } from "@/app/services/srs";
import { fetchHabits } from "@/app/services/habits";
import SRSGrammarStudySession from "@/app/components/SRSGrammarStudySession";

export default function SRSStudyPage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [studyMode, setStudyMode] = useState<'vocabulary' | 'grammar' | 'story'>('vocabulary');
  const [studyResults, setStudyResults] = useState<SRSStudyResults | null>(null);
  const { user } = useAuth();
  const [srsStats, setSrsStats] = useState<{ dueToday: number; accuracy: number; streak: number; totalLearned: number } | null>(null);
  const [srsGrammarStats, setSrsGrammarStats] = useState<{ dueToday: number } | null>(null);
  const [dueVocabulary, setDueVocabulary] = useState<VocabularyItem[]>([]);
  const [dueGrammar, setDueGrammar] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchDueItems(user.id),
      fetchDueGrammarItems(user.id),
      fetchHabits(user.id).catch(() => null)
    ]).then(([dueItems, dueGrammarItems, habitsRes]) => {
      setDueVocabulary(dueItems);
      setDueGrammar(dueGrammarItems);
      setSrsStats({
        dueToday: dueItems.length,
        accuracy: habitsRes ? Math.round(habitsRes.stats.avg_success_rate) : 0,
        streak: habitsRes ? habitsRes.stats.streak_days : 0,
        totalLearned: habitsRes ? habitsRes.stats.saved_items_total : 0
      });
      setSrsGrammarStats({
        dueToday: dueGrammarItems.length,
      });
    }).catch(console.error);
  }, [user]);

  const handleStartStudy = () => {
    setShowWelcome(false);
    setStudyResults(null);
  };

  const handleSessionComplete = (results: SRSStudyResults) => {
    setStudyResults(results);
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernNavigation />

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Spaced Repetition Study
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Use our scientifically-proven SRS algorithm to optimize your vocabulary learning and retention.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-8">
              {/* SRS Explanation */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 text-blue-900">
                  🧠 How SRS Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <h4 className="font-semibold mb-1">Learn</h4>
                    <p className="text-gray-600">Study new vocabulary items</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <h4 className="font-semibold mb-1">Review</h4>
                    <p className="text-gray-600">Review at optimal intervals</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <h4 className="font-semibold mb-1">Master</h4>
                    <p className="text-gray-600">Long-term retention achieved</p>
                  </div>
                </div>
              </div>

              {/* Study Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {srsStats ? srsStats.dueToday : 12}
                  </div>
                  <div className="text-sm text-gray-600">Due Today</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {srsStats ? srsStats.accuracy : 85}%
                  </div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500 mb-1">
                    {srsStats ? srsStats.streak : 7}
                  </div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {srsStats ? srsStats.totalLearned : 156}
                  </div>
                  <div className="text-sm text-gray-600">Total Learned</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold">SM-2 Algorithm</h4>
                      <p className="text-sm text-gray-600">Proven spaced repetition method</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold">Adaptive Learning</h4>
                      <p className="text-sm text-gray-600">Difficulty adjusts to your level</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold">Priority Scheduling</h4>
                      <p className="text-sm text-gray-600">Focus on what needs review most</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold">Progress Tracking</h4>
                      <p className="text-sm text-gray-600">Detailed learning analytics</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => { setStudyMode('vocabulary'); handleStartStudy(); }}
                    disabled={dueVocabulary.length === 0}
                    className={`btn-primary w-1/2 py-4 text-lg rounded-xl font-bold transition-colors ${dueVocabulary.length > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    Start Vocab Session ({dueVocabulary.length} due)
                  </button>
                  <button
                    onClick={() => { setStudyMode('grammar'); handleStartStudy(); }}
                    disabled={dueGrammar.length === 0}
                    className={`btn-primary w-1/2 py-4 text-lg rounded-xl font-bold transition-colors ${dueGrammar.length > 0 ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    Start Grammar Session ({dueGrammar.length} due)
                  </button>
                </div>

                {/* Story Mode */}
                <button
                  onClick={() => { setStudyMode('story'); handleStartStudy(); }}
                  disabled={dueVocabulary.length === 0}
                  className={`btn-secondary w-full py-4 text-lg rounded-xl font-bold transition-all flex items-center justify-center gap-3 ${dueVocabulary.length > 0
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md hover:shadow-violet-500/30 hover:opacity-90'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <span className="text-2xl">✨</span>
                  <div className="text-left">
                    <div>AI Story Mode</div>
                    <div className="text-sm font-normal opacity-80">Read a new story with today's words</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (studyResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernNavigation />

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl">🎉</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Study Session Complete!
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {studyResults.itemsStudied}
                </div>
                <div className="text-gray-600">Items Studied</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600 mb-2">
                  {Math.round(studyResults.averageQuality * 20)}%
                </div>
                <div className="text-gray-600">Average Quality</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Correct Answers</span>
                <span className="font-semibold text-green-600">{studyResults.correctAnswers}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Time Spent</span>
                <span className="font-semibold">{Math.floor(studyResults.totalTimeSpent / 60)}m {studyResults.totalTimeSpent % 60}s</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Next Review</span>
                <span className="font-semibold text-blue-600">In 1 day</span>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleStartStudy}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Continue Studying
              </button>
              <a
                href="/curriculum"
                className="btn-primary px-6 py-3"
              >
                Return to Curriculum
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
        {studyMode === 'story' ? (
          user ? (
            <SRSStoryMode
              userId={user.id}
              onSessionComplete={handleSessionComplete}
              onBack={() => setShowWelcome(true)}
            />
          ) : null
        ) : studyMode === 'vocabulary' ? (
          dueVocabulary.length > 0 ? (
            <SRSStudySession
              vocabulary={dueVocabulary}
              onSessionComplete={handleSessionComplete}
            />
          ) : (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">You&apos;re all caught up on Vocabulary!</h2>
              <p className="text-gray-600 mb-8">No more vocabulary to review today. Come back tomorrow.</p>
              <a href="/curriculum" className="flex-1 btn-primary px-6 py-3 rounded-lg text-white">
                View study plan
              </a>
            </div>
          )
        ) : (
          dueGrammar.length > 0 ? (
            <SRSGrammarStudySession
              grammarItems={dueGrammar}
              onSessionComplete={handleSessionComplete}
            />
          ) : (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">You&apos;re all caught up on Grammar!</h2>
              <p className="text-gray-600 mb-8">No more grammar points to review today. Come back tomorrow.</p>
              <a href="/curriculum" className="flex-1 btn-primary px-6 py-3 rounded-lg text-white">
                View study plan
              </a>
            </div>
          )
        )}
      </main>
    </div>
  );
}