"use client";

import React, { useState } from 'react';
import { saveItem, SavedItem } from '../services/savedItems';

interface SaveItemButtonProps {
    itemType: 'vocabulary' | 'expression' | 'grammar';
    content: any;
    uniqueKey: string;
    isInitiallySaved?: boolean;
    className?: string;
}

export function SaveItemButton({ itemType, content, uniqueKey, isInitiallySaved = false, className = '' }: SaveItemButtonProps) {
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(isInitiallySaved ? 'saved' : 'idle');

    const handleSave = async () => {
        if (status === 'saving' || status === 'saved') return;

        setStatus('saving');
        const success = await saveItem({
            item_type: itemType,
            unique_key: uniqueKey,
            content: content,
        });

        if (success) {
            setStatus('saved');
        } else {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    return (
        <button
            onClick={handleSave}
            disabled={status === 'saving' || status === 'saved'}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${className} ${status === 'saved'
                ? 'bg-green-100 text-green-700'
                : status === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
            title={
                status === 'saved' ? 'Saved to my list' : 'Save to my list'
            }
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
    );
}
