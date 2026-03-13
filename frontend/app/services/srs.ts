import type { VocabularyItem } from '@/app/types/vocabulary';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000' || 'http://localhost:8000';

export async function fetchDueItems(userId: string): Promise<VocabularyItem[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/srs/due/${userId}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: response.statusText }));
            throw new Error(`Failed to fetch due items: ${errorData.detail || response.statusText}`);
        }

        const data = await response.json();

        // Map backend structure to Frontend VocabularyItem
        return data.map((item: any) => ({
            ...item.vocabulary,
            korean: item.vocabulary.word,
            partOfSpeech: item.vocabulary.part_of_speech,
            exampleSentence: item.vocabulary.example_sentence,
            exampleTranslation: item.vocabulary.example_translation,
            srsData: {
                interval: item.interval,
                repetitions: item.repetitions,
                easeFactor: item.ease_factor,
                nextReview: new Date(item.next_review),
                lastReview: item.last_review ? new Date(item.last_review) : undefined,
                successRate: item.success_rate
            }
        }));
    } catch (error) {
        console.error('Error in fetchDueItems:', error);
        return [];
    }
}

export async function fetchDueGrammarItems(userId: string): Promise<any[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/srs/grammar/due/${userId}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: response.statusText }));
            throw new Error(`Failed to fetch due grammar items: ${errorData.detail || response.statusText}`);
        }

        const data = await response.json();

        // Map backend structure to Frontend grammar item format
        return data.map((item: any) => ({
            ...item.grammar_points,
            srsData: {
                interval: item.interval,
                repetitions: item.repetitions,
                easeFactor: item.ease_factor,
                nextReview: new Date(item.next_review),
                lastReview: item.last_review ? new Date(item.last_review) : undefined,
                successRate: item.success_rate
            }
        }));
    } catch (error) {
        console.error('Error in fetchDueGrammarItems:', error);
        return [];
    }
}

export async function updateSRSProgress(
    userId: string,
    vocabularyId: string,
    srsData: any
): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/srs/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                vocabulary_id: vocabularyId,
                interval: srsData.interval,
                repetitions: srsData.repetitions,
                ease_factor: srsData.easeFactor,
                next_review: srsData.nextReview.toISOString(),
                success_rate: srsData.successRate
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(`Failed to update SRS progress: ${errorData.detail || response.statusText}`);
        }
    } catch (error: any) {
        console.error('❌ SRS Update error:', error.message);
    }
}

export async function updateGrammarSRSProgress(
    userId: string,
    grammarId: string,
    isCorrect: boolean
): Promise<void> {
    try {
        // SM-2 Algorithm approximation for initial learning
        const quality = isCorrect ? 4 : 0;
        const easeFactor = Math.max(1.3, 2.5 + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
        
        let interval = 1; // First review in 1 day
        const repetitions = isCorrect ? 1 : 0;
        
        if (repetitions > 0) {
            interval = isCorrect ? 1 : 0; // simplified for grammar first run
        }

        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);
        const successRate = isCorrect ? 100 : 0;

        const response = await fetch(`${API_BASE_URL}/api/srs/grammar/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                grammar_id: grammarId,
                interval: interval,
                repetitions: repetitions,
                ease_factor: easeFactor,
                next_review: nextReview.toISOString(),
                success_rate: successRate
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(`Failed to update Grammar SRS: ${errorData.detail || response.statusText}`);
        }
    } catch (error: any) {
        console.error('❌ Grammar SRS Update error:', error.message);
    }
}
