"use client";

import ModernNavigation from "@/app/components/ModernNavigation";
import LevelAssessment from "@/app/components/LevelAssessment";
import { useState } from "react";

export default function LevelAssessmentPage() {
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [userLevel, setUserLevel] = useState<number | null>(null);

  const handleLevelDetermined = (level: number) => {
    setUserLevel(level);
    setAssessmentComplete(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavigation />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Korean Level
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Take our quick assessment to find your perfect starting point in the TTMIK 1-10 level system.
          </p>
        </div>

        {!assessmentComplete ? (
          <LevelAssessment onLevelDetermined={handleLevelDetermined} />
        ) : (
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl">🎉</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Assessment Complete!
              </h2>
              <p className="text-xl text-gray-600 mb-4">
                Your recommended level is <span className="font-bold text-primary">TTMIK Level {userLevel}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">What's Next?</h3>
                <p className="text-gray-700 mb-4">
                  Based on your level, we recommend starting with these features:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a href="/curriculum" className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-primary transition-colors">
                    <h4 className="font-semibold mb-2">🗺️ Personalized Curriculum</h4>
                    <p className="text-sm text-gray-600">Get a custom learning roadmap</p>
                  </a>
                  <a href="/vocabulary-quiz" className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-primary transition-colors">
                    <h4 className="font-semibold mb-2">🎮 Vocabulary Quiz</h4>
                    <p className="text-sm text-gray-600">Start with level-appropriate words</p>
                  </a>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setAssessmentComplete(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Retake Assessment
                </button>
                <a
                  href="/curriculum"
                  className="btn-primary px-6 py-3"
                >
                  View My Curriculum
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}