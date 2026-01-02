"use client";

import React, { useState } from "react";
import type { AnalysisResult } from "@/app/types/analysis";
import { AudioButton } from "./AudioButton";

interface ResultResponseProps {
  result: AnalysisResult;
}

export default function ResultResponse({ result }: ResultResponseProps) {
  const { source, analysis, video_id } = result;
  const [activeTab, setActiveTab] = useState<
    "overview" | "expressions" | "grammar" | "vocabulary" | "practice"
  >("overview");

  return (
    <div className="space-y-8 text-black">
      {/* Header with Video Context */}
      <div className="rounded-lg p-6 bg-[var(--lemon)] shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">YouTube Analysis</p>
            <h2 className="text-2xl font-bold mb-3">
              {analysis.video_context.topic}
            </h2>
            <div className="flex gap-2 mb-3">
              <span className="inline-block px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                {analysis.video_context.speech_style}
              </span>
              <span className="inline-block px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                {source}
              </span>
            </div>
          </div>
        </div>

        {/* Cultural Notes */}
        {analysis.video_context.key_cultural_notes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-semibold mb-2">🌏 Cultural Context:</p>
            <ul className="space-y-1">
              {analysis.video_context.key_cultural_notes.map((note, idx) => (
                <li
                  key={idx}
                  className="text-sm text-gray-700 pl-4 border-l-2 border-yellow-400"
                >
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Study Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-2xl font-bold text-blue-600">
            {analysis.review_summary.total_expressions}
          </p>
          <p className="text-sm text-gray-600">Expressions</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-2xl font-bold text-purple-600">
            {analysis.review_summary.total_grammar_points}
          </p>
          <p className="text-sm text-gray-600">Grammar Points</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm font-bold text-orange-600">
            {analysis.review_summary.difficulty_rating}
          </p>
          <p className="text-sm text-gray-600">Difficulty</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-2xl font-bold text-green-600">
            {analysis.review_summary.estimated_study_time}
          </p>
          <p className="text-sm text-gray-600">Study Time</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { id: "overview", label: "📋 Overview" },
          { id: "expressions", label: "📌 Expressions" },
          { id: "grammar", label: "🧩 Grammar" },
          { id: "vocabulary", label: "📚 Vocabulary" },
          { id: "practice", label: "✍️ Practice" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      {activeTab === "overview" && (
        <section className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-xl font-bold mb-4">🎯 Key Takeaways</h3>
            <ul className="space-y-2">
              {analysis.review_summary.key_takeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">{idx + 1}.</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Natural Speech Patterns Preview */}
          {analysis.natural_speech_patterns.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-xl font-bold mb-4">
                💬 Natural Speech Patterns
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.natural_speech_patterns
                  .slice(0, 4)
                  .map((pattern, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded">
                      <p className="font-semibold text-blue-600">
                        {pattern.pattern}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {pattern.meaning_en}
                      </p>
                      <span className="text-xs text-gray-500 mt-2 inline-block">
                        {pattern.usage_frequency} • {pattern.type}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </section>
      )}

     {activeTab === 'expressions' && (
        <section className="space-y-6">
          <h3 className="text-2xl font-bold">📌 Key Expressions</h3>
          <div className="space-y-4">
            {analysis.key_expressions.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg p-6 bg-white shadow hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-2xl font-bold text-gray-900">{item.expression}</p>
                      
                      {/* 👇 AudioButton 사용 */}
                      <AudioButton 
                        text={item.expression}
                        audioClipUrl={item.audio_clip_url}
                        timestamp={item.audio_timestamp}
                        videoId={video_id}
                      />
                    </div>
                    <p className="text-sm text-gray-500">[{item.pronunciation}]</p>
                  </div>
                  
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    item.formality === 'formal' ? 'bg-blue-100 text-blue-700' :
                    item.formality === 'casual' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.formality}
                  </span>
                </div>

                <p className="text-lg text-gray-700 mb-2">
                  → {item.meaning_en}
                </p>

                {item.pronunciation_notes && (
                  <div className="bg-yellow-50 p-3 rounded mb-3">
                    <p className="text-sm">
                      🔊 <span className="font-semibold">Pronunciation:</span>{" "}
                      {item.pronunciation_notes}
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 p-3 rounded mb-3">
                  <p className="text-sm">
                    💡 <span className="font-semibold">Usage:</span>{" "}
                    {item.usage_context}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded mb-3">
                  <p className="text-sm">
                    📝 <span className="font-semibold">Example:</span>{" "}
                    {item.example_in_context}
                  </p>
                </div>

                {item.similar_expressions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-sm text-gray-600">Similar:</span>
                    {item.similar_expressions.map((similar, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                      >
                        {similar}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Idiomatic Expressions */}
          {analysis.idiomatic_expressions.length > 0 && (
            <div className="mt-8">
              <h4 className="text-xl font-bold mb-4">
                🎭 Idiomatic Expressions
              </h4>
              <div className="space-y-4">
                {analysis.idiomatic_expressions.map((idiom, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-5 shadow">
                    <p className="text-xl font-bold text-purple-600 mb-2">
                      {idiom.idiom}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Literal: {idiom.literal_translation}
                    </p>
                    <p className="text-gray-700 mb-2">
                      → {idiom.actual_meaning}
                    </p>
                    {idiom.origin && (
                      <p className="text-sm text-gray-600 bg-purple-50 p-2 rounded">
                        📚 {idiom.origin}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 mt-2 italic">
                      "{idiom.example}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === "grammar" && (
        <section className="space-y-6">
          <h3 className="text-2xl font-bold">🧩 Grammar Points</h3>
          <div className="space-y-4">
            {analysis.grammar_points.map((g, idx) => (
              <div key={idx} className="rounded-lg p-6 bg-white shadow">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xl font-bold text-purple-700">
                    {g.pattern}
                  </p>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      g.level === "beginner"
                        ? "bg-green-100 text-green-700"
                        : g.level === "intermediate"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {g.level}
                  </span>
                </div>

                <p className="text-gray-700 mb-3">{g.explanation_en}</p>

                <div className="bg-purple-50 p-3 rounded mb-3">
                  <p className="text-sm">
                    <span className="font-semibold">Formation:</span>{" "}
                    {g.formation}
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded mb-3">
                  <p className="text-sm">
                    <span className="font-semibold">Function:</span>{" "}
                    {g.function}
                  </p>
                </div>

                <div className="space-y-2 mb-3">
                  <p className="text-sm font-semibold">Examples:</p>
                  {g.example_sentences.map((ex, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded">
                      <p className="font-semibold">{ex.korean}</p>
                      <p className="text-sm text-gray-600">
                        [{ex.romanization}]
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        → {ex.english}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        💡 {ex.breakdown}
                      </p>
                    </div>
                  ))}
                </div>

                {g.common_mistakes && (
                  <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                    <p className="text-sm">
                      <span className="font-semibold">⚠️ Common Mistakes:</span>{" "}
                      {g.common_mistakes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Honorifics Section */}
          {analysis.honorifics_analysis && (
            <div className="mt-8 bg-white rounded-lg p-6 shadow">
              <h4 className="text-xl font-bold mb-4">👥 Honorifics Analysis</h4>
              <p className="text-gray-700 mb-4">
                {analysis.honorifics_analysis.relationship_dynamics}
              </p>
              <div className="space-y-2">
                {analysis.honorifics_analysis.key_honorific_forms.map(
                  (form, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded"
                    >
                      <span className="font-semibold text-blue-600">
                        {form.expression}
                      </span>
                      <span className="text-gray-400">↔</span>
                      <span className="text-gray-600">
                        {form.casual_equivalent}
                      </span>
                      <span className="text-sm text-gray-500 ml-auto">
                        ({form.when_to_use})
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Pronunciation Guide */}
          {analysis.pronunciation_guide.length > 0 && (
            <div className="mt-8 bg-white rounded-lg p-6 shadow">
              <h4 className="text-xl font-bold mb-4">🔊 Pronunciation Guide</h4>
              <div className="space-y-3">
                {analysis.pronunciation_guide.map((pron, idx) => (
                  <div key={idx} className="p-3 bg-yellow-50 rounded">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold">{pron.written}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-blue-600 font-semibold">
                        {pron.pronounced}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{pron.rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === "vocabulary" && (
        <section className="space-y-6">
          <h3 className="text-2xl font-bold">📚 Vocabulary</h3>

          {Object.entries(analysis.vocabulary_by_category).map(
            ([category, items]) =>
              items &&
              items.length > 0 && (
                <div key={category} className="bg-white rounded-lg p-6 shadow">
                  <h4 className="text-lg font-bold mb-4 capitalize">
                    {category.replace(/_/g, " ")}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
                      >
                        <p className="font-semibold text-lg">{item.word}</p>
                        <p className="text-gray-700">{item.meaning}</p>
                        {item.conjugation_tip && (
                          <p className="text-sm text-blue-600 mt-1">
                            💡 {item.conjugation_tip}
                          </p>
                        )}
                        {item.usage_note && (
                          <p className="text-sm text-gray-500 mt-1">
                            📝 {item.usage_note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </section>
      )}

      {activeTab === "practice" && (
        <section className="space-y-6">
          <h3 className="text-2xl font-bold">✍️ Practice Exercises</h3>

          {/* Fill in the Blank */}
          {analysis.practice_exercises.fill_in_the_blank.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow">
              <h4 className="text-lg font-bold mb-4">📝 Fill in the Blank</h4>
              <div className="space-y-4">
                {analysis.practice_exercises.fill_in_the_blank.map(
                  (ex, idx) => (
                    <div key={idx} className="p-4 bg-blue-50 rounded">
                      <p className="font-semibold mb-2">
                        {idx + 1}. {ex.sentence}
                      </p>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                          Show hint
                        </summary>
                        <p className="text-sm text-gray-600 mt-1">
                          💡 {ex.hint}
                        </p>
                      </details>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-green-600 hover:text-green-800">
                          Show answer
                        </summary>
                        <p className="text-sm font-semibold text-green-700 mt-1">
                          ✓ {ex.answer}
                        </p>
                      </details>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Multiple Choice */}
          {analysis.practice_exercises.multiple_choice.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow">
              <h4 className="text-lg font-bold mb-4">✅ Multiple Choice</h4>
              <div className="space-y-4">
                {analysis.practice_exercises.multiple_choice.map((ex, idx) => (
                  <div key={idx} className="p-4 bg-purple-50 rounded">
                    <p className="font-semibold mb-3">
                      {idx + 1}. {ex.question}
                    </p>
                    <div className="space-y-2 ml-4">
                      {ex.options.map((option, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-gray-600">{option}</span>
                        </div>
                      ))}
                    </div>
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-green-600 hover:text-green-800">
                        Show answer
                      </summary>
                      <div className="mt-2 p-2 bg-green-50 rounded">
                        <p className="text-sm font-semibold text-green-700">
                          ✓ {ex.correct_answer}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {ex.explanation}
                        </p>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Translation Practice */}
          {analysis.practice_exercises.translation_practice.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow">
              <h4 className="text-lg font-bold mb-4">
                🔄 Translation Practice
              </h4>
              <div className="space-y-4">
                {analysis.practice_exercises.translation_practice.map(
                  (ex, idx) => (
                    <div key={idx} className="p-4 bg-yellow-50 rounded">
                      <p className="font-semibold mb-2">
                        {idx + 1}. {ex.english}
                      </p>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                          Show translation
                        </summary>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm font-semibold text-blue-700">
                            ✓ {ex.korean_answer}
                          </p>
                          {ex.alternative_answers.length > 0 && (
                            <div className="text-sm text-gray-600">
                              <p>Also correct:</p>
                              {ex.alternative_answers.map((alt, i) => (
                                <p key={i} className="ml-2">
                                  • {alt}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Common Mistakes */}
          {analysis.common_mistakes.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow">
              <h4 className="text-lg font-bold mb-4">
                ⚠️ Common Mistakes to Avoid
              </h4>
              <div className="space-y-3">
                {analysis.common_mistakes.map((mistake, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-red-50 rounded border-l-4 border-red-400"
                  >
                    <span className="inline-block px-2 py-1 text-xs bg-red-200 text-red-800 rounded mb-2">
                      {mistake.mistake_type}
                    </span>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-red-600 font-semibold">
                          ❌ Wrong:
                        </span>{" "}
                        {mistake.wrong}
                      </p>
                      <p className="text-sm">
                        <span className="text-green-600 font-semibold">
                          ✅ Correct:
                        </span>{" "}
                        {mistake.correct}
                      </p>
                      <p className="text-sm text-gray-600">
                        💡 {mistake.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
