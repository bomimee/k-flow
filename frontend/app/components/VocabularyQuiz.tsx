import { useState, useEffect, useCallback } from 'react';

// ── Korean morphology helpers ─────────────────────────────────────────────────

/**
 * Extract the verb/adjective stem from a Korean dictionary form.
 * e.g. "다르다" → "다르", "먹다" → "먹", "아름답다" → "아름답"
 */
function koreanStem(word: string): string {
  // Remove 다 ending (dictionary form)
  if (word.endsWith('다')) return word.slice(0, -1);
  return word;
}

/**
 * Convert irregular stems for comparison.
 * Handles the most common irregular patterns:
 *  르 irregular: 다르 → 달 (달라요, 달랐다…)
 *  ㅂ irregular: 아름답 → 아름다 (아름다워요…)
 *  ㄷ irregular: 걷 → 걸 (걸어요…)
 */
function normalizeStem(stem: string): string {
  // 르 irregular: 다르 → 달
  if (stem.endsWith('르')) return stem.slice(0, -1) + '달'[0]; // 다르 → 다 + ㄹ pattern
  return stem;
}

/**
 * Check whether a user's answer is morphologically related to the correct Korean word.
 * Strategy:
 *  1. Exact match (after trimming / lowercasing)
 *  2. Both start with the same stem (≥2 chars)
 *  3. The input is at least 2 chars and the correct answer starts with the input
 *  4. 르-irregular: 달- prefix check for 다르다 family
 */
function isMorphologicallyCorrect(userInput: string, correctWord: string): boolean {
  const u = userInput.trim();
  const c = correctWord.trim();
  if (!u || !c) return false;

  // 1. Exact
  if (u === c) return true;

  const uStem = koreanStem(u);   // user may type 먹어 → stem = 먹어 (no 다)
  const cStem = koreanStem(c);   // 먹다 → 먹

  // 2. Correct stem starts with user stem (user typed stem)
  if (cStem.length >= 2 && u.startsWith(cStem)) return true;
  if (uStem.length >= 2 && cStem.startsWith(uStem)) return true;

  // 3. Both share at least a 2-char prefix stem
  const minLen = Math.min(cStem.length, uStem.length);
  if (minLen >= 2 && cStem.slice(0, minLen) === uStem.slice(0, minLen)) return true;

  // 4. 르 irregular: 다르다 → 달*  /  모르다 → 몰*
  if (cStem.endsWith('르')) {
    const base = cStem.slice(0, -1); // 다
    // 달, 달라, 달랐 …
    const irregularBase = base + '달'[0]; // rough: same first char + ㄹ
    // Simpler: check if user answer starts with base+'ㄹ' glyph — use string prefix trick
    // "다르다" irregular conjugates start with the vowel before 르 + ㄹ
    // e.g. 다르 → 달*, 모르 → 몰*, 부르 → 불*
    const vowelChar = cStem[cStem.length - 2]; // char before 르
    // Build expected irregular prefix: take all chars before 르, last char loses 받침
    // This is complex; use a simpler heuristic: the user answer starts with
    // the same chars as the stem minus the last syllable + ㄹ-family
    if (cStem.length >= 2) {
      const prefix = cStem.slice(0, -2); // chars before the vowel+르
      if (prefix && u.startsWith(prefix)) return true;
    }
  }

  return false;
}

/**
 * Find the conjugated form of a Korean word appearing in a sentence.
 * Returns { matched: string, sentence: string with ___ } or null.
 */
