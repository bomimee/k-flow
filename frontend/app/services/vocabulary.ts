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

        const data: VocabularyItem[] = await response.json();
        return data;
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
