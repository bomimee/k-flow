import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { updateGrammarSRSProgress } from '@/app/services/srs';

interface SRSGrammarStudySessionProps {
  grammarItems: any[];
  onSessionComplete: (results: any) => void;
}

export default function SRSGrammarStudySession({ grammarItems, onSessionComplete }: SRSGrammarStudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Tracking Stats
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [qualities, setQualities] = useState<number[]>([]);

  const { user } = useAuth();
  
  const currentItem = grammarItems[currentIndex];

  const handlePracticeSubmit = async () => {
    if (selectedOption !== null && currentItem) {
      setLoading(true);
      const isCorrect = selectedOption === currentItem.quiz.answer;
      
      if (isCorrect) {
          setCorrectCount(prev => prev + 1);
          setQualities(prev => [...prev, 5]); // Simulating excellent quality for correct
      } else {
          setQualities(prev => [...prev, 1]); // Simulating poor quality for incorrect
      }

      setShowResult(true);
      
      // Update SRS progress if user is logged in
      if (user && currentItem.id) {
        await updateGrammarSRSProgress(user.id, currentItem.id, isCorrect);
      }
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < grammarItems.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      // Session Complete
      const totalTimeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);
      const averageQuality = qualities.length > 0 ? qualities.reduce((a, b) => a + b, 0) / qualities.length : 0;
      
      onSessionComplete({
        itemsStudied: grammarItems.length,
        averageQuality,
        totalTimeSpent,
        correctAnswers: correctCount
      });
    }
  };

  if (!currentItem) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Grammar Review</h2>
        <div className="text-gray-500 font-medium">
          {currentIndex + 1} / {grammarItems.length}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${((currentIndex + 1) / grammarItems.length) * 100}%` }}
        ></div>
      </div>

      <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-6">
          <p className="font-bold text-indigo-900 text-sm mb-2">{currentItem.title}</p>
          <p className="font-bold text-xl text-gray-800 text-center">
            {currentItem.quiz.question}
          </p>
        </div>

        <div className="space-y-3">
          {currentItem.quiz.options.map((opt: string, idx: number) => {
            const isSelected = selectedOption === idx;
            const isCorrectAnswer = currentItem.quiz.answer === idx;
            
            let btnStyle = "bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-300";
            if (isSelected) btnStyle = "bg-indigo-50 border-2 border-indigo-500 text-indigo-700 font-bold";
            
            if (showResult) {
              if (isCorrectAnswer) {
                btnStyle = "bg-green-50 border-2 border-green-500 text-green-700 font-bold";
              } else if (isSelected && !isCorrectAnswer) {
                btnStyle = "bg-red-50 border-2 border-red-500 text-red-700 font-bold opacity-70";
              } else {
                btnStyle = "bg-white border-2 border-gray-200 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                disabled={showResult || loading}
                onClick={() => setSelectedOption(idx)}
                className={`w-full p-4 rounded-xl text-left transition-all ${btnStyle}`}
              >
                <div className="flex justify-between items-center">
                  <span>{opt}</span>
                  {showResult && isCorrectAnswer && <span className="text-green-500 text-xl">✅</span>}
                  {showResult && isSelected && !isCorrectAnswer && <span className="text-red-500 text-xl">❌</span>}
                </div>
              </button>
            );
          })}
        </div>

        {!showResult ? (
          <button 
            onClick={handlePracticeSubmit}
            disabled={selectedOption === null || loading}
            className={`w-full py-4 flex items-center justify-center rounded-xl font-bold text-lg mt-8 transition-colors ${selectedOption !== null && !loading ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Check Answer'}
          </button>
        ) : (
          <div className="mt-8 space-y-4">
            <div className={`p-4 rounded-xl text-center font-bold ${selectedOption === currentItem.quiz.answer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {selectedOption === currentItem.quiz.answer ? 'Great job! That is correct. 🎉' : 'Keep practicing! Review this grammar rule.'}
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="font-bold text-gray-700 mb-2 whitespace-pre-wrap">Explanation / Notes</h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{currentItem.description}</p>
            </div>

            <button 
              onClick={handleNext}
              className="w-full py-4 shadow-md bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-colors"
            >
              {currentIndex + 1 < grammarItems.length ? 'Next Question →' : 'Finish Session'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
