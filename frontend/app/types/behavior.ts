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