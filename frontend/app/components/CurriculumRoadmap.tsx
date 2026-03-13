import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { TTMIKLevel, CurriculumRoadmap, WeeklyGoal, Milestone } from '@/app/types/level';
import { TTMIK_LEVELS, LEVEL_REQUIREMENTS } from '@/app/types/level';

interface CurriculumRoadmapProps {
  currentLevel: TTMIKLevel;
  targetLevel: TTMIKLevel;
  timeframe: number; // weeks
}

export default function CurriculumRoadmap({ currentLevel, targetLevel, timeframe }: CurriculumRoadmapProps) {
  const [roadmap, setRoadmap] = useState<CurriculumRoadmap | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  useEffect(() => {
    generateRoadmap();
  }, [currentLevel, targetLevel, timeframe]);

  const generateRoadmap = () => {
    const weeksPerLevel = timeframe / (targetLevel - currentLevel + 1);
    const weeklyGoals: WeeklyGoal[] = [];
    const milestones: Milestone[] = [];

    // Generate weekly goals
    for (let level = currentLevel; level <= targetLevel; level++) {
      const levelInfo = TTMIK_LEVELS[level];
      const levelStartWeek = Math.floor((level - currentLevel) * weeksPerLevel) + 1;
      const levelEndWeek = Math.floor((level - currentLevel + 1) * weeksPerLevel);

      // Add milestone for level completion
      milestones.push({
        level,
        title: `Complete TTMIK Level ${level}`,
        description: levelInfo.description,
        requirements: LEVEL_REQUIREMENTS[level],
        rewards: [
          `+${level * 100} XP`,
          `Unlock Level ${level + 1} content`,
          `Certificate of completion`
        ]
      });

      // Generate weekly goals for this level
      for (let week = levelStartWeek; week <= levelEndWeek && week <= timeframe; week++) {
        const weekInLevel = week - levelStartWeek + 1;
        const totalWeeksInLevel = levelEndWeek - levelStartWeek + 1;

        weeklyGoals.push({
          week,
          vocabulary: Math.ceil((levelInfo.estimatedVocabulary * 0.3) / totalWeeksInLevel),
          grammar: Math.ceil((levelInfo.grammarPoints.length * 0.5) / totalWeeksInLevel),
          practice: generatePracticeTopics(level, weekInLevel, totalWeeksInLevel),
          dramaContent: generateDramaContent(level, weekInLevel, totalWeeksInLevel)
        });
      }
    }

    setRoadmap({
      currentLevel,
      targetLevel,
      timeframe,
      weeklyGoals,
      milestones
    });
  };

  const generatePracticeTopics = (level: TTMIKLevel, weekInLevel: number, totalWeeksInLevel: number): string[] => {
    const topics: string[] = [];

    if (level <= 2) {
      topics.push('Pronunciation practice', 'Basic conversation drills');
    } else if (level <= 4) {
      topics.push('Sentence building', 'Role-playing exercises');
    } else if (level <= 6) {
      topics.push('Complex sentence practice', 'Honorific usage drills');
    } else {
      topics.push('Advanced conversation', 'Cultural expression practice');
    }

    if (weekInLevel === Math.ceil(totalWeeksInLevel / 2)) {
      topics.push('Mid-level review session');
    }

    return topics;
  };

  const generateDramaContent = (level: TTMIKLevel, weekInLevel: number, totalWeeksInLevel: number): string[] => {
    const content: string[] = [];

    if (level === 1) {
      content.push('Basic greeting scenes from romantic comedies');
    } else if (level === 2) {
      content.push('Simple conversation scenes from daily life dramas');
    } else if (level === 3) {
      content.push('Story-telling scenes from family dramas');
    } else if (level === 4) {
      content.push('Planning and future-talk scenes from career dramas');
    } else if (level === 5) {
      content.push('Formal business scenes from workplace dramas');
    } else if (level === 6) {
      content.push('Complex emotional scenes from melodramas');
    } else {
      content.push('Culturally nuanced scenes from historical dramas');
    }

    return content;
  };

  if (!roadmap) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse">
          <div className="w-16 h-16 border-4 border-[var(--background)] border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-gradient-to-r from-[var(--background)] to-[var(--lightblue)] text-black p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Your Learning Roadmap</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">Level {currentLevel}</p>
            <p className="text-sm opacity-90">Current Level</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{timeframe} weeks</p>
            <p className="text-sm opacity-90">Timeframe</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">Level {targetLevel}</p>
            <p className="text-sm opacity-90">Target Level</p>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">🏆 Milestones</h3>
        <div className="space-y-4">
          {roadmap.milestones.map((milestone, index) => (
            <div key={milestone.level} className="border-l-4 border-[var(--lemon)] pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-lg">{milestone.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">{milestone.description}</p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Requirements:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {milestone.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-[var(--lemon)] text-black px-3 py-1 rounded-full text-sm font-semibold">
                    Level {milestone.level}
                  </div>
                  <div className="mt-2 space-y-1">
                    {milestone.rewards.map((reward, rewardIndex) => (
                      <p key={rewardIndex} className="text-xs text-green-600 font-semibold">
                        🎁 {reward}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Goals */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">📅 Weekly Study Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmap.weeklyGoals.map((week) => (
            <div
              key={week.week}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedWeek === week.week
                ? 'border-[var(--background)] bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
              onClick={() => setSelectedWeek(selectedWeek === week.week ? null : week.week)}
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Week {week.week}</h4>
                <span className="bg-[var(--lemon)] text-black px-2 py-1 rounded-full text-xs font-semibold">
                  Focus
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">📚 Vocabulary:</span>
                  <span className="font-semibold">{week.vocabulary} words</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">🧩 Grammar:</span>
                  <span className="font-semibold">{week.grammar} points</span>
                </div>
              </div>

              {selectedWeek === week.week && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">🎯 Practice Topics:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {week.practice.map((topic, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-[var(--background)] rounded-full mr-2"></span>
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">🎬 Youtube Content:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {week.dramaContent.map((content, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-[var(--lightblue)] rounded-full mr-2"></span>
                          {content}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2">
                    <Link
                      href={`/study-plan/${roadmap.currentLevel}/${week.week}?vocab=${week.vocabulary}&grammar=${week.grammar}`}
                      className="w-full py-2 bg-[var(--lemon)] text-black text-center rounded-lg text-sm font-semibold shadow-sm hover:bg-[var(--lightbeige)] transition-colors"
                    >
                      📝 Open Weekly Study Plan
                    </Link>
                    <Link
                      href="/learning"
                      className="w-full py-2 bg-gray-100 text-gray-700 text-center rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-200 transition-colors"
                    >
                      🎬 Jump to Video Study
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="bg-gradient-to-r from-[var(--lemon)] to-[var(--lightbeige)] p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-black">📊 Progress Tracker</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-black">0%</p>
            <p className="text-sm text-gray-700">Overall Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-black">0/{roadmap.timeframe}</p>
            <p className="text-sm text-gray-700">Weeks Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-black">0</p>
            <p className="text-sm text-gray-700">Vocabulary Learned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-black">0</p>
            <p className="text-sm text-gray-700">Grammar Points</p>
          </div>
        </div>
      </div>
    </div>
  );
}