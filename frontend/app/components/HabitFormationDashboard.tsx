"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { BehaviorModel } from '@/app/services/behaviorModel';
import {
    fetchHabits,
    createHabit,
    completeHabit,
    updateHabitFields,
    deleteHabit,
    type HabitData,
    type HabitStats,
} from '@/app/services/habits';
import type { Behavior } from '@/app/types/behavior';

interface HabitFormationDashboardProps {
    onBehaviorUpdate: (behaviors: Behavior[]) => void;
}

const CATEGORIES = ['vocabulary', 'grammar', 'speaking', 'listening', 'reading'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_COLORS: Record<string, string> = {
    vocabulary: 'bg-blue-100 text-blue-700',
    grammar: 'bg-purple-100 text-purple-700',
    speaking: 'bg-green-100 text-green-700',
    listening: 'bg-orange-100 text-orange-700',
    reading: 'bg-pink-100 text-pink-700',
};

function getBehaviorScore(motivation: number, ability: number, promptEnabled: boolean) {
    return BehaviorModel.calculateBehaviorScore(motivation, ability, promptEnabled ? 10 : 0);
}

function getBehaviorColor(score: number) {
    if (score >= 7) return 'text-green-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
}

// ── Add Habit Modal ──────────────────────────────────────────────────────────
interface AddHabitModalProps {
    onClose: () => void;
    onSave: (data: {
        name: string; description: string; category: string;
        frequency: string; motivation: number; ability: number;
        prompt_cue: string;
    }) => Promise<void>;
}

function AddHabitModal({ onClose, onSave }: AddHabitModalProps) {
    const [form, setForm] = useState({
        name: '', description: '', category: 'vocabulary',
        frequency: 'daily', motivation: 5, ability: 5, prompt_cue: ''
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try { await onSave(form); onClose(); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold mb-5">➕ New Habit</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Habit Name</label>
                        <input
                            required
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--background)]"
                            placeholder="e.g. Daily Vocabulary Review"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <input
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--background)]"
                            placeholder="Short description"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Category</label>
                            <select
                                value={form.category}
                                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Frequency</label>
                            <select
                                value={form.frequency}
                                onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}
                                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Motivation: {form.motivation}/10</label>
                        <input type="range" min="0" max="10" value={form.motivation}
                            onChange={e => setForm(p => ({ ...p, motivation: +e.target.value }))}
                            className="w-full mt-1" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Ability (Ease): {form.ability}/10</label>
                        <input type="range" min="0" max="10" value={form.ability}
                            onChange={e => setForm(p => ({ ...p, ability: +e.target.value }))}
                            className="w-full mt-1" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Reminder / Prompt</label>
                        <input
                            value={form.prompt_cue}
                            onChange={e => setForm(p => ({ ...p, prompt_cue: e.target.value }))}
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--background)]"
                            placeholder="e.g. After morning coffee"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 bg-[var(--background)] text-white rounded-lg py-2 text-sm font-medium hover:bg-[var(--lightblue)] transition-colors disabled:opacity-60">
                            {saving ? 'Saving…' : 'Create Habit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function HabitFormationDashboard({ onBehaviorUpdate }: HabitFormationDashboardProps) {
    const { user } = useAuth();
    const [habits, setHabits] = useState<HabitData[]>([]);
    const [stats, setStats] = useState<HabitStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [completing, setCompleting] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchHabits(user.id);
            setHabits(data.habits);
            setStats(data.stats);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { load(); }, [load]);

    const handleComplete = async (habitId: string) => {
        if (!user || completing) return;
        setCompleting(habitId);
        try {
            const res = await completeHabit(habitId, user.id);
            if (res.status === 'already_completed') {
                alert('Already completed today! 🎉');
                return;
            }
            setHabits(prev => prev.map(h =>
                h.id === habitId ? { ...h, streak: res.new_streak, completed_today: true } : h
            ));
            setStats(prev => prev ? { ...prev, streak_days: prev.streak_days + 1 } : prev);
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        } finally {
            setCompleting(null);
        }
    };

    const handleMotivationChange = async (habitId: string, value: number) => {
        setHabits(prev => prev.map(h => h.id === habitId ? { ...h, motivation: value } : h));
        try { await updateHabitFields(habitId, { motivation: value }); }
        catch { /* silent, UI already updated optimistically */ }
    };

    const handleAbilityChange = async (habitId: string, value: number) => {
        setHabits(prev => prev.map(h => h.id === habitId ? { ...h, ability: value } : h));
        try { await updateHabitFields(habitId, { ability: value }); }
        catch { /* silent */ }
    };

    const handleDelete = async (habitId: string) => {
        if (!confirm('Delete this habit?')) return;
        try {
            await deleteHabit(habitId);
            setHabits(prev => prev.filter(h => h.id !== habitId));
            if (selectedId === habitId) setSelectedId(null);
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        }
    };

    const handleAddHabit = async (form: {
        name: string; description: string; category: string;
        frequency: string; motivation: number; ability: number; prompt_cue: string;
    }) => {
        if (!user) return;
        const created = await createHabit({
            user_id: user.id,
            name: form.name,
            description: form.description,
            category: form.category,
            frequency: form.frequency,
            motivation: form.motivation,
            ability: form.ability,
            prompt_type: 'time',
            prompt_cue: form.prompt_cue,
            prompt_enabled: true,
        });
        setHabits(prev => [...prev, { ...created, completed_today: false }]);
    };

    // ── Derived stats for Overview banner ────────────────────────────────────
    const completedToday = habits.filter(h => h.completed_today).length;
    const completionRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
    const avgMotivation = habits.length > 0
        ? Math.round(habits.reduce((s, h) => s + h.motivation, 0) / habits.length * 10)
        : 0;
    const analysis = habits.length > 0
        ? BehaviorModel.calculateHabitFormation(
            habits.map(h => ({
                id: h.id, name: h.name, description: h.description || '',
                motivation: h.motivation, ability: h.ability,
                prompt: { type: h.prompt_type as any, trigger: h.prompt_trigger || '', cue: h.prompt_cue || '', isEnabled: h.prompt_enabled },
                category: h.category as any, rewards: [], streak: h.streak, frequency: h.frequency as any
            }))
        )
        : null;

    // ── Loading / Error states ───────────────────────────────────────────────
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-2xl mb-2">🔐</p>
                <p className="text-gray-600">Please sign in to track your habits.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-[var(--background)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <p className="text-red-500 mb-4">⚠️ {error}</p>
                <button onClick={load} className="bg-[var(--background)] text-white px-6 py-2 rounded-lg hover:bg-[var(--lightblue)] transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    const selectedHabit = habits.find(h => h.id === selectedId) ?? null;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* ── Header ── */}
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">🎯 Habit Formation Dashboard</h2>
                <p className="text-gray-600">Real-time data from your learning activity</p>
            </div>

            {/* ── Stats Banner ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-xl p-4 text-center shadow-lg">
                    <p className="text-4xl font-bold">🔥 {stats?.streak_days ?? 0}</p>
                    <p className="text-sm opacity-90 mt-1">Day Streak</p>
                </div>
                <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-xl p-4 text-center shadow-lg">
                    <p className="text-4xl font-bold">{completionRate}%</p>
                    <p className="text-sm opacity-90 mt-1">Today's Completion</p>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl p-4 text-center shadow-lg">
                    <p className="text-4xl font-bold">{stats?.srs_reviewed_today ?? 0}</p>
                    <p className="text-sm opacity-90 mt-1">Words Reviewed Today</p>
                </div>
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-xl p-4 text-center shadow-lg">
                    <p className="text-4xl font-bold">{stats?.avg_success_rate ?? 0}%</p>
                    <p className="text-sm opacity-90 mt-1">SRS Accuracy</p>
                </div>
            </div>

            {/* ── Overall Progress (from BehaviorModel) ── */}
            {analysis && (
                <div className="bg-gradient-to-r from-[var(--background)] to-[var(--lightblue)] text-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold mb-4">📊 Overall Habit Formation</h3>
                    <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                            <p className="text-3xl font-bold">{analysis.formationScore}%</p>
                            <p className="text-sm opacity-80 mt-1">Formation Score</p>
                            <div className="mt-2 h-2 bg-white/20 rounded-full">
                                <div className="h-2 bg-white rounded-full transition-all" style={{ width: `${analysis.formationScore}%` }} />
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{analysis.consistencyScore}%</p>
                            <p className="text-sm opacity-80 mt-1">Consistency</p>
                            <div className="mt-2 h-2 bg-white/20 rounded-full">
                                <div className="h-2 bg-white rounded-full transition-all" style={{ width: `${analysis.consistencyScore}%` }} />
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{stats?.longest_streak ?? 0}</p>
                            <p className="text-sm opacity-80 mt-1">Longest Streak</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── AI Recommendations ── */}
            {analysis && analysis.recommendations.length > 0 && (
                <div className="bg-[var(--lemon)] p-5 rounded-xl">
                    <h3 className="font-bold text-black mb-3">💡 Recommendations</h3>
                    <ul className="space-y-1">
                        {analysis.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start text-sm text-black">
                                <span className="mr-2 mt-0.5">•</span>{rec}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── Active Behaviors ── */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-bold">🎯 Active Habits ({habits.length})</h3>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[var(--background)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--lightblue)] transition-colors flex items-center gap-1"
                    >
                        <span>+</span> Add Habit
                    </button>
                </div>

                {habits.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-5xl mb-3">🌱</p>
                        <p className="font-medium">No habits yet</p>
                        <p className="text-sm mt-1">Click "+ Add Habit" to start building your routine</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {habits.map(habit => {
                            const score = getBehaviorScore(habit.motivation, habit.ability, habit.prompt_enabled);
                            const willOccur = BehaviorModel.willBehaviorOccur(habit.motivation, habit.ability, habit.prompt_enabled ? 10 : 0);
                            const isSelected = selectedId === habit.id;

                            return (
                                <div
                                    key={habit.id}
                                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${isSelected ? 'border-[var(--background)] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                                    onClick={() => setSelectedId(isSelected ? null : habit.id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-semibold text-gray-900">{habit.name}</h4>
                                                {habit.completed_today && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                                        ✓ Done Today
                                                    </span>
                                                )}
                                            </div>
                                            {habit.description && (
                                                <p className="text-sm text-gray-500 mt-0.5 truncate">{habit.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
                                                <span className={`px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[habit.category] || 'bg-gray-100 text-gray-700'}`}>
                                                    {habit.category}
                                                </span>
                                                <span className="text-gray-500">{habit.frequency}</span>
                                                <span>🔥 {habit.streak} day{habit.streak !== 1 ? 's' : ''}</span>
                                                <span className={`font-semibold ${getBehaviorColor(score)}`}>
                                                    {willOccur ? '✅' : '⚠️'} {score.toFixed(1)}/10
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-3 shrink-0">
                                            <button
                                                onClick={e => { e.stopPropagation(); handleComplete(habit.id); }}
                                                disabled={habit.completed_today || completing === habit.id}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${habit.completed_today
                                                    ? 'bg-gray-100 text-gray-400 cursor-default'
                                                    : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
                                                    } ${completing === habit.id ? 'opacity-60' : ''}`}
                                            >
                                                {completing === habit.id ? '…' : habit.completed_today ? 'Done ✓' : 'Complete'}
                                            </button>
                                            <button
                                                onClick={e => { e.stopPropagation(); handleDelete(habit.id); }}
                                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                                title="Delete habit"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>

                                    {/* B = M × A × P sliders */}
                                    {isSelected && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                                            <div>
                                                <label className="text-xs font-medium text-gray-600">Motivation (M)</label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <input
                                                        type="range" min="0" max="10"
                                                        value={habit.motivation}
                                                        onChange={e => handleMotivationChange(habit.id, +e.target.value)}
                                                        onClick={e => e.stopPropagation()}
                                                        className="flex-1 accent-[var(--background)]"
                                                    />
                                                    <span className="text-sm font-bold w-6 text-center">{habit.motivation}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-600">Ability (A)</label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <input
                                                        type="range" min="0" max="10"
                                                        value={habit.ability}
                                                        onChange={e => handleAbilityChange(habit.id, +e.target.value)}
                                                        onClick={e => e.stopPropagation()}
                                                        className="flex-1 accent-[var(--background)]"
                                                    />
                                                    <span className="text-sm font-bold w-6 text-center">{habit.ability}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-600">Prompt (P)</label>
                                                <div className="flex items-center gap-2 mt-1 text-sm">
                                                    <span>{habit.prompt_enabled ? '✅' : '❌'}</span>
                                                    <span className="text-gray-600 truncate">{habit.prompt_cue || 'No prompt set'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {score < 4 && (
                                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-xs font-semibold text-yellow-800 mb-1">💡 This habit needs work:</p>
                                            <p className="text-xs text-yellow-700">
                                                {habit.motivation < 5 ? 'Boost motivation by connecting this habit to your core goal. ' : ''}
                                                {habit.ability < 5 ? 'Make it easier — shrink the habit to 2 minutes or less.' : ''}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Secondary stats (Saved items / SRS) ── */}
            {stats && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl shadow p-5 text-center">
                        <p className="text-3xl font-bold text-[var(--background)]">{stats.saved_items_total}</p>
                        <p className="text-sm text-gray-600 mt-1">Total Saved Items</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-5 text-center">
                        <p className="text-3xl font-bold text-[var(--background)]">{stats.longest_streak}</p>
                        <p className="text-sm text-gray-600 mt-1">Longest Streak (days)</p>
                    </div>
                </div>
            )}

            {/* ── Add Habit Modal ── */}
            {showAddModal && (
                <AddHabitModal onClose={() => setShowAddModal(false)} onSave={handleAddHabit} />
            )}
        </div>
    );
}