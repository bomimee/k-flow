'use client';

import React from 'react';
import type { AnalysisResult } from '@/app/types/analysis';

interface ResultResponseProps {
  result: AnalysisResult;
}

export default function ResultResponse({ result }: ResultResponseProps) {
  const { video_id, source, analysis } = result;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border rounded-lg p-4 bg-white shadow">
        <p className="text-sm text-gray-500">YouTube Analysis</p>
        <p className="font-semibold">Video ID: {video_id}</p>

        <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
          {source}
        </span>
      </div>

      {/* Key Expressions */}
      <section>
        <h3 className="text-xl font-bold mb-4">📌 Key Expressions</h3>
        <div className="space-y-3">
          {analysis.key_expressions.map((item, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
            >
              <p className="text-lg font-semibold">{item.expression}</p>
              <p className="text-sm text-gray-600">{item.meaning_en}</p>
              <p className="mt-2 text-sm text-blue-600">💡 {item.usage_note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Grammar */}
      <section>
        <h3 className="text-xl font-bold mb-4">🧩 Grammar Points</h3>
        <div className="space-y-3">
          {analysis.grammar_points.map((g, idx) => (
            <div key={idx} className="border rounded-lg p-4">
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
          {analysis.practice_sentences.map((p, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <p className="text-lg">{p.korean}</p>
              <p className="text-sm text-gray-500 mt-1">{p.english}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
