// Vocabulary and quiz system types
export interface VocabularyItem {
  id: string;
  korean: string;
  hanja?: string;
  meaning: string;
  pronunciation: string;
  level: number; // TTMIK level
  exampleSentence: string;
  exampleTranslation: string;
  wordRoot?: string;
  relatedWords: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  srsData: SRSData;
}

export interface SRSData {
  interval: number; // days until next review
  repetitions: number;
  easeFactor: number;
  nextReview: Date;
  lastReview?: Date;
  successRate: number;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'sentence-fill' | 'hanja-match' | 'pronunciation';
  vocabulary: VocabularyItem;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  timeLimit?: number; // seconds
}

export interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  currentQuestion: number;
  score: number;
  totalPoints: number;
  startTime: Date;
  endTime?: Date;
  answers: QuizAnswer[];
  streak: number;
  bestStreak: number;
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // seconds
  points: number;
}

export interface QuizResult {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  totalPoints: number;
  timeSpent: number;
  averageTimePerQuestion: number;
  streak: number;
  bestStreak: number;
  levelUp: boolean;
  newLevel?: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: Date;
  category: 'vocabulary' | 'grammar' | 'pronunciation' | 'streak' | 'speed';
}

export interface UserStats {
  totalVocabularyLearned: number;
  currentLevel: number;
  experience: number;
  nextLevelExp: number;
  streakDays: number;
  longestStreak: number;
  averageAccuracy: number;
  totalTimeSpent: number;
  achievements: Achievement[];
  weeklyProgress: WeeklyProgress[];
}

export interface WeeklyProgress {
  week: string;
  vocabularyLearned: number;
  quizzesCompleted: number;
  averageScore: number;
  timeSpent: number;
}

// Hanja information
export interface HanjaInfo {
  character: string;
  meaning: string;
  pronunciation: string;
  strokeCount: number;
  radical: string;
  examples: {
    korean: string;
    hanja: string;
    meaning: string;
  }[];
}

// Quiz game modes
export type QuizMode = 'learning' | 'review' | 'challenge' | 'time-attack' | 'survival';

export interface QuizModeConfig {
  mode: QuizMode;
  questionCount: number;
  timeLimit?: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  categories: string[];
  levelRange: [number, number];
}