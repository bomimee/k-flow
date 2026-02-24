import { useState, useEffect } from 'react';
import type {
  Behavior,
  HabitFormation,
  MicroHabit,
  BehaviorDesign,
  BehaviorCategory
} from '@/app/types/behavior';
import { BehaviorModel } from '@/app/services/behaviorModel';

interface HabitFormationDashboardProps {
  onBehaviorUpdate: (behaviors: Behavior[]) => void;
}

export default function HabitFormationDashboard({ onBehaviorUpdate }: HabitFormationDashboardProps) {
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [habitFormation, setHabitFormation] = useState<HabitFormation | null>(null);
  const [selectedBehavior, setSelectedBehavior] = useState<Behavior | null>(null);
  const [microHabits, setMicroHabits] = useState<MicroHabit[]>([]);
  const [showDesignWizard, setShowDesignWizard] = useState(false);

  useEffect(() => {
    initializeBehaviors();
  }, []);

  useEffect(() => {
    if (behaviors.length > 0) {
      updateHabitFormation();
    }
  }, [behaviors]);

  const initializeBehaviors = () => {
    const defaultBehaviors: Behavior[] = [
      {
        id: 'vocab-daily',
        name: 'Daily Vocabulary Review',
        description: 'Review 10 vocabulary words using spaced repetition',
        motivation: 7,
        ability: 8,
        prompt: {
          type: 'time',
          trigger: '9:00 AM',
          cue: 'Time for your daily vocabulary review!',
          isEnabled: true
        },
        category: 'vocabulary',
        rewards: [
          {
            type: 'intrinsic',
            description: 'Sense of accomplishment',
            points: 10,
            isImmediate: true
          },
          {
            type: 'extrinsic',
            description: 'XP points',
            points: 50,
            isImmediate: true
          }
        ],
        streak: 3,
        frequency: 'daily'
      },
      {
        id: 'drama-practice',
        name: 'K-Drama Sentence Practice',
        description: 'Practice 5 sentences from K-drama clips',
        motivation: 8,
        ability: 6,
        prompt: {
          type: 'context',
          trigger: 'evening relaxation',
          cue: 'Relax and learn with K-drama practice!',
          isEnabled: true
        },
        category: 'speaking',
        rewards: [
          {
            type: 'intrinsic',
            description: 'Improved pronunciation',
            points: 15,
            isImmediate: false
          }
        ],
        streak: 1,
        frequency: 'daily'
      },
      {
        id: 'grammar-review',
        name: 'Weekly Grammar Review',
        description: 'Review and practice grammar points from the week',
        motivation: 5,
        ability: 7,
        prompt: {
          type: 'time',
          trigger: 'Sunday 7:00 PM',
          cue: 'Time for your weekly grammar review!',
          isEnabled: true
        },
        category: 'grammar',
        rewards: [
          {
            type: 'extrinsic',
            description: 'Grammar mastery badge',
            points: 100,
            isImmediate: false
          }
        ],
        streak: 0,
        frequency: 'weekly'
      }
    ];

    setBehaviors(defaultBehaviors);
  };

  const updateHabitFormation = () => {
    const completedBehaviors = behaviors.filter(b => b.lastCompleted);
    const totalCompleted = behaviors.reduce((sum, b) => sum + b.streak, 0);

    const formation: HabitFormation = {
      behaviors,
      currentStreak: Math.max(...behaviors.map(b => b.streak)),
      longestStreak: Math.max(...behaviors.map(b => b.streak)),
      totalBehaviorsCompleted: totalCompleted,
      completionRate: completedBehaviors.length / behaviors.length,
      motivationLevel: behaviors.reduce((sum, b) => sum + b.motivation, 0) / behaviors.length,
      lastActiveDate: new Date()
    };

    setHabitFormation(formation);
  };

  const handleBehaviorComplete = (behaviorId: string) => {
    const updatedBehaviors = behaviors.map(behavior => {
      if (behavior.id === behaviorId) {
        return {
          ...behavior,
          streak: behavior.streak + 1,
          lastCompleted: new Date()
        };
      }
      return behavior;
    });

    setBehaviors(updatedBehaviors);
    onBehaviorUpdate(updatedBehaviors);
  };

  const handleMotivationChange = (behaviorId: string, newMotivation: number) => {
    const updatedBehaviors = behaviors.map(behavior => {
      if (behavior.id === behaviorId) {
        return { ...behavior, motivation: newMotivation };
      }
      return behavior;
    });

    setBehaviors(updatedBehaviors);
  };

  const handleAbilityChange = (behaviorId: string, newAbility: number) => {
    const updatedBehaviors = behaviors.map(behavior => {
      if (behavior.id === behaviorId) {
        return { ...behavior, ability: newAbility };
      }
      return behavior;
    });

    setBehaviors(updatedBehaviors);
  };

  const getBehaviorScore = (behavior: Behavior): number => {
    return BehaviorModel.calculateBehaviorScore(
      behavior.motivation,
      behavior.ability,
      behavior.prompt.isEnabled ? 10 : 0
    );
  };

  const getBehaviorColor = (score: number): string => {
    if (score >= 7) return 'text-green-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMicroHabitsForBehavior = (behaviorId: string): MicroHabit[] => {
    const behavior = behaviors.find(b => b.id === behaviorId);
    if (!behavior) return [];

    return BehaviorModel.createMicroHabits(behavior);
  };

  if (!habitFormation) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  const analysis = BehaviorModel.calculateHabitFormation(behaviors);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">🎯 Habit Formation Dashboard</h2>
        <p className="text-gray-600">Build sustainable Korean learning habits using the BJ Fogg Behavior Model</p>
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Overall Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{analysis.formationScore}%</p>
            <p className="text-sm opacity-90">Formation</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{analysis.consistencyScore}%</p>
            <p className="text-sm opacity-90">Consistency</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{analysis.automaticityScore}%</p>
            <p className="text-sm opacity-90">Automaticity</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{habitFormation.currentStreak}</p>
            <p className="text-sm opacity-90">Current Streak</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-[var(--lemon)] p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4 text-black">💡 Recommendations</h3>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-black mr-2">•</span>
                <span className="text-black">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Behaviors List */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">🎯 Active Behaviors</h3>
          <button
            onClick={() => setShowDesignWizard(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            + Add Behavior
          </button>
        </div>

        <div className="space-y-4">
          {behaviors.map(behavior => {
            const score = getBehaviorScore(behavior);
            const willOccur = BehaviorModel.willBehaviorOccur(
              behavior.motivation,
              behavior.ability,
              behavior.prompt.isEnabled ? 10 : 0
            );

            return (
              <div
                key={behavior.id}
                className={`border-2 rounded-lg p-4 transition-all duration-200 ${selectedBehavior?.id === behavior.id
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
                onClick={() => setSelectedBehavior(behavior)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-2">{behavior.name}</h4>
                    <p className="text-gray-600 text-sm mb-3">{behavior.description}</p>

                    <div className="flex items-center space-x-4 text-sm">
                      <span className={`px-2 py-1 rounded font-medium ${behavior.category === 'vocabulary' ? 'bg-blue-100 text-blue-700' :
                          behavior.category === 'grammar' ? 'bg-purple-100 text-purple-700' :
                            behavior.category === 'speaking' ? 'bg-green-100 text-green-700' :
                              behavior.category === 'listening' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                        }`}>
                        {behavior.category}
                      </span>

                      <span className="text-gray-500">
                        {behavior.frequency}
                      </span>

                      <span className="flex items-center">
                        🔥 {behavior.streak}
                      </span>

                      <span className={`font-semibold ${getBehaviorColor(score)}`}>
                        {willOccur ? '✓' : '⚠'} {score.toFixed(1)}/10
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBehaviorComplete(behavior.id);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    Complete
                  </button>
                </div>

                {/* B=M×A×P Components */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="text-sm text-gray-600">Motivation</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={behavior.motivation}
                        onChange={(e) => handleMotivationChange(behavior.id, parseInt(e.target.value))}
                        className="flex-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-sm font-semibold w-8">{behavior.motivation}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Ability</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={behavior.ability}
                        onChange={(e) => handleAbilityChange(behavior.id, parseInt(e.target.value))}
                        className="flex-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-sm font-semibold w-8">{behavior.ability}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Prompt</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm">
                        {behavior.prompt.isEnabled ? '✅' : '❌'} {behavior.prompt.cue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Improvement Suggestions */}
                {score < 4 && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-800 mb-2">Suggestions:</p>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      {behavior.motivation < 5 && BehaviorModel.getMotivationEnhancements(behavior.motivation).slice(0, 2).map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                      {behavior.ability < 5 && BehaviorModel.getAbilityImprovements(behavior.ability).slice(0, 2).map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Behavior Detail */}
      {selectedBehavior && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">🔍 Behavior Details: {selectedBehavior.name}</h3>

          {/* Micro-habits */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Micro-Habits (Tiny Steps)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getMicroHabitsForBehavior(selectedBehavior.id).map((microHabit, index) => (
                <div key={microHabit.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{microHabit.name}</p>
                      <p className="text-xs text-gray-500">{microHabit.duration}s • {microHabit.difficulty}</p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-primary"
                      checked={microHabit.isCompleted}
                      onChange={(e) => {
                        // Handle micro-habit completion
                        const updatedHabits = microHabits.map(h =>
                          h.id === microHabit.id
                            ? { ...h, isCompleted: e.target.checked, completedAt: e.target.checked ? new Date() : undefined }
                            : h
                        );
                        setMicroHabits(updatedHabits);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rewards */}
          <div>
            <h4 className="font-semibold mb-3">🎁 Rewards</h4>
            <div className="space-y-2">
              {selectedBehavior.rewards.map((reward, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{reward.description}</p>
                    <p className="text-xs text-gray-500">
                      {reward.type} • {reward.isImmediate ? 'Immediate' : 'Delayed'}
                    </p>
                  </div>
                  <span className="bg-[var(--lemon)] text-black px-3 py-1 rounded-full text-sm font-semibold">
                    +{reward.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}