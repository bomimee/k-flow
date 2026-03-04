import { useState, useEffect } from 'react';
import type {
  Achievement,
  UserProgress,
  AchievementNotification,
  Milestone,
  Badge,
  ProgressEvent
} from '@/app/types/achievement';
import { ACHIEVEMENT_DEFINITIONS, MILESTONE_DEFINITIONS } from '@/app/types/achievement';

interface AchievementSystemProps {
  userId: string;
  onProgressUpdate: (progress: UserProgress) => void;
  onAchievementUnlock: (notification: AchievementNotification) => void;
}

export default function AchievementSystem({ userId, onProgressUpdate, onAchievementUnlock }: AchievementSystemProps) {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [notifications, setNotifications] = useState<AchievementNotification[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    initializeAchievementSystem();
  }, [userId]);

  const initializeAchievementSystem = () => {
    // Initialize achievements with progress
    const initializedAchievements = ACHIEVEMENT_DEFINITIONS.map(def => ({
      ...def,
      progress: {
        current: 0,
        total: def.requirements[0]?.target || 1,
        percentage: 0,
        isCompleted: false,
        lastUpdated: new Date()
      }
    }));

    // Initialize milestones
    const initializedMilestones = MILESTONE_DEFINITIONS.map(def => ({
      ...def,
      currentValue: 0,
      isCompleted: false
    }));

    // Create initial user progress
    const initialProgress: UserProgress = {
      userId,
      level: 1,
      experience: 0,
      nextLevelExp: 1000,
      totalStudyTime: 0,
      streakDays: 0,
      longestStreak: 0,
      lastActiveDate: new Date(),
      achievements: initializedAchievements,
      unlockedAchievements: [],
      stats: {
        vocabulary: { totalLearned: 0, mastered: 0, averageAccuracy: 0 },
        grammar: { pointsStudied: 0, exercisesCompleted: 0, averageScore: 0 },
        pronunciation: { sessionsCompleted: 0, averageScore: 0, improvements: 0 },
        listening: { hoursListened: 0, comprehensionScore: 0, genresExplored: [] },
        speaking: { sessionsCompleted: 0, averageFluency: 0, confidenceLevel: 0 },
        reading: { pagesRead: 0, speed: 0, comprehensionRate: 0 },
        writing: { exercisesCompleted: 0, averageScore: 0, creativityRating: 0 },
        quizzes: { totalCompleted: 0, averageScore: 0, perfectScores: 0 },
        drama: { sentencesPracticed: 0, clipsWatched: 0, genresExplored: [] },
        habits: { completed: 0, consistency: 0, automaticity: 0 }
      },
      milestones: initializedMilestones,
      badges: [],
      leaderboard: []
    };

    setAchievements(initializedAchievements);
    setMilestones(initializedMilestones);
    setUserProgress(initialProgress);
  };

  const trackProgress = (event: ProgressEvent) => {
    if (!userProgress) return;

    // Update user stats
    const updatedStats = updateStats(userProgress.stats, event);

    // Update achievements
    const updatedAchievements = updateAchievements(achievements, event);

    // Update milestones
    const updatedMilestones = updateMilestones(milestones, event);

    // Check for newly unlocked achievements
    const newUnlocks = checkForNewUnlocks(achievements, updatedAchievements);

    // Update experience and level
    const { newExperience, newLevel, didLevelUp } = updateExperience(userProgress, event);

    // Create updated progress
    const updatedProgress: UserProgress = {
      ...userProgress,
      streakDays: event.type === 'streak_days' ? event.value : userProgress.streakDays,
      longestStreak: event.type === 'streak_days' ? Math.max(userProgress.longestStreak, event.value) : userProgress.longestStreak,
      totalStudyTime: event.type === 'study_time' ? userProgress.totalStudyTime + event.value : userProgress.totalStudyTime,
      experience: newExperience,
      level: newLevel,
      stats: updatedStats,
      achievements: updatedAchievements,
      milestones: updatedMilestones,
      unlockedAchievements: [
        ...userProgress.unlockedAchievements,
        ...newUnlocks.map(a => a.id)
      ]
    };

    setUserProgress(updatedProgress);
    onProgressUpdate(updatedProgress);

    // Send notifications for new achievements
    newUnlocks.forEach(achievement => {
      const notification: AchievementNotification = {
        achievement,
        isNew: true
      };
      setNotifications(prev => [...prev, notification]);
      onAchievementUnlock(notification);
    });

    // Send level up notification
    if (didLevelUp) {
      const levelUpNotification: AchievementNotification = {
        achievement: {
          id: `level_${newLevel}`,
          name: `Level ${newLevel}!`,
          description: `Congratulations on reaching Level ${newLevel}!`,
          icon: '🎉',
          category: 'level',
          rarity: 'common',
          points: newLevel * 100,
          requirements: [],
          progress: { current: newLevel, total: newLevel, percentage: 100, isCompleted: true, lastUpdated: new Date() },
          isHidden: false,
          celebrationType: 'confetti'
        },
        isNew: true
      };
      setNotifications(prev => [...prev, levelUpNotification]);
      onAchievementUnlock(levelUpNotification);
    }
  };

  const updateStats = (stats: UserProgress['stats'], event: ProgressEvent): UserProgress['stats'] => {
    const updatedStats = { ...stats };

    switch (event.type) {
      case 'vocabulary_learned':
        updatedStats.vocabulary.totalLearned += event.value;
        break;
      case 'grammar_mastered':
        updatedStats.grammar.pointsStudied += event.value;
        break;
      case 'pronunciation_score':
        updatedStats.pronunciation.sessionsCompleted += 1;
        updatedStats.pronunciation.averageScore =
          (updatedStats.pronunciation.averageScore + event.value) / 2;
        break;
      case 'listening_hours':
        updatedStats.listening.hoursListened += event.value;
        break;
      case 'speaking_sessions':
        updatedStats.speaking.sessionsCompleted += event.value;
        break;
      case 'reading_pages':
        updatedStats.reading.pagesRead += event.value;
        break;
      case 'writing_exercises':
        updatedStats.writing.exercisesCompleted += event.value;
        break;
      case 'quiz_score':
        updatedStats.quizzes.totalCompleted += 1;
        updatedStats.quizzes.averageScore =
          (updatedStats.quizzes.averageScore + event.value) / 2;
        if (event.value === 100) {
          updatedStats.quizzes.perfectScores += 1;
        }
        break;
      case 'drama_sentences':
        updatedStats.drama.sentencesPracticed += event.value;
        break;
      case 'habits_completed':
        updatedStats.habits.completed += event.value;
        break;
    }

    return updatedStats;
  };

  const updateAchievements = (currentAchievements: Achievement[], event: ProgressEvent): Achievement[] => {
    return currentAchievements.map(achievement => {
      const relevantRequirement = achievement.requirements.find(req => req.type === event.type);

      if (!relevantRequirement) return achievement;

      const newCurrent = Math.min(relevantRequirement.current + event.value, relevantRequirement.target);
      const isCompleted = newCurrent >= relevantRequirement.target;

      // Update requirement
      const updatedRequirements = achievement.requirements.map(req =>
        req.type === event.type
          ? { ...req, current: newCurrent }
          : req
      );

      // Calculate overall progress
      const totalProgress = updatedRequirements.reduce((sum, req) =>
        sum + (req.current / req.target), 0
      ) / updatedRequirements.length;

      return {
        ...achievement,
        requirements: updatedRequirements,
        progress: {
          current: newCurrent,
          total: relevantRequirement.target,
          percentage: Math.round(totalProgress * 100),
          isCompleted,
          lastUpdated: new Date()
        },
        unlockedAt: isCompleted && !achievement.unlockedAt ? new Date() : achievement.unlockedAt
      };
    });
  };

  const updateMilestones = (currentMilestones: Milestone[], event: ProgressEvent): Milestone[] => {
    return currentMilestones.map(milestone => {
      // Map event types to milestone categories
      const categoryMap: Record<string, string> = {
        'vocabulary_learned': 'vocabulary',
        'streak_days': 'streak',
        'study_time': 'time'
      };

      if (categoryMap[event.type] !== milestone.category) return milestone;

      const newValue = Math.min(milestone.currentValue + event.value, milestone.targetValue);
      const isCompleted = newValue >= milestone.targetValue;

      return {
        ...milestone,
        currentValue: newValue,
        isCompleted,
        completedAt: isCompleted && !milestone.completedAt ? new Date() : milestone.completedAt
      };
    });
  };

  const checkForNewUnlocks = (oldAchievements: Achievement[], newAchievements: Achievement[]): Achievement[] => {
    return newAchievements.filter(newAchievement => {
      const oldAchievement = oldAchievements.find(old => old.id === newAchievement.id);
      return newAchievement.progress.isCompleted && (!oldAchievement || !oldAchievement.progress.isCompleted);
    });
  };

  const updateExperience = (progress: UserProgress, event: ProgressEvent): {
    newExperience: number;
    newLevel: number;
    didLevelUp: boolean;
  } => {
    let experienceGain = 0;

    // Calculate experience based on event type and value
    switch (event.type) {
      case 'vocabulary_learned':
        experienceGain = event.value * 10;
        break;
      case 'quiz_score':
        experienceGain = Math.round(event.value * 2);
        break;
      case 'streak_days':
        experienceGain = event.value * 50;
        break;
      case 'study_time':
        experienceGain = Math.round(event.value / 60); // 1 XP per minute
        break;
      default:
        experienceGain = event.value * 5;
    }

    const newExperience = progress.experience + experienceGain;
    const newLevel = Math.floor(newExperience / 1000) + 1;
    const didLevelUp = newLevel > progress.level;

    return { newExperience, newLevel, didLevelUp };
  };

  const getFilteredAchievements = () => {
    if (selectedCategory === 'all') return achievements;
    return achievements.filter(a => a.category === selectedCategory);
  };

  const getAchievementStats = () => {
    const total = achievements.length;
    const unlocked = achievements.filter(a => a.progress.isCompleted).length;
    const inProgress = total - unlocked;
    const totalPoints = achievements.filter(a => a.progress.isCompleted).reduce((sum, a) => sum + a.points, 0);

    return { total, unlocked, inProgress, totalPoints };
  };

  const getRarityColor = (rarity: Achievement['rarity']): string => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'uncommon': return 'text-green-600 bg-green-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!userProgress) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse">
          <div className="w-16 h-16 border-4 border-[var(--background)] border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  const stats = getAchievementStats();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">🏆 Achievements & Progress</h2>
        <p className="text-gray-600">Track your learning journey and unlock achievements</p>
      </div>

      {/* User Progress Overview */}
      <div className="bg-gradient-to-r from-[var(--background)] to-[var(--lightblue)] text-white p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">Level {userProgress.level}</p>
            <p className="text-sm opacity-90">Current Level</p>
            <div className="mt-2">
              <div className="w-full bg-white/30 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full"
                  style={{ width: `${(userProgress.experience % 1000) / 10}%` }}
                ></div>
              </div>
              <p className="text-xs mt-1 opacity-80">
                {userProgress.experience % 1000} / 1000 XP
              </p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{stats.unlocked}</p>
            <p className="text-sm opacity-90">Achievements</p>
            <p className="text-xs mt-1 opacity-80">{stats.inProgress} in progress</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{stats.totalPoints}</p>
            <p className="text-sm opacity-90">Total Points</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{userProgress.streakDays}</p>
            <p className="text-sm opacity-90">Day Streak</p>
            <p className="text-xs mt-1 opacity-80">Longest: {userProgress.longestStreak}</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === 'all'
                ? 'bg-[var(--background)] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            All ({stats.total})
          </button>

          {['vocabulary', 'grammar', 'pronunciation', 'streak', 'time', 'level', 'drama'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${selectedCategory === category
                  ? 'bg-[var(--background)] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category} ({achievements.filter(a => a.category === category).length})
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getFilteredAchievements().map(achievement => (
          <div
            key={achievement.id}
            className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${achievement.progress.isCompleted
                ? 'ring-2 ring-yellow-400 ring-offset-2'
                : 'hover:shadow-xl'
              }`}
          >
            <div className={`p-4 ${achievement.progress.isCompleted ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{achievement.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{achievement.name}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    {achievement.progress.current} / {achievement.progress.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${achievement.progress.isCompleted
                        ? 'bg-green-500'
                        : 'bg-[var(--background)]'
                      }`}
                    style={{ width: `${achievement.progress.percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-1">
                {achievement.requirements.map((req, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-gray-600">{req.description}</span>
                    <span className={`font-medium ${req.current >= req.target ? 'text-green-600' : 'text-gray-800'
                      }`}>
                      {req.current} / {req.target}
                    </span>
                  </div>
                ))}
              </div>

              {/* Rewards */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Reward</span>
                  <span className="bg-[var(--lemon)] text-black px-2 py-1 rounded-full text-xs font-semibold">
                    +{achievement.points} pts
                  </span>
                </div>
              </div>

              {/* Unlocked Date */}
              {achievement.progress.isCompleted && achievement.unlockedAt && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-green-600 text-center">
                    🎉 Unlocked on {achievement.unlockedAt.toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">🔔 Recent Unlocks</h3>
          <div className="space-y-3">
            {notifications.slice(-5).reverse().map((notification, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-[var(--lemon)] to-[var(--lightbeige)] rounded-lg">
                <span className="text-2xl">{notification.achievement.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold">{notification.achievement.name}</p>
                  <p className="text-sm text-gray-600">{notification.achievement.description}</p>
                </div>
                <span className="bg-white text-black px-3 py-1 rounded-full text-sm font-semibold">
                  +{notification.achievement.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones Progress */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">🎯 Milestones</h3>
        <div className="space-y-4">
          {milestones.map(milestone => (
            <div key={milestone.id} className="border-l-4 border-[var(--background)] pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{milestone.title}</h4>
                  <p className="text-sm text-gray-600">{milestone.description}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        {milestone.currentValue} / {milestone.targetValue}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${milestone.isCompleted
                            ? 'bg-green-500'
                            : 'bg-[var(--background)]'
                          }`}
                        style={{ width: `${Math.min((milestone.currentValue / milestone.targetValue) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {milestone.isCompleted && (
                    <span className="text-green-500 text-sm">✓ Completed</span>
                  )}
                  <div className="mt-2 space-y-1">
                    {milestone.rewards.map((reward, index) => (
                      <p key={index} className="text-xs text-gray-600">
                        🎁 {reward.description}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}