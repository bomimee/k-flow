// Achievement and progress tracking system
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  points: number;
  requirements: AchievementRequirement[];
  progress: AchievementProgress;
  unlockedAt?: Date;
  isHidden: boolean;
  celebrationType: CelebrationType;
}

export interface AchievementRequirement {
  type: RequirementType;
  target: number;
  current: number;
  description: string;
}

export interface AchievementProgress {
  current: number;
  total: number;
  percentage: number;
  isCompleted: boolean;
  lastUpdated: Date;
}

export type AchievementCategory = 
  | 'vocabulary'
  | 'grammar'
  | 'pronunciation'
  | 'listening'
  | 'speaking'
  | 'reading'
  | 'writing'
  | 'streak'
  | 'time'
  | 'level'
  | 'social'
  | 'milestone';

export type AchievementRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

export type RequirementType = 
  | 'vocabulary_learned'
  | 'grammar_mastered'
  | 'pronunciation_score'
  | 'listening_hours'
  | 'speaking_sessions'
  | 'reading_pages'
  | 'writing_exercises'
  | 'streak_days'
  | 'study_time'
  | 'level_reached'
  | 'quiz_score'
  | 'perfect_quizzes'
  | 'drama_sentences'
  | 'habits_completed';

export type CelebrationType = 
  | 'simple'
  | 'confetti'
  | 'fireworks'
  | 'animation'
  | 'sound'
  | 'screen';

export interface UserProgress {
  userId: string;
  level: number;
  experience: number;
  nextLevelExp: number;
  totalStudyTime: number;
  streakDays: number;
  longestStreak: number;
  lastActiveDate: Date;
  achievements: Achievement[];
  unlockedAchievements: string[];
  stats: UserStats;
  milestones: Milestone[];
  badges: Badge[];
  leaderboard: LeaderboardEntry[];
}

export interface UserStats {
  vocabulary: {
    totalLearned: number;
    mastered: number;
    averageAccuracy: number;
  };
  grammar: {
    pointsStudied: number;
    exercisesCompleted: number;
    averageScore: number;
  };
  pronunciation: {
    sessionsCompleted: number;
    averageScore: number;
    improvements: number;
  };
  listening: {
    hoursListened: number;
    comprehensionScore: number;
    genresExplored: string[];
  };
  speaking: {
    sessionsCompleted: number;
    averageFluency: number;
    confidenceLevel: number;
  };
  reading: {
    pagesRead: number;
    speed: number; // words per minute
    comprehensionRate: number;
  };
  writing: {
    exercisesCompleted: number;
    averageScore: number;
    creativityRating: number;
  };
  quizzes: {
    totalCompleted: number;
    averageScore: number;
    perfectScores: number;
  };
  drama: {
    sentencesPracticed: number;
    clipsWatched: number;
    genresExplored: string[];
  };
  habits: {
    completed: number;
    consistency: number;
    automaticity: number;
  };
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  category: AchievementCategory;
  isCompleted: boolean;
  completedAt?: Date;
  rewards: MilestoneReward[];
}

export interface MilestoneReward {
  type: 'experience' | 'badge' | 'achievement' | 'unlock';
  value: string | number;
  description: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: AchievementCategory;
  earnedAt: Date;
  isDisplayed: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  rank: number;
  score: number;
  category: AchievementCategory;
  change: number; // rank change from last week
}

