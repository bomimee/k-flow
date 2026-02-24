// BJ Fogg Behavior Model types - this should be in its own file
export interface Behavior {
  id: string;
  name: string;
  description: string;
  motivation: number; // 0-10 scale
  ability: number; // 0-10 scale (how easy it is)
  prompt: Prompt;
  category: BehaviorCategory;
  rewards: Reward[];
  streak: number;
  lastCompleted?: Date;
  frequency: Frequency;
}

export interface Prompt {
  type: 'time' | 'context' | 'action' | 'notification';
  trigger: string;
  cue: string;
  isEnabled: boolean;
}

export interface Reward {
  type: 'intrinsic' | 'extrinsic';
  description: string;
  points: number;
  isImmediate: boolean;
}

export type BehaviorCategory =
  | 'vocabulary'
  | 'grammar'
  | 'pronunciation'
  | 'listening'
  | 'speaking'
  | 'reading'
  | 'writing'
  | 'review'
  | 'practice';

export type Frequency =
  | 'daily'
  | 'weekly'
  | 'twice-weekly'
  | 'custom';

export interface HabitFormation {
  behaviors: Behavior[];
  currentStreak: number;
  longestStreak: number;
  totalBehaviorsCompleted: number;
  completionRate: number;
  motivationLevel: number;
  lastActiveDate: Date;
}

export interface BehaviorDesign {
  targetBehavior: string;
  motivationFactors: MotivationFactor[];
  abilityFactors: AbilityFactor[];
  promptStrategy: PromptStrategy;
  rewardSystem: RewardSystem;
}

export interface MotivationFactor {
  type: 'hope' | 'social' | 'achievement' | 'mastery' | 'purpose';
  description: string;
  strength: number; // 0-10
  isEnabled: boolean;
}

export interface AbilityFactor {
  type: 'time' | 'money' | 'physical' | 'cognitive' | 'social';
  barrier: string;
  solution: string;
  isAddressed: boolean;
}

export interface PromptStrategy {
  anchorAction: string;
  timing: string;
  location: string;
  context: string;
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  enabled: boolean;
  times: string[];
  channels: ('push' | 'email' | 'sms')[];
  tone: 'encouraging' | 'neutral' | 'urgent';
}

export interface RewardSystem {
  immediateRewards: Reward[];
  delayedRewards: Reward[];
  intrinsicRewards: Reward[];
  extrinsicRewards: Reward[];
  celebrationTriggers: CelebrationTrigger[];
}

export interface CelebrationTrigger {
  condition: string;
  celebrationType: 'animation' | 'sound' | 'message' | 'badge';
  content: string;
}

export interface MicroHabit {
  id: string;
  name: string;
  duration: number; // seconds
  difficulty: 'tiny' | 'small' | 'medium';
  behaviorId: string;
  isCompleted: boolean;
  completedAt?: Date;
}