"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { analyzeYouTube } from "@/app/services/youtube";
import type { AnalysisResult } from "@/app/types/analysis";
import Header from "../components/Header";


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

  useEffect(() => {
    if (!url) return;

    const run = async () => {
      setLoading(true)
      // const data = await analyzeYouTube(url);
      // setResult(data);
      setResult(DATA)
      setLoading(false);
    };

    run();
  }, [url]);

  if (loading) return <p>Analyzing...</p>;
  if (!result) return <p>No result</p>;

  return (
    <>
      <Header />
      <div className="space-y-8 text-black">
        <div className="rounded-lg p-4 bg-[var(--lemon)] shadow">
          <p className="text-sm text-black-500">YouTube Analysis</p>
          <p className="font-semibold">Video ID: {result.video_id}</p>

          <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
            {result.source}
          </span>
        </div>

        {/* Key Expressions */}
        <section>
          <h3 className="text-xl font-bold mb-4">📌 Key Expressions</h3>
          <div className="space-y-3">
            {result.analysis.key_expressions.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg p-4 hover:bg-gray-100 transition bg-[var(--lemon)]"
              >
                <p className="text-lg font-semibold">{item.expression}</p>
                <p className="text-sm text-gray-600">{item.meaning_en}</p>
                <p className="mt-2 text-sm text-blue-600">
                  💡 {item.usage_note}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Grammar */}
        <section>
          <h3 className="text-xl font-bold mb-4">🧩 Grammar Points</h3>
          <div className="space-y-3">
            {result.analysis.grammar_points.map((g, idx) => (
              <div key={idx} className="rounded-lg p-4 bg-[var(--lemon)]">
                <p className="font-semibold text-purple-700">{g.pattern}</p>
                <p className="text-sm text-gray-700 mt-1">{g.explanation_en}</p>
                <p className="mt-2 text-sm bg-purple-50 p-2 rounded">
                  📘 {g.example_sentence}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Practice */}
        <section>
          <h3 className="text-xl font-bold mb-4">✍️ Practice</h3>
          <div className="space-y-3">
            {result.analysis.practice_sentences.map((p, idx) => (
              <div key={idx} className="rounded-lg p-4 bg-[var(--lemon)]">
                <p className="text-lg">{p.korean}</p>
                <p className="text-sm text-gray-500 mt-1">{p.english}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
