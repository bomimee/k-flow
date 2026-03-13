const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface UserProfile {
    id: string;
    ttmik_level: number;
    experience: number;
    streak_days: number;
    longest_streak: number;
    last_active_at: string | null;
    nickname: string | null;
    created_at: string | null;
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`);
        if (!response.ok) {
            throw new Error(`Failed to fetch profile: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching user profile:', error);
        return null;
    }
}