export interface ProgressEvent {
  type: RequirementType;
  value: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AchievementNotification {
  achievement: Achievement;
  isNew: boolean;
  progressUpdate?: AchievementProgress;
}

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'progress' | 'unlockedAt'>[] = [
  // Vocabulary Achievements
  {
    id: 'vocab_10',
    name: 'Word Collector',
    description: 'Learn your first 10 vocabulary words',
    icon: '📚',
    category: 'vocabulary',
    rarity: 'common',
    points: 50,
    requirements: [
      { type: 'vocabulary_learned', target: 10, current: 0, description: 'Learn 10 words' }
    ],
    isHidden: false,
    celebrationType: 'simple'
  },
  {
    id: 'vocab_100',
    name: 'Vocabulary Master',
    description: 'Learn 100 vocabulary words',
    icon: '🎓',
    category: 'vocabulary',
    rarity: 'uncommon',
    points: 200,
    requirements: [
      { type: 'vocabulary_learned', target: 100, current: 0, description: 'Learn 100 words' }
    ],
    isHidden: false,
    celebrationType: 'confetti'
  },
  {
    id: 'vocab_1000',
    name: 'Lexicon Legend',
    description: 'Learn 1000 vocabulary words',
    icon: '👑',
    category: 'vocabulary',
    rarity: 'epic',
    points: 1000,
    requirements: [
      { type: 'vocabulary_learned', target: 1000, current: 0, description: 'Learn 1000 words' }
    ],
    isHidden: false,
    celebrationType: 'fireworks'
  },

  // Streak Achievements
  {
    id: 'streak_3',
    name: 'Three Day Streak',
    description: 'Maintain a 3-day study streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    points: 100,
    requirements: [
      { type: 'streak_days', target: 3, current: 0, description: '3-day streak' }
    ],
    isHidden: false,
    celebrationType: 'simple'
  },
  {
    id: 'streak_30',
    name: 'Monthly Champion',
    description: 'Maintain a 30-day study streak',
    icon: '🏆',
    category: 'streak',
    rarity: 'rare',
    points: 500,
    requirements: [
      { type: 'streak_days', target: 30, current: 0, description: '30-day streak' }
    ],
    isHidden: false,
    celebrationType: 'confetti'
  },
  {
    id: 'streak_100',
    name: 'Century Streak',
    description: 'Maintain a 100-day study streak',
    icon: '💎',
    category: 'streak',
    rarity: 'legendary',
    points: 2000,
    requirements: [
      { type: 'streak_days', target: 100, current: 0, description: '100-day streak' }
    ],
    isHidden: false,
    celebrationType: 'fireworks'
  },

  // Time Achievements
  {
    id: 'time_10',
    name: 'Dedicated Learner',
    description: 'Study for 10 hours total',
    icon: '⏰',
    category: 'time',
    rarity: 'common',
    points: 100,
    requirements: [
      { type: 'study_time', target: 36000, current: 0, description: '10 hours of study' } // 10 hours in seconds
    ],
    isHidden: false,
    celebrationType: 'simple'
  },
  {
    id: 'time_100',
    name: 'Time Master',
    description: 'Study for 100 hours total',
    icon: '⌚',
    category: 'time',
    rarity: 'rare',
    points: 500,
    requirements: [
      { type: 'study_time', target: 360000, current: 0, description: '100 hours of study' }
    ],
    isHidden: false,
    celebrationType: 'confetti'
  },

  // Level Achievements
  {
    id: 'level_5',
    name: 'Intermediate Learner',
    description: 'Reach TTMIK Level 5',
    icon: '📈',
    category: 'level',
    rarity: 'uncommon',
    points: 300,
    requirements: [
      { type: 'level_reached', target: 5, current: 0, description: 'Reach Level 5' }
    ],
    isHidden: false,
    celebrationType: 'confetti'
  },
  {
    id: 'level_10',
    name: 'Korean Master',
    description: 'Reach TTMIK Level 10',
    icon: '🌟',
    category: 'level',
    rarity: 'legendary',
    points: 2000,
    requirements: [
      { type: 'level_reached', target: 10, current: 0, description: 'Reach Level 10' }
    ],
    isHidden: false,
    celebrationType: 'fireworks'
  },

  // Perfect Quiz Achievements
  {
    id: 'perfect_5',
    name: 'Perfect Start',
    description: 'Score 100% on 5 quizzes',
    icon: '💯',
    category: 'milestone',
    rarity: 'uncommon',
    points: 200,
    requirements: [
      { type: 'perfect_quizzes', target: 5, current: 0, description: '5 perfect quizzes' }
    ],
    isHidden: false,
    celebrationType: 'simple'
  },
  {
    id: 'perfect_25',
    name: 'Perfectionist',
    description: 'Score 100% on 25 quizzes',
    icon: '🎯',
    category: 'milestone',
    rarity: 'rare',
    points: 800,
    requirements: [
      { type: 'perfect_quizzes', target: 25, current: 0, description: '25 perfect quizzes' }
    ],
    isHidden: false,
    celebrationType: 'confetti'
  },

  // Drama Practice Achievements
  {
    id: 'drama_50',
    name: 'Drama Enthusiast',
    description: 'Practice 50 sentences from K-dramas',
    icon: '🎬',
    category: 'drama',
    rarity: 'uncommon',
    points: 250,
    requirements: [
      { type: 'drama_sentences', target: 50, current: 0, description: '50 drama sentences' }
    ],
    isHidden: false,
    celebrationType: 'simple'
  },
  {
    id: 'drama_200',
    name: 'Drama Expert',
    description: 'Practice 200 sentences from K-dramas',
    icon: '🎭',
    category: 'drama',
    rarity: 'epic',
    points: 1000,
    requirements: [
      { type: 'drama_sentences', target: 200, current: 0, description: '200 drama sentences' }
    ],
    isHidden: false,
    celebrationType: 'fireworks'
  }
];

// Milestone definitions
export const MILESTONE_DEFINITIONS: Omit<Milestone, 'currentValue' | 'isCompleted' | 'completedAt'>[] = [
  {
    id: 'vocab_milestone_25',
    title: 'Vocabulary Foundation',
    description: 'Learn 25 vocabulary words',
    targetValue: 25,
    category: 'vocabulary',
    rewards: [
      { type: 'experience', value: 100, description: '100 XP' },
      { type: 'badge', value: 'vocab_foundation', description: 'Foundation Badge' }
    ]
  },
  {
    id: 'vocab_milestone_50',
    title: 'Vocabulary Builder',
    description: 'Learn 50 vocabulary words',
    targetValue: 50,
    category: 'vocabulary',
    rewards: [
      { type: 'experience', value: 200, description: '200 XP' },
      { type: 'badge', value: 'vocab_builder', description: 'Builder Badge' }
    ]
  },
  {
    id: 'streak_milestone_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    targetValue: 7,
    category: 'streak',
    rewards: [
      { type: 'experience', value: 150, description: '150 XP' },
      { type: 'badge', value: 'week_warrior', description: 'Week Warrior Badge' }
    ]
  },
  {
    id: 'time_milestone_5',
    title: 'Time Investor',
    description: 'Study for 5 hours total',
    targetValue: 18000, // 5 hours in seconds
    category: 'time',
    rewards: [
      { type: 'experience', value: 100, description: '100 XP' },
      { type: 'badge', value: 'time_investor', description: 'Time Investor Badge' }
    ]
  }
];