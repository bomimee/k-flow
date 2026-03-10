import type { VocabularyItem } from '@/app/types/vocabulary';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000' || 'http://localhost:8000';

export async function fetchVocabulary(
    level?: number,
    categories?: string[],
    limit: number = 20
): Promise<VocabularyItem[]> {
    try {
        const params = new URLSearchParams();
        if (level) params.append('level', level.toString());
        if (categories && categories.length > 0 && !categories.includes('all')) {
            categories.forEach(cat => params.append('categories', cat));
        }
        params.append('limit', limit.toString());

        const response = await fetch(`${API_BASE_URL}/api/vocabulary?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `failed to fetch vocabulary: ${response.status}`);
        }

        const data = await response.json();
        const mappedData: VocabularyItem[] = data.map((item: any) => ({
            ...item,
            srsData: item.srsData || {
                interval: 1,
                repetitions: 0,
                easeFactor: 2.5,
                nextReview: new Date(),
                successRate: 0
            }
        }));
        return mappedData;
    } catch (error) {
        console.error('❌ fetchVocabulary error:', error);
        throw error;
    }
}

export async function fetchVocabularyLevels(): Promise<number[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/vocabulary/levels`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`failed to fetch levels: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('❌ fetchVocabularyLevels error:', error);
        throw error;
    }
}


export type QuizWordSource = 'db' | 'saved' | 'srs';

export interface MixedQuizWordsResult {
    items: VocabularyItem[];
    saved_count: number;
    db_count: number;
}

/**
 * Fetch mixed quiz words: saved words (if any) blended with DB words.
 * Falls back to DB-only if user has no saved words.
 */
export async function fetchMixedQuizWords(options: {
    userId?: string;
    level?: number;
    categories?: string[];
    limit?: number;
} = {}): Promise<MixedQuizWordsResult> {
    const params = new URLSearchParams();
    if (options.userId) params.append('user_id', options.userId);
    if (options.level) params.append('level', options.level.toString());
    if (options.categories && !options.categories.includes('all')) {
        options.categories.forEach(c => params.append('categories', c));
    }
    if (options.limit) params.append('limit', options.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/vocabulary/quiz-words/mixed?${params.toString()}`);
    if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(err.detail || `fetchMixedQuizWords failed: ${response.status}`);
    }

    const data = await response.json();
    const items = (data.items as any[]).map(item => ({
        ...item,
        srsData: item.srsData ?? {
            interval: 1, repetitions: 0,
            easeFactor: 2.5, nextReview: new Date(), successRate: 0,
        },
    })) as VocabularyItem[];

    return { items, saved_count: data.saved_count, db_count: data.db_count };
}

/** @deprecated Use fetchMixedQuizWords instead */
export async function fetchQuizWords(source: QuizWordSource, options: {
    userId?: string; level?: number; categories?: string[]; limit?: number;
} = {}): Promise<VocabularyItem[]> {
    const result = await fetchMixedQuizWords(options);
    return result.items;
}