function findKoreanWordInSentence(
  sentence: string,
  dictForm: string
): { matched: string; blankedSentence: string } | null {
  // 1. Direct match first
  if (sentence.includes(dictForm)) {
    return {
      matched: dictForm,
      blankedSentence: sentence.replace(dictForm, '___'),
    };
  }

  // 2. Try matching by stem prefix (2–N chars)
  const stem = koreanStem(dictForm);

  // Split sentence into Korean word tokens (keep punctuation attached for replacement)
  const tokens = sentence.match(/[가-힣]+[.!?,]?/g) || [];

  for (const token of tokens) {
    const word = token.replace(/[.!?,]$/, '');
    if (word.length >= 2 && word.startsWith(stem.slice(0, 2))) {
      return {
        matched: token,
        blankedSentence: sentence.replace(token, '___'),
      };
    }
    // 르 irregular: 다르다 → 달라요 etc.
    if (stem.endsWith('르') && stem.length >= 2) {
      const base = stem.slice(0, -2); // before the X+르
      if (base && word.startsWith(base)) {
        return {
          matched: token,
          blankedSentence: sentence.replace(token, '___'),
        };
      }
    }
  }

  return null;
}
import type {
  VocabularyItem,
  QuizQuestion,
  QuizSession,
  QuizAnswer,
  QuizResult,
  QuizMode,
  QuizModeConfig
} from '@/app/types/vocabulary';
import { fetchMixedQuizWords } from '@/app/services/vocabulary';
import { useAuth } from '@/app/hooks/useAuth';

interface VocabularyQuizProps {
  mode: QuizMode;
  config: QuizModeConfig;
  onQuizComplete: (result: QuizResult) => void;
}

