export interface KeyExpression {
  expression: string;
  meaning_en: string;
  usage_note: string;
}

export interface GrammarPoint {
  pattern: string;
  explanation_en: string;
  example_sentence: string;
}

export interface PracticeSentence {
  korean: string;
  english: string;
}

export interface AnalysisResult {
  key_expressions: KeyExpression[];
  grammar_points: GrammarPoint[];
  practice_sentences: PracticeSentence[];
}
