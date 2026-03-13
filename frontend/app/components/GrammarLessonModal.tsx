"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { updateGrammarSRSProgress } from '@/app/services/srs';
import { useAudioPlayer } from '@/app/hooks/useAudioPlayer';

interface GrammarLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  grammarTitle: string | null;
}

// Default fallback for unmapped grammar points
const DEFAULT_GRAMMAR = {
  title: 'Grammar Point',
  meaning: 'Grammar rule explanation',
  description: 'Learn how to use this grammar point properly in everyday Korean sentences.',
  formation: [{ text: 'Practice combining this grammar with various verbs and nouns.' }],
  examples: [
    { korean: '예문이 여기에 표시됩니다.', english: 'Example sentence will be shown here.', notes: '' }
  ],
  quiz: {
    question: 'How do you apply this grammar rule?',
    options: ['Option 1', 'Option 2', 'Option 3'],
    answer: 0
  }
};

export default function GrammarLessonModal({ isOpen, onClose, grammarTitle }: GrammarLessonModalProps) {
  const { user } = useAuth();
  const { playTTS, stop, isPlaying } = useAudioPlayer();
  const [mode, setMode] = useState<'lesson' | 'practice'>('lesson');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const handleGenerateMore = async () => {
    if (!data) return;
    setIsGeneratingQuiz(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/grammar/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          meaning: data.meaning,
          description: data.description
        })
      });
      if (!response.ok) throw new Error('Failed to generate new practice question');
      
      const newQuiz = await response.json();
      if (newQuiz && newQuiz.question) {
        setData((prev: any) => ({ ...prev, quiz: newQuiz }));
        setSelectedOption(null);
        setShowResult(false);
      }
    } catch (err) {
      console.error('Generation Error:', err);
      alert('Failed to generate a new question. Please try again later.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  useEffect(() => {
    const fetchGrammar = async () => {
      if (!isOpen || !grammarTitle) {
        setData(null);
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/grammar?title=${encodeURIComponent(grammarTitle)}`);
        if (!response.ok) throw new Error('Failed to fetch grammar');
        
        const result = await response.json();
        if (result && result.length > 0) {
          setData(result[0]);
        } else {
          setData({ ...DEFAULT_GRAMMAR, title: grammarTitle });
        }
      } catch (err) {
        console.error('Error fetching grammar:', err);
        setData({ ...DEFAULT_GRAMMAR, title: grammarTitle });
      } finally {
        setLoading(false);
      }
    };
    
    fetchGrammar();
  }, [isOpen, grammarTitle]);

  // Handle Play TTS
  const handlePlayTTS = (text: string, idx: number) => {
    if (isPlaying && playingIdx === idx) {
      stop();
      setPlayingIdx(null);
    } else {
      playTTS(text);
      setPlayingIdx(idx);
    }
  };

  // Reset playingIdx when isPlaying changes externally
  useEffect(() => {
    if (!isPlaying) {
      setPlayingIdx(null);
    }
  }, [isPlaying]);

  if (!isOpen || !grammarTitle) return null;

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-12 flex flex-col justify-center items-center h-64">
           <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-gray-500 font-medium animate-pulse">Loading grammar lesson...</p>
        </div>
      </div>
    );
  }

  const handlePracticeSubmit = async () => {
    if (selectedOption !== null && data) {
      setShowResult(true);
      
      // Update SRS progress if user is logged in
      if (user && data.id) {
        const isCorrect = selectedOption === data.quiz.answer;
        await updateGrammarSRSProgress(user.id, data.id, isCorrect);
      }
    }
  };

  const resetState = () => {
    setMode('lesson');
    setSelectedOption(null);
    setShowResult(false);
    stop();
    setPlayingIdx(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black">{data.title}</h2>
            <p className="text-blue-100 font-medium text-sm mt-0.5">{data.meaning}</p>
          </div>
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 shrink-0">
          <button 
            className={`flex-1 py-3 font-bold text-center border-b-2 transition-colors ${mode === 'lesson' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setMode('lesson')}
          >
            📖 Lesson Mode
          </button>
          <button 
            className={`flex-1 py-3 font-bold text-center border-b-2 transition-colors ${mode === 'practice' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => {
              setMode('practice');
              setShowResult(false);
              setSelectedOption(null);
            }}
          >
            ✍️ Practice Mode
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {loading || !data ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : mode === 'lesson' ? (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              {/* Description */}
              <section>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-gray-800">
                  <span className="text-blue-500">💡</span> Usage
                </h3>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                  {data.description}
                </p>
              </section>

              {/* Formation / Rules */}
              <section>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-gray-800">
                  <span className="text-orange-500">⚙️</span> Formation Rule
                </h3>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-3">
                  {data.formation.map((f: any, idx: number) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                      {f.rule ? (
                        <>
                          <div className="font-semibold text-gray-800 min-w-[200px]">{f.rule}</div>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-orange-600 bg-white px-2 py-1 rounded shadow-sm">{f.result}</span>
                            <span className="text-gray-500 text-xs">ex) {f.example}</span>
                          </div>
                        </>
                      ) : (
                        <div className="font-bold text-orange-600 font-mono text-center w-full bg-white py-2 rounded shadow-sm">{f.text}</div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Examples */}
              <section>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-gray-800">
                  <span className="text-green-500">📝</span> Example Sentences
                </h3>
                <div className="space-y-3">
                  {data.examples.map((ex: any, idx: number) => (
                    <div key={idx} className="border border-gray-100 rounded-xl p-4 hover:border-green-200 transition-colors bg-white shadow-sm flex justify-between items-start gap-4">
                      <div>
                        <p className="font-bold text-gray-900 text-lg mb-1">{ex.korean}</p>
                        <p className="text-gray-600 text-sm mb-1">{ex.english}</p>
                        {ex.notes && <p className="text-xs text-green-700 font-medium bg-green-50 inline-block px-2 py-0.5 rounded">Note: {ex.notes}</p>}
                      </div>
                      <button 
                        onClick={() => handlePlayTTS(ex.korean, idx)}
                        className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isPlaying && playingIdx === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-blue-100 hover:text-blue-600'}`}
                      >
                        {isPlaying && playingIdx === idx ? '⏸' : '🔊'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <button 
                onClick={() => setMode('practice')}
                className="w-full py-4 mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
              >
                Let's Practice! →
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
                <p className="font-bold text-lg text-gray-800 text-center">
                  {data.quiz.question}
                </p>
              </div>

              <div className="space-y-3">
                {data.quiz.options.map((opt: string, idx: number) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectAnswer = data.quiz.answer === idx;
                  
                  let btnStyle = "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300";
                  if (isSelected) btnStyle = "bg-blue-50 border-2 border-blue-500 text-blue-700 font-bold";
                  
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
                      disabled={showResult}
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
                  disabled={selectedOption === null}
                  className={`w-full py-4 rounded-xl font-bold text-lg mt-8 transition-colors ${selectedOption !== null ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  Check Answer
                </button>
              ) : (
                <div className="mt-8 space-y-4">
                  <div className={`p-4 rounded-xl text-center font-bold ${selectedOption === data.quiz.answer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedOption === data.quiz.answer ? 'Great job! That is correct. 🎉' : 'Oops, let\'s review the lesson again!'}
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={handleGenerateMore}
                      disabled={isGeneratingQuiz}
                      className="flex-1 py-4 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {isGeneratingQuiz ? (
                        <>
                           <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></span>
                           Generating...
                        </>
                      ) : '✨ Practice More'}
                    </button>
                    <button 
                      onClick={handleClose}
                      className="flex-1 py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-colors"
                    >
                      Finish
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
