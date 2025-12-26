"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { analyzeYouTube } from "@/app/services/youtube";
import type { AnalysisResult } from "@/app/types/analysis";
import Header from "../components/Header";
import LearninPoint from "../components/LearningPoint";
import AnalysisSection from "../components/AnalysisSection";

const DATA = {
  video_id: "n19R1Uv9YHY",
  source: "subtitle",
  analysis: {
    key_expressions: [
      {
        expression: "안녕하세요",
        meaning_en: "Hello",
        usage_note: "A common greeting used in various contexts.",
      },
      {
        expression: "요즘",
        meaning_en: "These days",
        usage_note: "Used to refer to the current time period.",
      },
      {
        expression: "맛있게",
        meaning_en: "Deliciously",
        usage_note: "Used to describe how something is eaten or prepared.",
      },
      {
        expression: "잘 어울리다",
        meaning_en: "To go well with",
        usage_note: "Used to express compatibility between flavors or items.",
      },
    ],
    grammar_points: [
      {
        pattern: "아/어 주다",
        explanation_en:
          "This pattern is used to indicate doing something for someone else's benefit.",
        example_sentence: "이걸 갈 다음에 달걀 노른자랑 내 먼저 쓸어줄 거예요.",
      },
      {
        pattern: "고 있다",
        explanation_en: "This pattern is used to indicate an ongoing action.",
        example_sentence: "지금 바로 알려드리겠습니다.",
      },
      {
        pattern: "기 위해서",
        explanation_en: "This phrase is used to indicate purpose or intention.",
        example_sentence:
          "최대한 낭비하는 부분이 없게 하려고 노력을 많이 해요.",
      },
    ],
    practice_sentences: [
      {
        korean: "요즘 채식하시는 분들 많이 계시죠?",
        english: "These days, there are many people who are vegetarian, right?",
      },
      {
        korean: "이 요리 잘 어울릴 것 같아요.",
        english: "I think this dish will go well.",
      },
      {
        korean: "안녕하세요, 오늘은 어떤 요리를 할까요?",
        english: "Hello, what dish shall we make today?",
      },
    ],
  },
};

export default function Result() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [flippedStates, setFlippedStates] = useState<boolean[]>([]);
  const [activeSection, setActiveSection] = useState<string>("Key Expressions");

  const toggleFlip = (index: number) => {
    setFlippedStates((prev) => {
      const newStates = [...prev];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };
  useEffect(() => {
    // Result 페이지에서만 배경색 변경
    document.body.classList.add("bg-result");

    // 페이지를 떠날 때 원래 상태로 복구
    return () => {
      document.body.classList.remove("bg-result");
    };
  }, []);

  useEffect(() => {
    if (!url) return;

    const run = async () => {
      setLoading(true);
      // const data = await analyzeYouTube(url);
      // setResult(data);
      setResult(DATA);
      setLoading(false);
      setFlippedStates(result?.analysis.grammar_points.map(() => false) || []);
    };

    run();
  }, [url]);

  if (loading) return <p>Analyzing...</p>;
  if (!result) return <p>No result</p>;

  return (
    <>
      <Header />
      <div className="space-y-8 text-center">
        <h1 className="font-bold text-3xl text-[var(--brown)]">
          Video Title: 유투브 제목넣기
        </h1>
        <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
          {result.source}
        </span>
        <div className="flex justify-center items-center gap-4 mt-10">
          <LearninPoint
            title="Key Expressions"
            active={activeSection === "Key Expressions"}
            onClick={() => setActiveSection("Key Expressions")}
          />
          <LearninPoint
            title="Grammar Points"
            active={activeSection === "Grammar Points"}
            onClick={() => setActiveSection("Grammar Points")}
          />
          <LearninPoint
            title="Practice"
            active={activeSection === "Practice"}
            onClick={() => setActiveSection("Practice")}
          />
        </div>

        {activeSection === "Key Expressions" && (
          <AnalysisSection
            title="Key Expressions"
            items={result.analysis.key_expressions}
            type="key_expression"
          />
        )}

        {activeSection === "Grammar Points" && (
          <AnalysisSection
            title="Grammar Points"
            items={result.analysis.grammar_points}
            type="grammar_point"
            flippedStates={flippedStates}
            onToggleFlip={toggleFlip}
          />
        )}

        {activeSection === "Practice" && (
          <AnalysisSection
            title="Practice"
            items={result.analysis.practice_sentences}
            type="practice"
          />
        )}
      </div>
    </>
  );
}
