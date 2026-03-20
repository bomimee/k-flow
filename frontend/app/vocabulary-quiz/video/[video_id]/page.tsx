"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ModernNavigation from "@/app/components/ModernNavigation";
import type { VocabularyItem } from "@/app/types/vocabulary";

interface QuizQuestion {
  word: string;
  meaning: string;
  options: string[];
  correct: number;
  expression?: string; // key expression this word belongs to
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(analysis: any): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const allWords: { word: string; meaning: string }[] = [];

  // 1. vocabulary_by_category에서 단어 수집
  const vocabByCategory = analysis?.vocabulary_by_category || {};
  for (const category of Object.values(vocabByCategory)) {
    if (Array.isArray(category)) {
      for (const item of category as any[]) {
        if (item.word && item.meaning) {
          allWords.push({ word: item.word, meaning: item.meaning });
        }
      }
    }
  }

  // 2. key_expressions도 포함
  const expressions = analysis?.key_expressions || [];
  for (const expr of expressions) {
    if (expr.expression && expr.meaning_en) {
      allWords.push({ word: expr.expression, meaning: expr.meaning_en });
    }
  }

  if (allWords.length < 2) return [];

  // 3. 퀴즈 문항 생성 (한국어 → 영어 뜻 맞추기)
  for (const item of allWords) {
    // 오답 보기: 다른 단어들의 meaning에서 3개 랜덤 선택
    const distractors = shuffleArray(
      allWords.filter((w) => w.word !== item.word)
    )
      .slice(0, 3)
      .map((w) => w.meaning);

    const options = shuffleArray([item.meaning, ...distractors]);
    const correct = options.indexOf(item.meaning);

    questions.push({
      word: item.word,
      meaning: item.meaning,
      options,
      correct,
    });
  }

  return shuffleArray(questions);
}

export default function VideoVocabQuizPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.video_id as string;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/video-analyses/${videoId}`
        );
        if (!res.ok) throw new Error("분석 결과를 찾을 수 없습니다.");
        const data = await res.json();
        const analysis = data.analysis;
        setVideoTitle(analysis?.video_context?.topic || "YouTube Video");
        const qs = buildQuestions(analysis);
        if (qs.length === 0) {
          setError("이 영상에서 퀴즈 문항을 만들 수 없습니다. 단어가 부족합니다.");
        } else {
          setQuestions(qs);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [videoId]);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowFeedback(true);
    if (idx === questions[current].correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    setSelected(null);
    setShowFeedback(false);
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const handleRestart = () => {
    setQuestions((qs) => shuffleArray(qs));
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setShowFeedback(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-gradient, #CDE4F0)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--lemon)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#1E3A5F] font-semibold">퀴즈 준비 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ background: "#CDE4F0" }}>
        <ModernNavigation />
        <main className="max-w-xl mx-auto px-6 py-20 text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">퀴즈를 불러올 수 없어요</h2>
          <p className="text-[#1E3A5F]/70 mb-8">{error}</p>
          <button onClick={() => router.back()} className="px-6 py-3 bg-[#1E3A5F] text-white rounded-full font-semibold hover:opacity-80 transition">
            돌아가기
          </button>
        </main>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen" style={{ background: "#CDE4F0" }}>
        <ModernNavigation />
        <main className="max-w-lg mx-auto px-6 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-10">
            <div className="text-6xl mb-4">{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "📚"}</div>
            <h2 className="text-3xl font-bold text-[#1E3A5F] mb-1">퀴즈 완료!</h2>
            <p className="text-gray-500 text-sm mb-6">{videoTitle}</p>
            <div className="text-7xl font-black mb-2" style={{ color: pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444" }}>
              {pct}%
            </div>
            <p className="text-gray-600 mb-8">
              {questions.length}문항 중 <span className="font-bold text-[#1E3A5F]">{score}개</span> 정답
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button onClick={handleRestart} className="px-6 py-3 border-2 border-[#1E3A5F] text-[#1E3A5F] rounded-full font-semibold hover:bg-[#1E3A5F] hover:text-white transition">
                다시 풀기
              </button>
              <button onClick={() => router.push("/my-videos")} className="px-6 py-3 bg-[var(--lemon,#EFF889)] text-[#1E3A5F] rounded-full font-bold hover:opacity-80 transition">
                내 영상 목록
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current) / questions.length) * 100;

  return (
    <div className="min-h-screen" style={{ background: "#CDE4F0" }}>
      <ModernNavigation />
      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* 헤더 */}
        <div className="mb-6">
          <p className="text-sm text-[#1E3A5F]/60 mb-1">📺 {videoTitle}</p>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-[#1E3A5F]">
              {current + 1} / {questions.length}
            </span>
            <span className="text-sm font-semibold text-[#1E3A5F]">
              🎯 {score}점
            </span>
          </div>
          <div className="h-2 bg-white/40 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "var(--lemon, #EFF889)" }}
            />
          </div>
        </div>

        {/* 문제 카드 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2 font-semibold">
            한국어 → 영어 뜻
          </p>
          <h2 className="text-4xl font-black text-[#1E3A5F] mb-8 text-center">
            {q.word}
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {q.options.map((opt, idx) => {
              let cls =
                "w-full text-left px-5 py-4 rounded-xl border-2 font-semibold transition-all text-base ";
              if (showFeedback) {
                if (idx === q.correct) {
                  cls += "border-green-500 bg-green-50 text-green-700";
                } else if (idx === selected) {
                  cls += "border-red-400 bg-red-50 text-red-600";
                } else {
                  cls += "border-gray-200 text-gray-400";
                }
              } else {
                cls +=
                  "border-gray-200 hover:border-[#1E3A5F] hover:bg-[#CDE4F0]/30 text-[#1E3A5F] cursor-pointer";
              }
              return (
                <button key={idx} className={cls} onClick={() => handleSelect(idx)}>
                  <span className="mr-3 text-gray-400 font-normal">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* 다음 버튼 */}
        {showFeedback && (
          <div className="text-center">
            <div className={`text-lg font-bold mb-4 ${selected === q.correct ? "text-green-600" : "text-red-500"}`}>
              {selected === q.correct ? "✅ 정답!" : `❌ 오답 — 정답: ${q.meaning}`}
            </div>
            <button
              onClick={handleNext}
              className="px-10 py-3 rounded-full font-bold text-[#1E3A5F] hover:opacity-80 transition-all shadow-lg"
              style={{ background: "var(--lemon, #EFF889)" }}
            >
              {current + 1 >= questions.length ? "결과 보기 →" : "다음 문항 →"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
