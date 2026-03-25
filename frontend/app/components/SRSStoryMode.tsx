"use client";

import { useState, useEffect } from "react";
import type { SRSStudyResults } from "@/app/types/vocabulary";
import { updateSRSProgress } from "@/app/services/srs";
import { SpacedRepetitionSystem } from "@/app/services/spacedRepetition";
import { useAuth } from "@/app/hooks/useAuth";

interface StoryWord {
  id: string;
  word: string;
  meaning: string;
  pronunciation: string;
}

interface HighlightedWord {
  word: string;
  meaning: string;
  pronunciation: string;
  context_sentence: string;
}

interface QuizItem {
  word: string;
  question: string;
  options: string[];
  answer: string;
}

interface StoryData {
  title: string;
  story: string;
  translation: string;
  highlighted_words: HighlightedWord[];
  quiz: QuizItem[];
  words_used: StoryWord[];
}

interface SRSStoryModeProps {
  userId: string;
  onSessionComplete: (results: SRSStudyResults) => void;
  onBack: () => void;
}

type Phase = "loading" | "reading" | "quiz" | "complete";

export default function SRSStoryMode({
  userId,
  onSessionComplete,
  onBack,
}: SRSStoryModeProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedWord, setSelectedWord] = useState<HighlightedWord | null>(null);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<
    Array<{ word: string; correct: boolean }>
  >([]);

  const { user } = useAuth();

  useEffect(() => {
    fetchStory();
  }, [userId]);

  const fetchStory = async () => {
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/srs/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, word_limit: 5 }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Story generation failed");
      }
      const data: StoryData = await res.json();
      setStoryData(data);
      setPhase("reading");
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message || "Unknown error");
      setPhase("reading");
    }
  };

  // 스토리 텍스트에서 복습 단어 하이라이트
  const renderHighlightedStory = (text: string) => {
    if (!storyData?.highlighted_words?.length) return <p>{text}</p>;

    const wordsToHighlight = storyData.highlighted_words.map((hw) => hw.word);
    // 단어 경계로 분리
    const escapedWords = wordsToHighlight.map((w) =>
      w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    const pattern = new RegExp(`(${escapedWords.join("|")})`, "g");
    const parts = text.split(pattern);

    return (
      <p className="text-lg leading-relaxed text-gray-800">
        {parts.map((part, i) => {
          const match = storyData.highlighted_words.find(
            (hw) => hw.word === part
          );
          if (match) {
            return (
              <button
                key={i}
                onClick={() =>
                  setSelectedWord(selectedWord?.word === match.word ? null : match)
                }
                className="inline-block mx-0.5 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-bold hover:bg-indigo-200 transition-colors border-b-2 border-indigo-400 cursor-pointer"
              >
                {part}
              </button>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    );
  };

  const handleStartQuiz = () => {
    setPhase("quiz");
    setQuizIndex(0);
    setSelectedOption(null);
    setQuizAnswers([]);
  };

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return; // 이미 선택됨
    setSelectedOption(option);
  };

  const handleNextQuestion = async () => {
    if (!storyData || !selectedOption) return;
    const currentQuiz = storyData.quiz[quizIndex];
    const isCorrect = selectedOption === currentQuiz.answer;
    const newAnswers = [
      ...quizAnswers,
      { word: currentQuiz.word, correct: isCorrect },
    ];
    setQuizAnswers(newAnswers);

    // SRS 업데이트
    if (user) {
      const wordUsed = storyData.words_used.find(
        (w) => w.word === currentQuiz.word
      );
      if (wordUsed?.id) {
        const quality = isCorrect ? 4 : 1;
        const fakeSrsData = {
          interval: 1,
          repetitions: 0,
          easeFactor: 2.5,
          nextReview: new Date(),
          lastReview: new Date(),
          successRate: isCorrect ? 1 : 0,
        };
        const updated = SpacedRepetitionSystem.calculateNextReview(
          fakeSrsData,
          quality
        );
        updateSRSProgress(user.id, wordUsed.id, updated);
      }
    }

    if (quizIndex + 1 < storyData.quiz.length) {
      setQuizIndex(quizIndex + 1);
      setSelectedOption(null);
    } else {
      // 완료
      const correct = newAnswers.filter((a) => a.correct).length;
      const avgQuality = correct / newAnswers.length >= 0.6 ? 4 : 2;
      onSessionComplete({
        itemsStudied: newAnswers.length,
        correctAnswers: correct,
        totalTimeSpent: 0,
        averageQuality: avgQuality,
        itemsUpdated: [],
      });
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-3xl animate-bounce">✍️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            AI is writing a story with today's words
          </h2>
          <p className="text-gray-500 text-sm">
            Creating a short story with the words you need to review
          </p>
        </div>
        <div className="flex justify-center gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 text-center">
        <p className="text-4xl mb-4">😕</p>
        <h2 className="text-xl font-bold text-red-600 mb-2">
          Failed to generate story
        </h2>
        <p className="text-gray-500 mb-6 text-sm">{error}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={fetchStory}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
          >
            Try again
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // ── Reading Mode ─────────────────────────────────────────────────────────
  if (phase === "reading" && storyData) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 text-sm"
          >
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-semibold">
              ✨ AI Story Mode
            </span>
          </div>
        </div>

        {/* Story Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Title bar */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
              Today's Story
            </p>
            <h2 className="text-white text-2xl font-bold">
              {storyData.title}
            </h2>
          </div>

          {/* Words used chips */}
          <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex flex-wrap gap-2">
            <span className="text-xs text-indigo-500 font-semibold mr-1 self-center">
              Today's Words:
            </span>
            {storyData.words_used.map((w) => (
              <span
                key={w.id}
                className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-full font-medium"
              >
                {w.word}
              </span>
            ))}
          </div>

          {/* Story text */}
          <div className="px-6 py-6">
            <div className="prose max-w-none">
              {renderHighlightedStory(storyData.story)}
            </div>

            {/* Word popup */}
            {selectedWord && (
              <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-indigo-800 text-lg">
                      {selectedWord.word}
                    </p>
                    <p className="text-sm text-indigo-500">
                      [{selectedWord.pronunciation}]
                    </p>
                    <p className="text-gray-700 mt-1">{selectedWord.meaning}</p>
                  </div>
                  <button
                    onClick={() => setSelectedWord(null)}
                    className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500 italic">
                  &ldquo;{selectedWord.context_sentence}&rdquo;
                </p>
              </div>
            )}

            {/* Translation toggle */}
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="mt-4 text-sm text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1"
            >
              {showTranslation ? "▲ 번역 숨기기" : "▼ 번역 보기"}
            </button>
            {showTranslation && (
              <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {storyData.translation}
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="px-6 pb-6">
            <button
              onClick={handleStartQuiz}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>📝</span>
              <span>Start Quiz</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz Mode ─────────────────────────────────────────────────────────────
  if (phase === "quiz" && storyData) {
    const currentQuiz = storyData.quiz[quizIndex];
    const progress = ((quizIndex + 1) / storyData.quiz.length) * 100;
    const isAnswered = !!selectedOption;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              Question {quizIndex + 1} / {storyData.quiz.length}
            </span>
            <span className="font-semibold text-indigo-600">
              ✨ Story Quiz
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quiz Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider mb-1">
            Today's Words
          </p>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">
            {currentQuiz.word}
          </h3>
          <p className="text-gray-600 mb-6">{currentQuiz.question}</p>

          <div className="space-y-3">
            {currentQuiz.options.map((option) => {
              const isCorrect = option === currentQuiz.answer;
              const isSelected = option === selectedOption;

              let style =
                "w-full py-4 px-5 text-left rounded-xl border-2 font-medium transition-all ";
              if (!isAnswered) {
                style +=
                  "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer";
              } else if (isCorrect) {
                style += "border-green-500 bg-green-50 text-green-800";
              } else if (isSelected && !isCorrect) {
                style += "border-red-400 bg-red-50 text-red-800";
              } else {
                style += "border-gray-100 bg-gray-50 text-gray-400";
              }

              return (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  className={style}
                  disabled={isAnswered}
                >
                  <span className="flex items-center gap-3">
                    {isAnswered && isCorrect && (
                      <span className="text-green-500">✓</span>
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <span className="text-red-500">✗</span>
                    )}
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <button
              onClick={handleNextQuestion}
              className="mt-6 w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              {quizIndex + 1 < storyData.quiz.length
                ? "Next Question →"
                : "View Results 🎉"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
