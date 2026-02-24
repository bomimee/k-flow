import type { VocabularyItem } from '@/app/types/vocabulary';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000' || 'http://localhost:8000';

export async function fetchDueItems(userId: string): Promise<VocabularyItem[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/srs/due/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch due items');

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
