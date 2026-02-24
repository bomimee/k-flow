import { useState, useEffect } from 'react';
import type { VocabularyItem, SRSStudyResults } from '@/app/types/vocabulary';
import { SpacedRepetitionSystem } from '@/app/services/spacedRepetition';
import { useAuth } from '@/app/hooks/useAuth';
import { fetchDueItems, updateSRSProgress } from '@/app/services/srs';
import { fetchVocabulary } from '@/app/services/vocabulary';

interface SRSStudySessionProps {
  vocabulary: VocabularyItem[];
  onSessionComplete: (results: SRSStudyResults) => void;
}

export default function SRSStudySession({ vocabulary, onSessionComplete }: SRSStudySessionProps) {
  const [session, setSession] = useState<{
    reviewItems: VocabularyItem[];
    newItems: VocabularyItem[];
    currentIndex: number;
    currentItem: VocabularyItem | null;
    isReviewMode: boolean;
    startTime: Date;
    answers: Array<{
      itemId: string;
      quality: number;
      timeSpent: number;
    }>;
  } | null>(null);

  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadRealData();
    } else {
      initializeSession(vocabulary);
    }
  }, [vocabulary, user]);

  const loadRealData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const dueItems = await fetchDueItems(user.id);
      if (dueItems.length > 0) {
        setSession({
          reviewItems: dueItems,
          newItems: [],
          currentIndex: 0,
          currentItem: dueItems[0],
          isReviewMode: true,
          startTime: new Date(),
          answers: []
        });
        setCurrentItem(dueItems[0]);
      } else {
        const newItems = await fetchVocabulary(1, [], 10);
        initializeSession(newItems);
      }
    } catch (err) {
      console.error('Error loading real SRS data:', err);
      initializeSession(vocabulary);
    } finally {
      setLoading(false);
    }
  };


  const initializeSession = (vocabToUse: VocabularyItem[]) => {
    const recommendations = SpacedRepetitionSystem.getStudySessionRecommendations(vocabToUse);

    setSession({
      reviewItems: recommendations.reviewItems,
      newItems: recommendations.newItems,
      currentIndex: 0,
      currentItem: null,
      isReviewMode: recommendations.reviewItems.length > 0,
      startTime: new Date(),
      answers: []
    });

    if (recommendations.reviewItems.length > 0) {
      setCurrentItem(recommendations.reviewItems[0]);
    } else if (recommendations.newItems.length > 0) {
      setCurrentItem(recommendations.newItems[0]);
    }
  };

  const setCurrentItem = (item: VocabularyItem) => {
    setSession(prev => prev ? { ...prev, currentItem: item } : null);
    setShowAnswer(false);
    setStartTime(Date.now());
    setHintsUsed(0);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleHint = () => {
    setHintsUsed(prev => prev + 1);
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support text-to-speech.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9; // Slightly slower for clarity

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const getHintContent = () => {
    if (hintsUsed === 0) return null;
    if (hintsUsed === 1) return <p className="text-lg font-medium animate-fade-in text-white/90">Hint: [{item.pronunciation}]</p>;

    // Hint level 2: Show part of the meaning (masked)
    const maskedMeaning = item.meaning.split('').map((char, i) => i === 0 || char === ' ' ? char : '_').join('');
    return (
      <div className="space-y-2 animate-fade-in">
        <p className="text-lg font-medium text-white/90">Hint: [{item.pronunciation}]</p>
        <p className="text-lg font-mono tracking-wider text-white/80">Mean: {maskedMeaning}</p>
      </div>
    );
  };

  const handleQualityRating = async (quality: number) => {
    if (!session || !session.currentItem || !user) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const updatedSRS = SpacedRepetitionSystem.calculateNextReview(session.currentItem.srsData, quality);

    // Persist to DB in background
    updateSRSProgress(user.id, session.currentItem.id, updatedSRS);
    const answer = {
      itemId: session.currentItem.id,
      quality,
      timeSpent
    };

    const updatedAnswers = [...session.answers, answer];

    // Move to next item
    const nextIndex = session.currentIndex + 1;
    let nextItem: VocabularyItem | null = null;
    let isReviewMode = session.isReviewMode;

    if (session.isReviewMode) {
      if (nextIndex < session.reviewItems.length) {
        nextItem = session.reviewItems[nextIndex];
      } else if (session.newItems.length > 0) {
        // Switch to new items
        isReviewMode = false;
        nextItem = session.newItems[0];
        setSession(prev => prev ? { ...prev, currentIndex: 0, isReviewMode } : null);
      }
    } else {
      if (nextIndex < session.newItems.length) {
        nextItem = session.newItems[nextIndex];
      }
    }

    if (nextItem) {
      setSession(prev => prev ? { ...prev, currentIndex: nextIndex, answers: updatedAnswers } : null);
      setCurrentItem(nextItem);
    } else {
      completeSession(updatedAnswers);
    }
  };

  const completeSession = (answers: Array<{ itemId: string; quality: number; timeSpent: number }>) => {
    if (!session) return;

    // Update vocabulary items based on performance
    const itemsUpdated = SpacedRepetitionSystem.batchUpdateItems(vocabulary, answers);

    const results: SRSStudyResults = {
      itemsStudied: answers.length,
      correctAnswers: answers.filter(a => a.quality >= 3).length,
      totalTimeSpent: Math.floor((Date.now() - session.startTime.getTime()) / 1000),
      averageQuality: answers.reduce((sum, a) => sum + a.quality, 0) / answers.length,
      itemsUpdated
    };

    onSessionComplete(results);
  };

  if (!session || !session.currentItem) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Study Session Complete!</h2>
        <p className="text-gray-600">Great job! You've finished your study session.</p>
      </div>
    );
  }

  const item = session.currentItem;
  const progress = session.isReviewMode
    ? ((session.currentIndex + 1) / session.reviewItems.length) * 100
    : ((session.currentIndex + 1) / session.newItems.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Session Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${session.isReviewMode
            ? 'bg-orange-100 text-orange-700'
            : 'bg-green-100 text-green-700'
            }`}>
            {session.isReviewMode ? 'Review' : 'New Learning'}
          </span>
          <span className="text-gray-600">
            {session.isReviewMode ? session.reviewItems.length : session.newItems.length} items
          </span>
        </div>
        <div className="text-gray-600">
          {session.currentIndex + 1} / {session.isReviewMode ? session.reviewItems.length : session.newItems.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${session.isReviewMode ? 'bg-orange-500' : 'bg-green-500'
            }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Vocabulary Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-10 rounded-2xl mb-8 shadow-xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-indigo-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-3">
              <h1 className="text-5xl font-bold tracking-tight">{item.korean}</h1>
              <button
                onClick={() => speak(item.korean)}
                disabled={isPlaying}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/20 hover:bg-white/30 active:scale-90 ${isPlaying ? 'animate-pulse' : ''}`}
                title="Listen to pronunciation"
              >
                {isPlaying ? (
                  <div className="flex space-x-0.5 mt-0.5">
                    <div className="w-1 h-3 bg-white rounded-full animate-bounce"></div>
                    <div className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  </div>
                ) : (
                  <span className="text-xl">🔊</span>
                )}
              </button>
            </div>
            {item.hanja && (
              <p className="text-2xl font-medium text-white/80">{item.hanja}</p>
            )}
          </div>

          <div className="min-h-[60px] flex flex-col justify-center">
            {!showAnswer ? (
              getHintContent()
            ) : (
              <div className="space-y-4 animate-fade-in">
                <p className="text-lg text-white/80">[{item.pronunciation}]</p>
                <div className="pt-4 border-t border-white/20">
                  <p className="text-3xl font-bold mb-4">{item.meaning}</p>

                  <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl text-left border border-white/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Example Sentence</p>
                    <p className="text-lg font-medium mb-1 leading-snug">{item.exampleSentence}</p>
                    <p className="text-sm text-indigo-100/70 italic">{item.exampleTranslation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SRS Info */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="font-semibold">Difficulty:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${item.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              item.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
              {item.difficulty}
            </span>
          </div>
          <div>
            <span className="font-semibold">Success Rate:</span>
            <span className="ml-2">{Math.round(item.srsData.successRate * 100)}%</span>
          </div>
          <div>
            <span className="font-semibold">Interval:</span>
            <span className="ml-2">{item.srsData.interval} days</span>
          </div>
        </div>
      </div>

      {!showAnswer ? (
        <div className="space-y-4">
          <button
            onClick={handleHint}
            disabled={hintsUsed >= 2}
            className={`w-full py-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center space-x-2 ${hintsUsed >= 2
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg hover:shadow-amber-500/30 active:scale-[0.98]'
              }`}
          >
            <span>{hintsUsed >= 2 ? '🚫' : '💡'}</span>
            <span>{hintsUsed >= 2 ? 'No More Hints' : `Get Hint (${hintsUsed + 1}/2)`}</span>
          </button>

          <button
            onClick={handleShowAnswer}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <span>📖</span>
            <span>Show Answer</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-center text-gray-600 mb-4">How well did you know this?</p>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(quality => (
              <button
                key={quality}
                onClick={() => handleQualityRating(quality)}
                className={`py-3 rounded-lg font-semibold transition-all ${quality === 1 ? 'bg-red-500 text-white hover:bg-red-600' :
                  quality === 2 ? 'bg-orange-500 text-white hover:bg-orange-600' :
                    quality === 3 ? 'bg-yellow-500 text-white hover:bg-yellow-600' :
                      quality === 4 ? 'bg-green-500 text-white hover:bg-green-600' :
                        'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
              >
                {quality === 1 && '😵'}
                {quality === 2 && '😟'}
                {quality === 3 && '🤔'}
                {quality === 4 && '😊'}
                {quality === 5 && '🎉'}
                <div className="text-xs mt-1">
                  {quality === 1 && 'Again'}
                  {quality === 2 && 'Hard'}
                  {quality === 3 && 'Good'}
                  {quality === 4 && 'Easy'}
                  {quality === 5 && 'Perfect'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}