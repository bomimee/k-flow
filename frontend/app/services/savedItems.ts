const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SavedItem {
    id?: string;
    user_id?: string;
    item_type: 'vocabulary' | 'expression' | 'grammar';
    unique_key: string;
    content: any;
}

export async function saveItem(item: SavedItem, userId: string = 'default_user'): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/saved-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, user_id: userId }),
        });

        if (!response.ok) {
            throw new Error('Failed to save item');
        }
        return true;
    } catch (error) {
        console.error('Error saving item:', error);
        return false;
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
