const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SavedItem {
    id?: string;
    user_id?: string;
    item_type: 'vocabulary' | 'expression' | 'grammar';
    unique_key: string;
    content: any;
}

export interface SavedAchievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    points: number;
    rarity: string;
}

export interface SaveItemResult {
    item: SavedItem;
    new_achievements: SavedAchievement[];
}

/**
 * 아이템 저장. 성공 시 { item, new_achievements } 반환.
 * new_achievements가 비어있지 않으면 새 업적이 해제된 것.
 */
export async function saveItem(
    item: SavedItem,
    userId: string = 'default_user'
): Promise<SaveItemResult | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/saved-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, user_id: userId }),
        });

        if (!response.ok) {
            throw new Error('Failed to save item');
        }
        return await response.json();
    } catch (error) {
        console.error('Error saving item:', error);
        return null;
    }
}

export async function getSavedItems(userId: string = 'default_user', itemType?: string): Promise<SavedItem[]> {
    try {
        const url = new URL(`${API_BASE_URL}/api/saved-items`);
        url.searchParams.append('user_id', userId);
        if (itemType) {
            url.searchParams.append('item_type', itemType);
        }

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error('Failed to fetch saved items');

        return await response.json();
    } catch (error) {
        console.error('Error fetching saved items:', error);
        return [];
    }
}

export async function getSavedItemsStats(userId: string): Promise<{
    stats: { total: number; vocabulary: number; expression: number; grammar: number };
    achievements: any[];
} | null> {
    try {
        const res = await fetch(`${API_BASE_URL}/api/saved-items/stats?user_id=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch saved items stats');
        return await res.json();
    } catch (error) {
        console.error('Error fetching saved items stats:', error);
        return null;
    }
}

export async function deleteSavedItem(itemId: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/saved-items/${itemId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete saved item');

        return true;
    } catch (error) {
        console.error('Error deleting saved item:', error);
        return false;
    }
}
