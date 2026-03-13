"use client";

import { useState, useEffect } from 'react';
import { getSavedItems, deleteSavedItem, SavedItem } from '../services/savedItems';
import ModernNavigation from '../components/ModernNavigation';
import { AudioButton } from '../components/AudioButton';
import { useAuth } from '../hooks/useAuth';

export default function SavedItemsPage() {
    const { user, loading: authLoading } = useAuth();
    const [items, setItems] = useState<SavedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'vocabulary' | 'expression' | 'grammar'>('all');

    useEffect(() => {
        if (authLoading) return;
        
        const fetchItems = async () => {
            setLoading(true);
            const userId = user?.id || 'default_user';
            const data = await getSavedItems(userId);
            setItems(data);
            setLoading(false);
        };
        fetchItems();
    }, [user, authLoading]);

    const handleDelete = async (id?: string) => {
        if (!id) return;
        if (!confirm('정말 삭제하시겠습니까?')) return;

        const success = await deleteSavedItem(id);
        if (success) {
            setItems(items.filter(item => item.id !== id));
        } else {
            alert("Failed to delete item");
        }
    };

    const filteredItems = activeTab === 'all' ? items : items.filter(item => item.item_type === activeTab);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <ModernNavigation />

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">내 단어장 (My Saved Items)</h1>
                    <p className="text-gray-600 mt-2">유튜브 영상에서 저장한 단어, 표현, 문법을 나만의 단어장에서 복습하세요.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto pb-2">
                    {['all', 'vocabulary', 'expression', 'grammar'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 font-medium whitespace-nowrap rounded-lg transition ${activeTab === tab
                                    ? "bg-[var(--primary)] text-white"
                                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                }`}
                        >
                            {tab === 'all' && '전체 보기 (All)'}
                            {tab === 'vocabulary' && '📚 단어 (Vocabulary)'}
                            {tab === 'expression' && '📌 표현 (Expressions)'}
                            {tab === 'grammar' && '🧩 문법 (Grammar)'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary)]"></div>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="text-4xl mb-4">📝</div>
                        <p className="text-gray-500 text-lg">아직 저장된 항목이 없습니다.</p>
                        <p className="text-sm text-gray-400 mt-2">유튜브 동영상 학습 페이지에서 'Save' 버튼을 눌러 추가해보세요!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredItems.map(item => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${item.item_type === 'vocabulary' ? 'bg-blue-100 text-blue-700' :
                                            item.item_type === 'expression' ? 'bg-orange-100 text-orange-700' :
                                                'bg-purple-100 text-purple-700'
                                        }`}>
                                        {item.item_type.toUpperCase()}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                        title="Delete"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex-grow">
                                    {item.item_type === 'vocabulary' && (
                                        <>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h2 className="text-2xl font-bold text-gray-900">{item.content.word}</h2>
                                                <AudioButton text={item.content.word} />
                                            </div>
                                            <p className="text-lg text-gray-700 mb-2">{item.content.meaning}</p>
                                            {item.content.usage_note && <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">💡 {item.content.usage_note}</p>}
                                        </>
                                    )}

                                    {item.item_type === 'expression' && (
                                        <>
                                            <div className="flex flex-col mb-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">{item.content.expression}</h2>
                                                    <AudioButton
                                                        text={item.content.expression}
                                                        audioClipUrl={item.content.audio_clip_url}
                                                        timestamp={item.content.audio_timestamp}
                                                        videoId={item.content.video_id}
                                                        className="shrink-0"
                                                    />
                                                </div>
                                                <p className="text-sm text-gray-500">[{item.content.pronunciation}] • {item.content.formality && <span className="capitalize">{item.content.formality}</span>}</p>
                                            </div>
                                            <p className="text-lg text-gray-700 mb-3">→ {item.content.meaning_en}</p>
                                            {item.content.example_in_context && (
                                                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-100">
                                                    <span className="font-semibold text-gray-900 block mb-1">Example:</span>
                                                    {item.content.example_in_context}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {item.item_type === 'grammar' && (
                                        <>
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <h2 className="text-xl font-bold text-gray-900">{item.content.pattern}</h2>
                                            </div>
                                            <p className="text-sm font-medium text-purple-600 mb-2 capitalize">{item.content.level}</p>
                                            <p className="text-gray-700 mb-3">{item.content.explanation_en}</p>
                                            {item.content.formation && <p className="text-sm text-gray-600 bg-purple-50 p-2 rounded border border-purple-100">✍️ {item.content.formation}</p>}
                                        </>
                                    )}
                                </div>

                                {item.content.source && (
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                                        <span>출처: {item.content.source}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
