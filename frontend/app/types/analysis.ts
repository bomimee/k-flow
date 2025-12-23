// src/app/types/analysis.ts
export interface AnalysisResult {
  video_id: string;
  source: string;
  analysis: {
    key_expressions: {
      expression: string;
      meaning_en: string;
      usage_note: string;
    }[];
    grammar_points: {
      pattern: string;
      explanation_en: string;
      example_sentence: string;
    }[];
    practice_sentences: {
      korean: string;
      english: string;
    }[];
  };
}
