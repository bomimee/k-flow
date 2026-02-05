// User level system based on TTMIK 1-10 levels and CEFR standards
export type UserLevel = 'beginner' | 'intermediate' | 'advanced';
export type TTMIKLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface UserLevelInfo {
  ttikLevel: TTMIKLevel;
  category: UserLevel;
  description: string;
  skills: string[];
  estimatedVocabulary: number;
  grammarPoints: string[];
}

export interface CurriculumRoadmap {
  currentLevel: TTMIKLevel;
  targetLevel: TTMIKLevel;
  timeframe: number; // weeks
  weeklyGoals: WeeklyGoal[];
  milestones: Milestone[];
}

export interface WeeklyGoal {
  week: number;
  vocabulary: number;
  grammar: number;
  practice: string[];
  dramaContent: string[];
}

export interface Milestone {
  level: TTMIKLevel;
  title: string;
  description: string;
  requirements: string[];
  rewards: string[];
}

// TTMIK Level definitions
export const TTMIK_LEVELS: Record<TTMIKLevel, UserLevelInfo> = {
  1: {
    ttikLevel: 1,
    category: 'beginner',
    description: 'Basic Korean sentence structure and essential greetings',
    skills: ['Basic pronunciation', 'Simple sentences', 'Essential vocabulary'],
    estimatedVocabulary: 200,
    grammarPoints: ['Subject-Object-Verb', '이/가 particles', '은/는 particles']
  },
  2: {
    ttikLevel: 2,
    category: 'beginner',
    description: 'Present tense and basic conversation skills',
    skills: ['Present tense conjugation', 'Basic questions', 'Everyday conversations'],
    estimatedVocabulary: 400,
    grammarPoints: ['Present tense', 'Questions', 'Negative forms']
  },
  3: {
    ttikLevel: 3,
    category: 'beginner',
    description: 'Past tense and more complex sentence structures',
    skills: ['Past tense', 'Describing events', 'Time expressions'],
    estimatedVocabulary: 600,
    grammarPoints: ['Past tense', 'Time markers', 'Connecting sentences']
  },
  4: {
    ttikLevel: 4,
    category: 'beginner',
    description: 'Future tense and conditional expressions',
    skills: ['Future tense', 'Making plans', 'Conditional statements'],
    estimatedVocabulary: 800,
    grammarPoints: ['Future tense', '(으)면 conditionals', 'Intentions']
  },
  5: {
    ttikLevel: 5,
    category: 'intermediate',
    description: 'Advanced particles and honorifics',
    skills: ['Honorifics', 'Advanced particles', 'Formal speech'],
    estimatedVocabulary: 1200,
    grammarPoints: ['Honorifics', 'Advanced particles', 'Formal speech patterns']
  },
  6: {
    ttikLevel: 6,
    category: 'intermediate',
    description: 'Complex sentence structures and reported speech',
    skills: ['Reported speech', 'Complex sentences', 'Indirect questions'],
    estimatedVocabulary: 1600,
    grammarPoints: ['Reported speech', 'Quotations', 'Indirect speech']
  },
  7: {
    ttikLevel: 7,
    category: 'intermediate',
    description: 'Passive voice and causative verbs',
    skills: ['Passive voice', 'Causative verbs', 'Advanced expressions'],
    estimatedVocabulary: 2000,
    grammarPoints: ['Passive voice', 'Causative verbs', 'Action verbs']
  },
  8: {
    ttikLevel: 8,
    category: 'advanced',
    description: 'Advanced idioms and cultural expressions',
    skills: ['Idioms', 'Cultural expressions', 'Nuanced communication'],
    estimatedVocabulary: 2500,
    grammarPoints: ['Advanced idioms', 'Proverbs', 'Cultural expressions']
  },
  9: {
    ttikLevel: 9,
    category: 'advanced',
    description: 'Professional and academic Korean',
    skills: ['Business Korean', 'Academic writing', 'Formal presentations'],
    estimatedVocabulary: 3000,
    grammarPoints: ['Business vocabulary', 'Academic expressions', 'Formal writing']
  },
  10: {
    ttikLevel: 10,
    category: 'advanced',
    description: 'Native-level fluency and cultural mastery',
    skills: ['Native fluency', 'Cultural mastery', 'Specialized vocabulary'],
    estimatedVocabulary: 4000,
    grammarPoints: ['Advanced nuance', 'Specialized fields', 'Cultural context']
  }
};

// Level progression requirements
export const LEVEL_REQUIREMENTS: Record<TTMIKLevel, string[]> = {
  1: ['Master basic pronunciation', 'Learn 200 essential words', 'Understand SOV structure'],
  2: ['Use present tense fluently', 'Hold basic conversations', 'Learn 400 vocabulary words'],
  3: ['Describe past events', 'Use time expressions correctly', 'Master 600 vocabulary words'],
  4: ['Talk about future plans', 'Use conditionals properly', 'Learn 800 vocabulary words'],
  5: ['Use honorifics appropriately', 'Master advanced particles', 'Learn 1200 vocabulary words'],
  6: ['Use reported speech', 'Form complex sentences', 'Master 1600 vocabulary words'],
  7: ['Use passive/causative verbs', 'Understand advanced grammar', 'Learn 2000 vocabulary words'],
  8: ['Understand common idioms', 'Use cultural expressions', 'Master 2500 vocabulary words'],
  9: ['Use business Korean', 'Write academically', 'Learn 3000 vocabulary words'],
  10: ['Achieve native fluency', 'Master cultural context', 'Learn 4000+ vocabulary words']
};