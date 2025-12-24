"use client";
// frontend/src/app/practice/page.tsx
import type { AnalysisResult } from "@/app/types/analysis";

import { useState } from "react";
import { analyzeYouTube } from "../services/youtube";
import ResultResponse from "../components/result";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Input from "../components/Input";

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
export default function PracticePage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    // const data = await analyzeYouTube(url);
    setResult(DATA);
  };

  return (
    <>
      <Header />
      <section className="space-y-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-black mt-30">please provide a youtube link below ⬇</h2>
        <Input
          link=""
          text="Go"
          value={url}
          onChange={setUrl}
          onAnalyze={handleAnalyze}
        />
        {result && <ResultResponse result={result} />}
      </section>
    </>
  );
}
