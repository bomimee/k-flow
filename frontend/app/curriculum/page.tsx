"use client";

import ModernNavigation from "@/app/components/ModernNavigation";
import CurriculumRoadmap from "@/app/components/CurriculumRoadmap";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/hooks/useAuth";

export default function CurriculumPage() {
  const [showSetup, setShowSetup] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user, updateUserMetadata } = useAuth();

  const [roadmapConfig, setRoadmapConfig] = useState({
    currentLevel: 1,
    targetLevel: 5,
    timeframe: 12 // weeks
  });

  useEffect(() => {
    if (user?.user_metadata?.curriculum) {
      setRoadmapConfig(user.user_metadata.curriculum);
      setShowSetup(false);
    } else if (user?.user_metadata?.level) {
      // Pre-fill current level if user took the assessment
      setRoadmapConfig(prev => ({
        ...prev,
        currentLevel: user.user_metadata.level
      }));
    }
  }, [user]);

  const handleStartRoadmap = async () => {
    if (user) {
      setIsSaving(true);
      try {
        await updateUserMetadata({ curriculum: roadmapConfig });
      } catch (err) {
        console.error("Failed to save curriculum:", err);
      } finally {
        setIsSaving(false);
      }
    }
    setShowSetup(false);
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernNavigation />

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Create Your Learning Roadmap
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Set your goals and we'll create a personalized curriculum to help you reach them.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-8">
              {/* Current Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Level
                </label>
                <select
                  value={roadmapConfig.currentLevel}
                  onChange={(e) => setRoadmapConfig({ ...roadmapConfig, currentLevel: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                    <option key={level} value={level}>TTMIK Level {level}</option>
                  ))}
                </select>
              </div>

              {/* Target Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Level
                </label>
                <select
                  value={roadmapConfig.targetLevel}
                  onChange={(e) => setRoadmapConfig({ ...roadmapConfig, targetLevel: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                    <option key={level} value={level} disabled={level <= roadmapConfig.currentLevel}>
                      TTMIK Level {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timeframe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Timeline (weeks)
                </label>
                <select
                  value={roadmapConfig.timeframe}
                  onChange={(e) => setRoadmapConfig({ ...roadmapConfig, timeframe: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={4}>4 weeks (Intensive)</option>
                  <option value={8}>8 weeks (Fast)</option>
                  <option value={12}>12 weeks (Moderate)</option>
                  <option value={16}>16 weeks (Relaxed)</option>
                  <option value={24}>24 weeks (Casual)</option>
                </select>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Your Learning Plan</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• From Level {roadmapConfig.currentLevel} to Level {roadmapConfig.targetLevel}</p>
                  <p>• {roadmapConfig.targetLevel - roadmapConfig.currentLevel} levels to complete</p>
                  <p>• {roadmapConfig.timeframe} weeks timeline</p>
                  <p>• Approximately {Math.ceil((roadmapConfig.targetLevel - roadmapConfig.currentLevel) * 200 / roadmapConfig.timeframe)} vocabulary words per week</p>
                </div>
              </div>

              <button
                onClick={handleStartRoadmap}
                disabled={isSaving}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  "Generate My Roadmap"
                )}
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Personalized Curriculum
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Follow this roadmap to reach your Korean learning goals
          </p>
        </div>

        <CurriculumRoadmap
          currentLevel={roadmapConfig.currentLevel as any}
          targetLevel={roadmapConfig.targetLevel as any}
          timeframe={roadmapConfig.timeframe}
        />
      </main>
    </div>
  );
}