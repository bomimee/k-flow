"use client";

import ModernNavigation from "@/app/components/ModernNavigation";
import SRSStudySession from "@/app/components/SRSStudySession";
import { useState } from "react";
import type { VocabularyItem, SRSStudyResults } from "@/app/types/vocabulary";

export default function SRSStudyPage() {
  // 데모 어휘 데이터 - 실제로는 API에서 가져옴
  const demoVocabulary: VocabularyItem[] = [
    {
      id: '1',
      korean: '사랑',
      hanja: '愛',
      meaning: 'love',
      pronunciation: 'sarang',
      level: 1,
      exampleSentence: '나는 너를 사랑해요.',
      exampleTranslation: 'I love you.',
      wordRoot: '사랑하다',
      relatedWords: ['애정', '연애', '우정'],
      difficulty: 'easy',
      category: 'emotions',
      srsData: {
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: new Date(),
        successRate: 0
      }
    },
    {
      id: '2',
      korean: '공부',
      hanja: '工夫',
      meaning: 'study',
      pronunciation: 'gongbu',
      level: 1,
      exampleSentence: '저는 한국어를 공부해요.',
      exampleTranslation: 'I study Korean.',
      wordRoot: '공부하다',
      relatedWords: ['학습', '연구', '교육'],
      difficulty: 'easy',
      category: 'education',
      srsData: {
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: new Date(),
        successRate: 0
      }
    }
  ];

  const [showWelcome, setShowWelcome] = useState(true);
  const [studyResults, setStudyResults] = useState<SRSStudyResults | null>(null);

  const handleStartStudy = () => {
    setShowWelcome(false);
    setStudyResults(null);
  };

  const handleSessionComplete = (results: SRSStudyResults) => {
    setStudyResults(results);
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ModernNavigation />

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Spaced Repetition Study
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Use our scientifically-proven SRS algorithm to optimize your vocabulary learning and retention.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="space-y-8">
              {/* SRS Explanation */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 text-blue-900 dark:text-blue-100">
                  🧠 How SRS Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <h4 className="font-semibold mb-1 dark:text-gray-100">Learn</h4>
                    <p className="text-gray-600 dark:text-gray-400">Study new vocabulary items</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <h4 className="font-semibold mb-1 dark:text-gray-100">Review</h4>
                    <p className="text-gray-600 dark:text-gray-400">Review at optimal intervals</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <h4 className="font-semibold mb-1 dark:text-gray-100">Master</h4>
                    <p className="text-gray-600 dark:text-gray-400">Long-term retention achieved</p>
                  </div>
                </div>
              </div>

              {/* Study Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">12</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Due Today</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">85%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500 mb-1">7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Day Streak</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">156</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Learned</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg dark:text-gray-100">Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold dark:text-gray-100">SM-2 Algorithm</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Proven spaced repetition method</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold dark:text-gray-100">Adaptive Learning</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Difficulty adjusts to your level</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold dark:text-gray-100">Priority Scheduling</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Focus on what needs review most</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold dark:text-gray-100">Progress Tracking</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Detailed learning analytics</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartStudy}
                className="w-full btn-primary py-4 text-lg"
              >
                Start SRS Session
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (studyResults) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ModernNavigation />

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl">🎉</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Study Session Complete!
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
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
                href="/vocabulary-quiz"
                className="btn-primary px-6 py-3"
              >
                Try Vocabulary Quiz
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ModernNavigation />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <SRSStudySession
          vocabulary={demoVocabulary}
          onSessionComplete={handleSessionComplete}
        />
      </main>
    </div>
  );
}