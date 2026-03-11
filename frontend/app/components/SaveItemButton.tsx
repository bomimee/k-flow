"use client";

import React, { useState, useEffect } from 'react';
import { saveItem } from '../services/savedItems';
import type { SavedAchievement } from '../services/savedItems';
import { useAuth } from '../hooks/useAuth';

interface SaveItemButtonProps {
    itemType: 'vocabulary' | 'expression' | 'grammar';
    content: any;
    uniqueKey: string;
    isInitiallySaved?: boolean;
    className?: string;
}

export function SaveItemButton({ itemType, content, uniqueKey, isInitiallySaved = false, className = '' }: SaveItemButtonProps) {
    const { user } = useAuth();
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(isInitiallySaved ? 'saved' : 'idle');
    const [newAchievements, setNewAchievements] = useState<SavedAchievement[]>([]);

    // 3초 후 업적 토스트 자동 닫기
    useEffect(() => {
        if (newAchievements.length === 0) return;
        const timer = setTimeout(() => setNewAchievements([]), 3500);
        return () => clearTimeout(timer);
    }, [newAchievements]);

    const handleSave = async () => {
        if (status === 'saving' || status === 'saved') return;

        setStatus('saving');
        const userId = user?.id || 'default_user';
        const result = await saveItem({
            item_type: itemType,
            unique_key: uniqueKey,
            content: content,
        }, userId);

        if (result) {
            setStatus('saved');
            if (result.new_achievements?.length > 0) {
                setNewAchievements(result.new_achievements);
            }
        } else {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    return (
        <div className="relative inline-block">
            {/* 업적 토스트 (저장 버튼 바로 위) */}
            {newAchievements.length > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 space-y-1 w-64">
                    {newAchievements.map(ach => (
                        <div
                            key={ach.id}
                            className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap animate-bounce"
                        >
                            <span className="text-base">{ach.icon}</span>
                            <div className="flex-1 min-w-0">
                                <span className="font-bold block leading-tight">🏆 Achievement!</span>
                                <span className="opacity-90 truncate block">{ach.name}</span>
                            </div>
                            <span className="font-bold bg-white/30 px-1.5 py-0.5 rounded-full">+{ach.points}</span>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={handleSave}
                disabled={status === 'saving' || status === 'saved'}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${className} ${status === 'saved'
                    ? 'bg-green-100 text-green-700'
                    : status === 'error'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                title={status === 'saved' ? 'Saved to my list' : 'Save to my list'}
            >
                {status === 'saving' && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {status === 'saved' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                )}
                {status === 'error' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
                {status === 'idle' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                )}
                <span>{status === 'saved' ? 'Saved' : 'Save'}</span>
            </button>
        </div>
    );
}
