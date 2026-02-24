import type {
  Behavior,
  BehaviorCategory,
  Frequency,
  Prompt,
  Reward,
  HabitFormation,
  BehaviorDesign,
  MicroHabit
} from '@/app/types/behavior';

// Fogg Behavior Model calculations
export class BehaviorModel {
  /**
   * Calculate B = M × A × P (Behavior = Motivation × Ability × Prompt)
   */
  static calculateBehaviorScore(motivation: number, ability: number, prompt: number): number {
    return (motivation * ability * prompt) / 100; // Normalize to 0-10 scale
  }

  /**
   * Determine if behavior will occur
   */
  static willBehaviorOccur(motivation: number, ability: number, prompt: number): boolean {
    const score = this.calculateBehaviorScore(motivation, ability, prompt);
    return score >= 3.0; // Threshold for behavior to occur
  }

  /**
   * Get ability improvement suggestions
   */
  static getAbilityImprovements(ability: number): string[] {
    const suggestions: string[] = [];

    if (ability < 3) {
      suggestions.push('Make the behavior much easier - break it down into tiny steps');
      suggestions.push('Reduce the time required to less than 2 minutes');
      suggestions.push('Remove as many barriers as possible');
    } else if (ability < 6) {
      suggestions.push('Simplify the behavior further');
      suggestions.push('Provide better tools or resources');
      suggestions.push('Offer step-by-step guidance');
    } else {
      suggestions.push('The behavior is sufficiently easy to perform');
    }

    return suggestions;
  }

  /**
   * Get motivation enhancement suggestions
   */
  static getMotivationEnhancements(motivation: number): string[] {
    const suggestions: string[] = [];

    if (motivation < 3) {
      suggestions.push('Connect the behavior to deeper values and purpose');
      suggestions.push('Add social accountability features');
      suggestions.push('Create immediate rewards and celebrations');
    } else if (motivation < 6) {
      suggestions.push('Highlight progress and achievements');
      suggestions.push('Add gamification elements');
      suggestions.push('Provide positive feedback and encouragement');
    } else {
      suggestions.push('Maintain current motivation levels');
    }

    return suggestions;
  }

  /**
   * Design effective prompts
   */
  static designPrompts(behavior: Behavior): Prompt[] {
    const prompts: Prompt[] = [];

    // Time-based prompt
    prompts.push({
      type: 'time',
      trigger: 'specific time of day',
      cue: `It's time to practice ${behavior.name}!`,
      isEnabled: true
    });

    // Context-based prompt
    prompts.push({
      type: 'context',
      trigger: 'location or situation',
      cue: `You're in the perfect place to work on ${behavior.name}`,
      isEnabled: true
    });

    // Action-based prompt
    prompts.push({
      type: 'action',
      trigger: 'after completing another action',
      cue: `Great job finishing that! Now let's ${behavior.name}`,
      isEnabled: true
    });

    return prompts;
  }

  /**
   * Create micro-habits for behavior chaining
   */
  static createMicroHabits(behavior: Behavior): MicroHabit[] {
    const microHabits: MicroHabit[] = [];

    // Break down into tiny habits
    const steps = this.getBehaviorSteps(behavior.category);

    steps.forEach((step, index) => {
      microHabits.push({
        id: `${behavior.id}-micro-${index}`,
        name: step,
        duration: 30 + (index * 15), // Progressive duration
        difficulty: index === 0 ? 'tiny' : index < 3 ? 'small' : 'medium',
        behaviorId: behavior.id,
        isCompleted: false
      });
    });

    return microHabits;
  }

  /**
   * Get behavior steps based on category
   */
  private static getBehaviorSteps(category: BehaviorCategory): string[] {
    const stepMap: Record<BehaviorCategory, string[]> = {
      vocabulary: [
        'Review 5 flashcards',
        'Learn 1 new word',
        'Use 1 word in a sentence',
        'Practice pronunciation'
      ],
      grammar: [
        'Read 1 grammar rule',
        'Complete 1 practice exercise',
        'Create 1 example sentence',
        'Apply rule in context'
      ],
      pronunciation: [
        'Listen to native speaker',
        'Practice 1 sound',
        'Record yourself',
        'Compare and improve'
      ],
      listening: [
        'Watch 1 minute video',
        'Transcribe 1 sentence',
        'Check understanding',
        'Review vocabulary'
      ],
      speaking: [
        'Read 1 sentence aloud',
        'Answer 1 question',
        'Practice conversation',
        'Record and review'
      ],
      reading: [
        'Read 1 paragraph',
        'Look up 1 unknown word',
        'Summarize content',
        'Practice comprehension'
      ],
      writing: [
        'Write 1 sentence',
        'Use target vocabulary',
        'Apply grammar rule',
        'Review and correct'
      ],
      review: [
        'Check due items',
        'Review 1 concept',
        'Complete 1 exercise',
        'Update progress'
      ],
      practice: [
        'Warm up (2 min)',
        'Main practice (5 min)',
        'Cool down (1 min)',
        'Reflect on learning'
      ]
    };

    return stepMap[category] || ['Practice for 1 minute'];
  }

  /**
   * Calculate habit formation progress
   */
  static calculateHabitFormation(behaviors: Behavior[]): {
    formationScore: number;
    consistencyScore: number;
    automaticityScore: number;
    recommendations: string[];
  } {
    const completedBehaviors = behaviors.filter(b => b.lastCompleted);
    const totalBehaviors = behaviors.length;

    // Formation score based on completion rate and consistency
    const completionRate = completedBehaviors.length / totalBehaviors;
    const avgStreak = behaviors.reduce((sum, b) => sum + b.streak, 0) / totalBehaviors;
    const formationScore = (completionRate * 0.6) + (avgStreak * 0.04); // Normalize streak

    // Consistency based on regular completion
    const consistencyScore = this.calculateConsistency(completedBehaviors);

    // Automaticity based on streak length and reduced effort
    const automaticityScore = Math.min(avgStreak / 21, 1.0); // 21 days for habit formation

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      formationScore,
      consistencyScore,
      automaticityScore
    );

    return {
      formationScore: Math.round(formationScore * 100),
      consistencyScore: Math.round(consistencyScore * 100),
      automaticityScore: Math.round(automaticityScore * 100),
      recommendations
    };
  }

  /**
   * Calculate consistency score
   */
  private static calculateConsistency(completedBehaviors: Behavior[]): number {
    if (completedBehaviors.length === 0) return 0;

    // Check how many behaviors were completed in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCompletions = completedBehaviors.filter(
      b => b.lastCompleted && b.lastCompleted > sevenDaysAgo
    );

    return recentCompletions.length / completedBehaviors.length;
  }

  /**
   * Generate recommendations based on scores
   */
  private static generateRecommendations(
    formation: number,
    consistency: number,
    automaticity: number
  ): string[] {
    const recommendations: string[] = [];

    if (formation < 0.5) {
      recommendations.push('Focus on completing behaviors more consistently');
      recommendations.push('Break down difficult behaviors into smaller steps');
    }

    if (consistency < 0.6) {
      recommendations.push('Set up better reminders and prompts');
      recommendations.push('Choose specific times and locations for practice');
    }

    if (automaticity < 0.4) {
      recommendations.push('Continue practicing to build automaticity');
      recommendations.push('Focus on making the behavior easier and more natural');
    }

    if (formation > 0.7 && consistency > 0.7) {
      recommendations.push('Great progress! Consider adding new behaviors');
      recommendations.push('Help others by sharing your success strategies');
    }

    return recommendations;
  }
}