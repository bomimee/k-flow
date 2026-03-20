import type { VocabularyItem, SRSData } from '@/app/types/vocabulary';

export class SpacedRepetitionSystem {
  // SM-2 algorithm parameters
  private static readonly MIN_EASE_FACTOR = 1.3;
  private static readonly DEFAULT_EASE_FACTOR = 2.5;
  private static readonly EASE_FACTOR_BONUS = 0.1;
  private static readonly EASE_FACTOR_PENALTY = 0.2;

  /**
   * Calculate next review parameters based on performance
   */
  static calculateNextReview(
    currentSRS: SRSData,
    quality: number // 0-5 scale (0=total blackout, 5=perfect response)
  ): SRSData {
    let { interval, repetitions, easeFactor, successRate } = currentSRS;
    let totalReviews = currentSRS.repetitions;

    // Update ease factor based on quality
    if (quality >= 3) {
      // Correct response
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
      
      // Update ease factor
      easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      
      // Update success rate
      totalReviews += 1;
      successRate = ((successRate * (totalReviews - 1)) + 1) / totalReviews;
    } else {
      // Incorrect response
      repetitions = 0;
      interval = 1;
      
      // Update ease factor
      easeFactor = easeFactor - 0.2;
      
      // Update success rate
      totalReviews += 1;
      successRate = ((successRate * (totalReviews - 1)) + 0) / totalReviews;
    }

    // Ensure ease factor doesn't go below minimum
    easeFactor = Math.max(this.MIN_EASE_FACTOR, easeFactor);

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return {
      interval,
      repetitions,
      easeFactor,
      nextReview,
      lastReview: new Date(),
      successRate
    };
  }

  /**
   * Get items due for review
   */
  static getDueItems(vocabulary: VocabularyItem[]): VocabularyItem[] {
    const now = new Date();
    return vocabulary.filter(item => item.srsData.nextReview <= now);
  }

  /**
   * Get items for new learning (limit to avoid overwhelming)
   */
  static getNewLearningItems(vocabulary: VocabularyItem[], limit: number = 10): VocabularyItem[] {
    return vocabulary
      .filter(item => item.srsData.repetitions === 0)
      .slice(0, limit);
  }

  /**
   * Sort items by priority (due date + difficulty)
   */
  static sortByPriority(items: VocabularyItem[]): VocabularyItem[] {
    const getSafeTime = (d: Date | null | undefined): number => {
      if (!d) return 0;
      const t = d instanceof Date ? d.getTime() : new Date(d).getTime();
      return isNaN(t) ? 0 : t;
    };

    return items.sort((a, b) => {
      // First by due date (earliest first)
      const dueDiff = getSafeTime(a.srsData.nextReview) - getSafeTime(b.srsData.nextReview);
      if (dueDiff !== 0) return dueDiff;

      // Then by success rate (lower success rate first)
      const successDiff = a.srsData.successRate - b.srsData.successRate;
      if (successDiff !== 0) return successDiff;

      // Finally by difficulty (easier first for struggling items)
      const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });
  }

  /**
   * Get study session recommendations
   */
  static getStudySessionRecommendations(
    vocabulary: VocabularyItem[],
    maxItems: number = 20
  ): {
    reviewItems: VocabularyItem[];
    newItems: VocabularyItem[];
    totalItems: number;
    estimatedTime: number; // minutes
  } {
    const dueItems = this.getDueItems(vocabulary);
    const newItems = this.getNewLearningItems(vocabulary, Math.max(1, maxItems - dueItems.length));
    
    // Sort by priority
    const sortedReviewItems = this.sortByPriority(dueItems);
    
    // Limit total items
    const reviewItems = sortedReviewItems.slice(0, Math.max(0, maxItems - newItems.length));
    const totalItems = reviewItems.length + newItems.length;
    
    // Estimate time (30 seconds per review item, 2 minutes per new item)
    const estimatedTime = (reviewItems.length * 0.5) + (newItems.length * 2);

    return {
      reviewItems,
      newItems,
      totalItems,
      estimatedTime
    };
  }

  /**
   * Get learning statistics
   */
  static getLearningStats(vocabulary: VocabularyItem[]): {
    totalItems: number;
    masteredItems: number;
    reviewingItems: number;
    newItems: number;
    averageSuccessRate: number;
    longestInterval: number;
    itemsDueToday: number;
    itemsDueTomorrow: number;
  } {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = {
      totalItems: vocabulary.length,
      masteredItems: vocabulary.filter(item => item.srsData.interval >= 21).length, // 21+ days = mastered
      reviewingItems: vocabulary.filter(item => 
        item.srsData.repetitions > 0 && item.srsData.interval < 21
      ).length,
      newItems: vocabulary.filter(item => item.srsData.repetitions === 0).length,
      averageSuccessRate: vocabulary.reduce((sum, item) => sum + item.srsData.successRate, 0) / vocabulary.length,
      longestInterval: Math.max(...vocabulary.map(item => item.srsData.interval)),
      itemsDueToday: vocabulary.filter(item => item.srsData.nextReview <= now).length,
      itemsDueTomorrow: vocabulary.filter(item => 
        item.srsData.nextReview > now && item.srsData.nextReview <= tomorrow
      ).length
    };

    return stats;
  }

  /**
   * Reset item progress (for when user wants to relearn)
   */
  static resetItemProgress(item: VocabularyItem): VocabularyItem {
    return {
      ...item,
      srsData: {
        interval: 1,
        repetitions: 0,
        easeFactor: this.DEFAULT_EASE_FACTOR,
        nextReview: new Date(),
        successRate: 0
      }
    };
  }

  /**
   * Get quality rating from user performance
   */
  static getQualityRating(
    timeSpent: number, // seconds
    hintsUsed: number,
    isCorrect: boolean
  ): number {
    if (!isCorrect) {
      return hintsUsed === 0 ? 1 : 0; // Total blackout or some recall
    }

    // Base quality on time and hints
    let quality = 3; // Good response baseline

    if (timeSpent < 5 && hintsUsed === 0) {
      quality = 5; // Perfect response
    } else if (timeSpent < 10 && hintsUsed === 0) {
      quality = 4; // Good response
    } else if (timeSpent < 20 && hintsUsed <= 1) {
      quality = 3; // OK response
    } else if (hintsUsed <= 2) {
      quality = 2; // Difficult response
    } else {
      quality = 1; // Some recall
    }

    return quality;
  }

  /**
   * Batch update multiple items
   */
  static batchUpdateItems(
    items: VocabularyItem[],
    performances: Array<{
      itemId: string;
      quality: number;
    }>
  ): VocabularyItem[] {
    const performanceMap = new Map(
      performances.map(p => [p.itemId, p.quality])
    );

    return items.map(item => {
      const quality = performanceMap.get(item.id);
      if (quality !== undefined) {
        return {
          ...item,
          srsData: this.calculateNextReview(item.srsData, quality)
        };
      }
      return item;
    });
  }
}