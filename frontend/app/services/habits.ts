const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface HabitData {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    category: string;
    frequency: string;
    motivation: number;
    ability: number;
    prompt_type: string;
    prompt_trigger: string | null;
    prompt_cue: string | null;
    prompt_enabled: boolean;
    streak: number;
    last_completed_at: string | null;
    created_at: string;
    completed_today: boolean;
}

export interface HabitStats {
    streak_days: number;
    longest_streak: number;
    total_study_time: number;
    last_active_at: string | null;
    srs_reviewed_today: number;
    saved_items_total: number;
    avg_success_rate: number;
}

export interface HabitsResponse {
    habits: HabitData[];
    stats: HabitStats;
}

export interface HabitCreatePayload {
    user_id: string;
    name: string;
    description?: string;
    category: string;
    frequency: string;
    motivation: number;
    ability: number;
    prompt_type: string;
    prompt_trigger?: string;
    prompt_cue?: string;
    prompt_enabled: boolean;
}

export async function fetchHabits(userId: string): Promise<HabitsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/habits/${userId}`);
    if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(`Failed to fetch habits: ${err.detail}`);
    }
    return response.json();
}

export async function createHabit(payload: HabitCreatePayload): Promise<HabitData> {
    const response = await fetch(`${API_BASE_URL}/api/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(`Failed to create habit: ${err.detail}`);
    }
    return response.json();
}

export async function completeHabit(habitId: string, userId: string): Promise<{ status: string; new_streak: number }> {
    const response = await fetch(
        `${API_BASE_URL}/api/habits/${habitId}/complete?user_id=${userId}`,
        { method: 'POST' }
    );
    if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(`Failed to complete habit: ${err.detail}`);
    }
    return response.json();
}

export async function updateHabitFields(
    habitId: string,
    fields: { motivation?: number; ability?: number; prompt_enabled?: boolean }
): Promise<HabitData> {
    const response = await fetch(`${API_BASE_URL}/api/habits/${habitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(`Failed to update habit: ${err.detail}`);
    }
    return response.json();
}

export async function deleteHabit(habitId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/habits/${habitId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(`Failed to delete habit: ${err.detail}`);
    }
}
