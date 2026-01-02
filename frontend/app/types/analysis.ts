// Video context information
export interface VideoContext {
  topic: string;
  speech_style: string;
  key_cultural_notes: string[];
}

// Key expression with detailed information
export interface KeyExpression {
  expression: string;
  pronunciation: string;
  pronunciation_notes: string;
  meaning_en: string;
  formality: 'formal' | 'casual' | 'neutral';
  usage_context: string;
  similar_expressions: string[];
  example_in_context: string;
}

// Example sentence structure
export interface ExampleSentence {
  korean: string;
  romanization: string;
  english: string;
  breakdown: string;
}

// Grammar point with examples
export interface GrammarPoint {
  pattern: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  explanation_en: string;
  formation: string;
  function: string;
  example_sentences: ExampleSentence[];
  common_mistakes: string;
}

// Vocabulary item
export interface VocabularyItem {
  word: string;
  meaning: string;
  conjugation_tip?: string;
  usage_note?: string;
}

// Vocabulary organized by category
export interface VocabularyByCategory {
  essential_verbs?: VocabularyItem[];
  topic_specific?: VocabularyItem[];
  [key: string]: VocabularyItem[] | undefined; // Allow dynamic categories
}

// Natural speech pattern
export interface NaturalSpeechPattern {
  pattern: string;
  type: 'filler' | 'connector' | 'interjection' | 'softener';
  meaning_en: string;
  usage_frequency: 'very common' | 'common' | 'occasional';
  example: string;
}

// Honorific form
export interface HonorificForm {
  expression: string;
  casual_equivalent: string;
  when_to_use: string;
}

// Honorifics analysis
export interface HonorificsAnalysis {
  relationship_dynamics: string;
  key_honorific_forms: HonorificForm[];
}

// Pronunciation guide
export interface PronunciationGuide {
  written: string;
  pronounced: string;
  rule: string;
  timestamp?: string;
}

// Idiomatic expression
export interface IdiomaticExpression {
  idiom: string;
  literal_translation: string;
  actual_meaning: string;
  origin?: string;
  example: string;
}

// Fill in the blank exercise
export interface FillInTheBlankExercise {
  sentence: string;
  answer: string;
  hint: string;
}

// Multiple choice exercise
export interface MultipleChoiceExercise {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

// Translation practice
export interface TranslationPractice {
  english: string;
  korean_answer: string;
  alternative_answers: string[];
}

// Listening exercise
export interface ListeningExercise {
  timestamp?: string;
  instruction: string;
  sentence: string;
  answer: string;
}

// Practice exercises
export interface PracticeExercises {
  fill_in_the_blank: FillInTheBlankExercise[];
  multiple_choice: MultipleChoiceExercise[];
  translation_practice: TranslationPractice[];
  listening_exercise: ListeningExercise[];
}

// Common mistakes
export interface CommonMistake {
  mistake_type: 'grammar' | 'pronunciation' | 'usage' | 'formality';
  wrong: string;
  correct: string;
  explanation: string;
}

// Review summary
export interface ReviewSummary {
  total_expressions: string;
  total_grammar_points: string;
  difficulty_rating: string;
  estimated_study_time: string;
  key_takeaways: string[];
}

// Complete analysis structure
export interface Analysis {
  video_context: VideoContext;
  key_expressions: KeyExpression[];
  grammar_points: GrammarPoint[];
  vocabulary_by_category: VocabularyByCategory;
  natural_speech_patterns: NaturalSpeechPattern[];
  honorifics_analysis: HonorificsAnalysis;
  pronunciation_guide: PronunciationGuide[];
  idiomatic_expressions: IdiomaticExpression[];
  practice_exercises: PracticeExercises;
  common_mistakes: CommonMistake[];
  review_summary: ReviewSummary;
}

// Main analysis result
export interface AnalysisResult {
  video_id: string;
  source: string;
  analysis: Analysis;
}

// User level type
export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

// Video type
export type VideoType = 'cooking show' | 'variety' | 'vlog' | 'interview' | 'drama' | 'news' | 'other';