export default function VocabularyQuiz({ mode, config, onQuizComplete }: VocabularyQuizProps) {
  const { user } = useAuth();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedWordCount, setSavedWordCount] = useState(0);

  useEffect(() => {
    async function loadQuiz() {
      try {
        setIsLoading(true);
        const result = await fetchMixedQuizWords({
          userId: user?.id,
          level: config.levelRange ? config.levelRange[0] : 1,
          categories: config.categories,
          limit: config.questionCount,
        });

        const fetchedVocab = result.items;
        setSavedWordCount(result.saved_count);

        if (fetchedVocab.length === 0) {
          throw new Error('No vocabulary found for this level.');
        }

        initializeQuiz(fetchedVocab);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load quiz:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setIsLoading(false);
      }
    }

    loadQuiz();
  }, [mode, config]);

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isTimerActive) {
      handleTimeout();
    }
  }, [timeLeft, isTimerActive]);

  const initializeQuiz = (vocabData: VocabularyItem[]) => {
    const questions = generateQuestions(vocabData);
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

  const generateQuestions = (vocabData: VocabularyItem[]): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];
    const shuffledVocab = [...vocabData].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(config.questionCount, shuffledVocab.length); i++) {
      const vocab = shuffledVocab[i];
      const questionType = getRandomQuestionType(vocab);
      questions.push(createQuestion(vocab, questionType, vocabData));
    }

    return questions;
  };

  const getRandomQuestionType = (vocab: VocabularyItem): QuizQuestion['type'] => {
    const availableTypes: QuizQuestion['type'][] = ['multiple-choice'];
    // Only add sentence-fill if an example sentence exists
    if (vocab.exampleSentence) {
      availableTypes.push('sentence-fill');
    }
    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  };

  const createQuestion = (vocab: VocabularyItem, type: QuizQuestion['type'], allVocab: VocabularyItem[]): QuizQuestion => {
    switch (type) {
      case 'multiple-choice':
        return createMultipleChoiceQuestion(vocab, allVocab);
      case 'sentence-fill':
        return createSentenceFillQuestion(vocab);
      default:
        return createMultipleChoiceQuestion(vocab, allVocab);
    }
  };

  const createMultipleChoiceQuestion = (vocab: VocabularyItem, allVocab: VocabularyItem[]): QuizQuestion => {
    const options = [vocab.meaning];
    const otherVocabs = allVocab.filter(v => v.id !== vocab.id);

    while (options.length < 4 && otherVocabs.length > options.length - 1) {
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
      explanation: `"${vocab.korean}" means "${vocab.meaning}".`,
      points: vocab.difficulty === 'easy' ? 10 : vocab.difficulty === 'medium' ? 20 : 30,
      timeLimit: 20
    };
  };

  const createSentenceFillQuestion = (vocab: VocabularyItem): QuizQuestion => {
    const exampleSentence = vocab.exampleSentence || '';

    // Try to find the conjugated (or base) form in the example sentence
    const found = findKoreanWordInSentence(exampleSentence, vocab.korean);
    const blankedSentence = found ? found.blankedSentence : exampleSentence + ' (___)';
    const matchedForm = found ? found.matched.replace(/[.!?,]$/, '') : vocab.korean;

    return {
      id: `sf-${vocab.id}`,
      type: 'sentence-fill',
      vocabulary: vocab,
      question: `Fill in the blank: "${blankedSentence}"`,
      // Store both: correctAnswer = dictionary form, acceptedForm = what actually appears
      correctAnswer: vocab.korean,
      // Used for display hint in explanation
      explanation: `The correct word is "${vocab.korean}" meaning "${vocab.meaning}". ` +
        (matchedForm !== vocab.korean ? `"${matchedForm}" is also accepted (conjugated form). ` : '') +
        `Translation: "${vocab.exampleTranslation}"`,
      points: vocab.difficulty === 'easy' ? 15 : vocab.difficulty === 'medium' ? 25 : 35,
      timeLimit: 25
    };
  };

  const handleAnswer = () => {
    if (!session || !currentQuestion || !selectedAnswer) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    // For sentence-fill, accept morphological variants (활용형)
    const isCorrect = currentQuestion.type === 'sentence-fill'
      ? isMorphologicallyCorrect(selectedAnswer, currentQuestion.correctAnswer)
      : selectedAnswer === currentQuestion.correctAnswer;
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
      score: session.score + (isCorrect ? 1 : 0),
      totalPoints: session.totalPoints + points,
      streak: newStreak,
      bestStreak: newBestStreak
    };

    setSession(updatedSession);
    setShowResult(true);
    setIsTimerActive(false);

    // Manual transition - removed setTimeout
  };

  const handleNext = () => {
    if (!session) return;

    const nextIndex = session.currentQuestion + 1;
    const updatedSession = {
      ...session,
      currentQuestion: nextIndex
    };

    setSession(updatedSession);

    if (nextIndex < session.questions.length) {
      moveToNextQuestion(updatedSession);
    } else {
      completeQuiz(updatedSession);
    }
  };

  const moveToNextQuestion = (updatedSession: QuizSession) => {
    const nextQuestion = updatedSession.questions[updatedSession.currentQuestion];
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

    // Manual transition - removed setTimeout
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin mb-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <p className="text-gray-600 font-medium">Fetching vocabulary for your level...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Quiz</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary px-6 py-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Initializing session...</p>
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

        {/* Answer Options / Hint Area */}
        {currentQuestion.type === 'multiple-choice' && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="text-gray-500">
                  [{currentQuestion.vocabulary.pronunciation}]
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(option)}
                  disabled={showResult}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${showResult
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
          </div>
        )}

        {currentQuestion.type === 'sentence-fill' && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="text-gray-500">
                  [{currentQuestion.vocabulary.meaning}]
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                disabled={showResult}
                placeholder="Type your answer here..."
                className={`w-full p-4 border-2 rounded-lg text-lg ${showResult
                  ? isMorphologicallyCorrect(selectedAnswer, currentQuestion.correctAnswer)
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-[var(--background)]'
                  }`}
              />
              {showResult && (
                <div className="text-center space-y-1">
                  {isMorphologicallyCorrect(selectedAnswer, currentQuestion.correctAnswer) ? (
                    <span className="text-green-600 font-semibold">✅ 정답! ({selectedAnswer})</span>
                  ) : (
                    <>
                      <span className="text-red-500 font-semibold">❌ 오답</span>
                      <p className="text-sm text-gray-600">
                        정답: <strong>{currentQuestion.correctAnswer}</strong>
                        &nbsp;— 활용형도 정답이에요 (예: 달라요, 다르지, 다르면…)
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
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
      <div className="mt-6">
        <button
          onClick={showResult ? handleNext : handleAnswer}
          disabled={!selectedAnswer && !showResult}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-md ${!selectedAnswer && !showResult
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : showResult
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
        >
          {showResult
            ? (session.currentQuestion + 1 === session.questions.length ? "Finish Quiz" : "Next Question")
            : "Submit Answer"}
        </button>
      </div>
    </div>
  );
}
