"use client";
// frontend/src/app/practice/page.tsx
import type { AnalysisResult } from "@/app/types/analysis";


import { useState } from "react";
import { analyzeYouTube } from "../services/youtube";

export default function PracticePage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null >(null);

  const handleAnalyze = async () => {
    const data = await analyzeYouTube(url);
      console.log(data, "data")
    setResult(data);
  };

  return (
    <section className="space-y-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold">YouTube Korean Analyzer</h2>

      <input
        className="w-full border p-2 rounded"
        placeholder="Paste Korean YouTube link"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button
        className="bg-black text-white px-4 py-2 rounded"
        onClick={handleAnalyze}
      >
        Analyze
      </button>

      {result && (
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </section>
  );
}
