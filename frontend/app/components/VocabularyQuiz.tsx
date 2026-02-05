import { useState, useEffect, useCallback } from 'react';
import type { 
  VocabularyItem, 
  QuizQuestion, 
  QuizSession, 
  QuizAnswer, 
  QuizResult,
  QuizMode,
  QuizModeConfig 
} from '@/app/types/vocabulary';

interface VocabularyQuizProps {
  mode: QuizMode;
  config: QuizModeConfig;
  onQuizComplete: (result: QuizResult) => void;
}

export default function VocabularyQuiz({ mode, config, onQuizComplete }: VocabularyQuizProps) {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  // Sample vocabulary data - in real app, this would come from API
  const sampleVocabulary: VocabularyItem[] = [
    {
      id: '1',
      korean: '사랑',
      hanja: '愛',
      meaning: 'love',
      pronunciation: 'sarang',
      level: 1,
      exampleSentence: '나는 너를 사랑해요.',
      exampleTranslation: 'I love you.',
      wordRoot: '사랑하다',
      relatedWords: ['애정', '연애', '우정'],
      difficulty: 'easy',
      category: 'emotions',
      srsData: {
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: new Date(),
        successRate: 0
      }
    },
    {
      id: '2',
      korean: '공부',
      hanja: '工夫',
      meaning: 'study',
      pronunciation: 'gongbu',
      level: 1,
      exampleSentence: '저는 한국어를 공부해요.',
      exampleTranslation: 'I study Korean.',
      wordRoot: '공부하다',
      relatedWords: ['학습', '연구', '교육'],
      difficulty: 'easy',
      category: 'education',
      srsData: {
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: new Date(),
        successRate: 0
      }
    },
    {
      id: '3',
      korean: '행복',
      hanja: '幸福',
      meaning: 'happiness',
      pronunciation: 'haengbok',
      level: 2,
      exampleSentence: '저는 행복해요.',
      exampleTranslation: 'I am happy.',
      wordRoot: '행복하다',
      relatedWords: ['기쁨', '즐거움', '만족'],
      difficulty: 'medium',
      category: 'emotions',
      srsData: {
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: new Date(),
        successRate: 0
      }
    }
  ];

  useEffect(() => {
    initializeQuiz();
  }, []);

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isTimerActive) {
      handleTimeout();
    }
  }, [timeLeft, isTimerActive]);

  const initializeQuiz = () => {
    const questions = generateQuestions();
    const newSession: QuizSession = {
      id: Date.now().toString(),
      questions,
      currentQuestion: 0,
      score: 0,
      totalPoints: 0,
      startTime: new Date(),
      answers: [],
      streak: 0,
      bestStreak: 0
    };
    
    setSession(newSession);
    setCurrentQuestion(questions[0]);
    setTimeLeft(config.timeLimit || 30);
    setIsTimerActive(true);
    setQuestionStartTime(Date.now());
  };

  const generateQuestions = (): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];
    const shuffledVocab = [...sampleVocabulary].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(config.questionCount, shuffledVocab.length); i++) {
      const vocab = shuffledVocab[i];
      const questionType = getRandomQuestionType();
      questions.push(createQuestion(vocab, questionType));
    }
    
    return questions;
  };

  const getRandomQuestionType = (): QuizQuestion['type'] => {
    const types: QuizQuestion['type'][] = ['multiple-choice', 'sentence-fill', 'hanja-match', 'pronunciation'];
    return types[Math.floor(Math.random() * types.length)];
  };

  const createQuestion = (vocab: VocabularyItem, type: QuizQuestion['type']): QuizQuestion => {
    switch (type) {
      case 'multiple-choice':
        return createMultipleChoiceQuestion(vocab);
      case 'sentence-fill':
        return createSentenceFillQuestion(vocab);
      case 'hanja-match':
        return createHanjaMatchQuestion(vocab);
      case 'pronunciation':
        return createPronunciationQuestion(vocab);
      default:
        return createMultipleChoiceQuestion(vocab);
    }
  };

  const createMultipleChoiceQuestion = (vocab: VocabularyItem): QuizQuestion => {
    const options = [vocab.meaning];
    const otherVocabs = sampleVocabulary.filter(v => v.id !== vocab.id);
    
    while (options.length < 4) {
      const randomVocab = otherVocabs[Math.floor(Math.random() * otherVocabs.length)];
      if (!options.includes(randomVocab.meaning)) {
        options.push(randomVocab.meaning);
      }
    }
    
    options.sort(() => Math.random() - 0.5);
    
    return {
      id: `mc-${vocab.id}`,
      type: 'multiple-choice',
      vocabulary: vocab,
      question: `What does "${vocab.korean}" mean?`,
      options,
      correctAnswer: vocab.meaning,
      explanation: `"${vocab.korean}" means "${vocab.meaning}". ${vocab.hanja ? `Hanja: ${vocab.hanja}` : ''}`,
      points: vocab.difficulty === 'easy' ? 10 : vocab.difficulty === 'medium' ? 20 : 30,
      timeLimit: 20
    };
  };

  const createSentenceFillQuestion = (vocab: VocabularyItem): QuizQuestion => {
    const sentence = vocab.exampleSentence.replace(vocab.korean, '___');
    
    return {
      id: `sf-${vocab.id}`,
      type: 'sentence-fill',
      vocabulary: vocab,
      question: `Fill in the blank: "${sentence}"`,
      correctAnswer: vocab.korean,
      explanation: `The correct word is "${vocab.korean}" meaning "${vocab.meaning}". Translation: "${vocab.exampleTranslation}"`,
      points: vocab.difficulty === 'easy' ? 15 : vocab.difficulty === 'medium' ? 25 : 35,
      timeLimit: 25
    };
  };

  const createHanjaMatchQuestion = (vocab: VocabularyItem): QuizQuestion => {
    if (!vocab.hanja) {
      return createMultipleChoiceQuestion(vocab);
    }
    
    const options = [vocab.hanja];
    const otherVocabs = sampleVocabulary.filter(v => v.id !== vocab.id && v.hanja);
    
    while (options.length < 4 && otherVocabs.length > 0) {
      const randomVocab = otherVocabs[Math.floor(Math.random() * otherVocabs.length)];
      if (randomVocab.hanja && !options.includes(randomVocab.hanja)) {
        options.push(randomVocab.hanja);
      }
    }
    
    options.sort(() => Math.random() - 0.5);
    
    return {
      id: `hj-${vocab.id}`,
      type: 'hanja-match',
      vocabulary: vocab,
      question: `What is the Hanja for "${vocab.korean}" (${vocab.meaning})?`,
      options,
      correctAnswer: vocab.hanja,
      explanation: `The Hanja for "${vocab.korean}" is "${vocab.hanja}". This helps understand the word's origin and meaning.`,
      points: 25,
      timeLimit: 20
    };
  };

  const createPronunciationQuestion = (vocab: VocabularyItem): QuizQuestion => {
    const options = [vocab.pronunciation];
    const otherVocabs = sampleVocabulary.filter(v => v.id !== vocab.id);
    
    while (options.length < 4) {
      const randomVocab = otherVocabs[Math.floor(Math.random() * otherVocabs.length)];
      if (!options.includes(randomVocab.pronunciation)) {
        options.push(randomVocab.pronunciation);
      }
    }
    
    options.sort(() => Math.random() - 0.5);
    
    return {
      id: `pr-${vocab.id}`,
      type: 'pronunciation',
      vocabulary: vocab,
      question: `How do you pronounce "${vocab.korean}"?`,
      options,
      correctAnswer: vocab.pronunciation,
      explanation: `"${vocab.korean}" is pronounced "${vocab.pronunciation}". Listen carefully to the native pronunciation.`,
      points: 15,
      timeLimit: 15
    };
  };

  const handleAnswer = () => {
    if (!session || !currentQuestion || !selectedAnswer) return;
    
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const points = isCorrect ? currentQuestion.points : 0;
    
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      timeSpent,
      points
    };
    
    const newAnswers = [...session.answers, answer];
    const newStreak = isCorrect ? session.streak + 1 : 0;
    const newBestStreak = Math.max(newStreak, session.bestStreak);
    
    const updatedSession = {
      ...session,
      answers: newAnswers,
      currentQuestion: session.currentQuestion + 1,
      score: session.score + (isCorrect ? 1 : 0),
      totalPoints: session.totalPoints + points,
      streak: newStreak,
      bestStreak: newBestStreak
    };
    
    setSession(updatedSession);
    setShowResult(true);
    setIsTimerActive(false);
    
    // Move to next question after showing result
    setTimeout(() => {
      if (updatedSession.currentQuestion < session.questions.length) {
        moveToNextQuestion(updatedSession);
      } else {
        completeQuiz(updatedSession);
      }
    }, 2000);
  };

  const moveToNextQuestion = (updatedSession: QuizSession) => {
    const nextQuestion = session.questions[updatedSession.currentQuestion];
    setCurrentQuestion(nextQuestion);
    setSelectedAnswer('');
    setShowResult(false);
    setTimeLeft(config.timeLimit || 30);
    setIsTimerActive(true);
    setQuestionStartTime(Date.now());
  };

  const completeQuiz = (finalSession: QuizSession) => {
    const result: QuizResult = {
      sessionId: finalSession.id,
      totalQuestions: finalSession.questions.length,
      correctAnswers: finalSession.score,
      score: Math.round((finalSession.score / finalSession.questions.length) * 100),
      totalPoints: finalSession.totalPoints,
      timeSpent: Math.floor((Date.now() - finalSession.startTime.getTime()) / 1000),
      averageTimePerQuestion: Math.round(
        finalSession.answers.reduce((sum, ans) => sum + ans.timeSpent, 0) / finalSession.answers.length
      ),
      streak: finalSession.bestStreak,
      bestStreak: finalSession.bestStreak,
      levelUp: false, // Calculate based on XP
      achievements: [] // Calculate based on performance
    };
    
    onQuizComplete(result);
  };

  const handleTimeout = () => {
    if (!session || !currentQuestion) return;
    
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      userAnswer: '',
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: false,
      timeSpent: config.timeLimit || 30,
      points: 0
    };
    
    const updatedSession = {
      ...session,
      answers: [...session.answers, answer],
      currentQuestion: session.currentQuestion + 1,
      streak: 0
    };
    
    setSession(updatedSession);
    setShowResult(true);
    setIsTimerActive(false);
    
    setTimeout(() => {
      if (updatedSession.currentQuestion < session.questions.length) {
        moveToNextQuestion(updatedSession);
      } else {
        completeQuiz(updatedSession);
      }
    }, 2000);
  };

  if (!session || !currentQuestion) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse">
          <div className="w-16 h-16 border-4 border-[var(--background)] border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Quiz Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <span className="bg-[var(--background)] text-white px-3 py-1 rounded-full text-sm font-semibold">
            {mode}
          </span>
          <span className="text-gray-600">
            Question {session.currentQuestion + 1} of {session.questions.length}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="text-yellow-500 mr-1">🔥</span>
            <span className="font-semibold">{session.streak}</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-500 mr-1">⭐</span>
            <span className="font-semibold">{session.totalPoints}</span>
          </div>
          {config.timeLimit && (
            <div className={`flex items-center ${timeLeft < 10 ? 'text-red-500' : 'text-gray-600'}`}>
              <span className="mr-1">⏱️</span>
              <span className="font-mono font-semibold">{timeLeft}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-[var(--background)] h-2 rounded-full transition-all duration-300"
          style={{ width: `${((session.currentQuestion + 1) / session.questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">{currentQuestion.question}</h2>
          <span className="bg-[var(--lemon)] text-black px-2 py-1 rounded-full text-xs font-semibold">
            {currentQuestion.points} pts
          </span>
        </div>

        {/* Vocabulary Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold text-[var(--background)]">
              {currentQuestion.vocabulary.korean}
            </span>
            {currentQuestion.vocabulary.hanja && (
              <span className="text-xl text-gray-600">
                ({currentQuestion.vocabulary.hanja})
              </span>
            )}
            <span className="text-gray-500">
              [{currentQuestion.vocabulary.pronunciation}]
            </span>
          </div>
        </div>

        {/* Answer Options */}
        {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedAnswer(option)}
                disabled={showResult}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${
                  showResult
                    ? option === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : option === selectedAnswer
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                    : selectedAnswer === option
                    ? 'border-[var(--background)] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <span className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3 text-sm font-semibold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                  {showResult && option === currentQuestion.correctAnswer && (
                    <span className="ml-auto text-green-500">✓</span>
                  )}
                  {showResult && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                    <span className="ml-auto text-red-500">✗</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Text Input for other question types */}
        {(currentQuestion.type === 'sentence-fill' || currentQuestion.type === 'hanja-match') && (
          <div className="space-y-4">
            <input
              type="text"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              disabled={showResult}
              placeholder="Type your answer here..."
              className={`w-full p-4 border-2 rounded-lg text-lg ${
                showResult
                  ? selectedAnswer === currentQuestion.correctAnswer
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-[var(--background)]'
              }`}
            />
            {showResult && (
              <div className="text-center">
                <span className="text-green-600 font-semibold">
                  Correct: {currentQuestion.correctAnswer}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explanation */}
      {showResult && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Action Button */}
      {!showResult && (
        <button
          onClick={handleAnswer}
          disabled={!selectedAnswer}
          className="w-full py-3 bg-[var(--background)] text-white rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[var(--lightblue)] transition-colors duration-200"
        >
          Submit Answer
        </button>
      )}
    </div>
  );
}