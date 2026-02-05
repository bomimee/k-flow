import { useState, useEffect } from 'react';
import type { VocabularyItem } from '@/app/types/vocabulary';
import { SpacedRepetitionSystem } from '@/app/services/spacedRepetition';

interface SRSStudySessionProps {
  vocabulary: VocabularyItem[];
  onSessionComplete: (results: SRSStudyResults) => void;
}

interface SRSStudyResults {
  itemsStudied: number;
  correctAnswers: number;
  totalTimeSpent: number;
  averageQuality: number;
  itemsUpdated: VocabularyItem[];
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

  useEffect(() => {
    initializeSession();
  }, [vocabulary]);

  const initializeSession = () => {
    const recommendations = SpacedRepetitionSystem.getStudySessionRecommendations(vocabulary);
    
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

  const handleQualityRating = (quality: number) => {
    if (!session || !session.currentItem) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
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
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            session.isReviewMode 
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
          className={`h-2 rounded-full transition-all duration-300 ${
            session.isReviewMode ? 'bg-orange-500' : 'bg-green-500'
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Vocabulary Card */}
      <div className="bg-gradient-to-br from-[var(--background)] to-[var(--lightblue)] text-white p-8 rounded-lg mb-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{item.korean}</h1>
          
          {item.hanja && (
            <p className="text-2xl mb-2 opacity-90">{item.hanja}</p>
          )}
          
          <p className="text-lg mb-4 opacity-80">[{item.pronunciation}]</p>
          
          {showAnswer && (
            <div className="mt-6 pt-6 border-t border-white/30">
              <p className="text-2xl font-semibold mb-3">{item.meaning}</p>
              
              <div className="bg-white/20 p-4 rounded-lg mb-4">
                <p className="text-sm mb-2 opacity-90">Example:</p>
                <p className="font-semibold mb-1">{item.exampleSentence}</p>
                <p className="text-sm opacity-80">{item.exampleTranslation}</p>
              </div>

              {item.wordRoot && (
                <p className="text-sm opacity-80">
                  <span className="font-semibold">Root:</span> {item.wordRoot}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SRS Info */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="font-semibold">Difficulty:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              item.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
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

      {/* Action Buttons */}
      {!showAnswer ? (
        <div className="space-y-3">
          <button
            onClick={handleHint}
            className="w-full py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
          >
            💡 Get Hint ({hintsUsed + 1})
          </button>
          <button
            onClick={handleShowAnswer}
            className="w-full py-3 bg-[var(--background)] text-white rounded-lg font-semibold hover:bg-[var(--lightblue)] transition-colors"
          >
            📖 Show Answer
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
                className={`py-3 rounded-lg font-semibold transition-all ${
                  quality === 1 ? 'bg-red-500 text-white hover:bg-red-600' :
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