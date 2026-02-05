// K-drama learning system types
export interface DramaSentence {
  id: string;
  korean: string;
  english: string;
  pronunciation: string;
  videoId: string;
  startTime: number; // seconds
  endTime: number; // seconds
  difficulty: 'easy' | 'medium' | 'hard';
  level: number; // TTMIK level
  context: string;
  characters: string[];
  dramaTitle: string;
  episode: string;
  genre: string;
  culturalNotes?: string;
  vocabulary: DramaVocabulary[];
  grammar: DramaGrammar[];
}

export interface DramaVocabulary {
  word: string;
  meaning: string;
  hanja?: string;
  position: {
    start: number;
    end: number;
  };
}

export interface DramaGrammar {
  pattern: string;
  explanation: string;
  position: {
    start: number;
    end: number;
  };
}

export interface VideoClip {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  duration: number;
  sentences: DramaSentence[];
  level: number;
  genre: string;
  popularity: number;
}

export interface SubtitleMode {
  mode: 'korean' | 'english' | 'both' | 'none';
  showRomanization: boolean;
  showPronunciation: boolean;
}

export interface MemorizationSession {
  id: string;
  clips: VideoClip[];
  currentClipIndex: number;
  currentSentenceIndex: number;
  mode: 'watch' | 'practice' | 'test';
  subtitleMode: SubtitleMode;
  startTime: Date;
  progress: SessionProgress;
  userRecordings: UserRecording[];
}

export interface SessionProgress {
  sentencesWatched: number;
  sentencesPracticed: number;
  sentencesMastered: number;
  averageAccuracy: number;
  timeSpent: number;
}

export interface UserRecording {
  sentenceId: string;
  audioBlob: Blob;
  accuracy: number;
  pronunciation: PronunciationAnalysis;
  timestamp: Date;
}

export interface PronunciationAnalysis {
  overallScore: number;
  phonemeScores: PhonemeScore[];
  feedback: string[];
  improvements: string[];
}

export interface PhonemeScore {
  phoneme: string;
  score: number;
  target: string;
  actual: string;
}

export interface MimickingExercise {
  id: string;
  sentence: DramaSentence;
  steps: MimickingStep[];
  currentStep: number;
  completed: boolean;
  score: number;
}

export interface MimickingStep {
  type: 'listen' | 'breakdown' | 'slow' | 'practice' | 'record';
  title: string;
  instruction: string;
  completed: boolean;
  audioUrl?: string;
}

export interface DramaLearningStats {
  totalSentences: number;
  masteredSentences: number;
  averageAccuracy: number;
  favoriteGenres: string[];
  timeSpent: number;
  streakDays: number;
  level: number;
}

// Drama genres and categories
export type DramaGenre = 
  | 'romance'
  | 'comedy'
  | 'action'
  | 'thriller'
  | 'historical'
  | 'family'
  | 'workplace'
  | 'school'
  | 'fantasy'
  | 'medical'
  | 'legal';

// Learning modes
export type LearningMode = 'immersion' | 'structured' | 'casual' | 'intensive';

export interface LearningConfig {
  mode: LearningMode;
  genres: DramaGenre[];
  levelRange: [number, number];
  dailyGoal: number; // sentences per day
  subtitleMode: SubtitleMode;
  enableRecording: boolean;
  enablePronunciationFeedback: boolean;
}