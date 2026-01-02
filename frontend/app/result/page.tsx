"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
// import { analyzeYouTube } from "@/app/services/youtube";
import type { AnalysisResult } from "@/app/types/analysis";
import Header from "../components/Header";
import ResultResponse from "../components/Result";

const DATA: AnalysisResult = {
  video_id: "dummy-video-id",
  source: "subtitle",
  analysis: {
  video_context: {
    topic:
      "A cooking show featuring chefs discussing their experiences and challenges in the culinary field.",
    speech_style: "casual",
    key_cultural_notes: [
      "The importance of food and cooking in Korean culture.",
      "The concept of 'chef' as a respected profession, especially in the context of Michelin stars.",
    ],
  },
  key_expressions: [
    {
      expression: "기가 막히다",
      pronunciation: "giga makida",
      pronunciation_notes:
        "The 'g' in '기가' is pronounced softly, and '막히다' may blend into '막히다'.",
      meaning_en: "to be amazing or incredible",
      formality: "casual",
      usage_context: "Used to express amazement or admiration.",
      similar_expressions: ["대단하다", "놀랍다"],
      example_in_context: "와아아아아아아 어떠세요 기가 막힐죠?",
    },
    {
      expression: "안녕하세요",
      pronunciation: "annyeonghaseyo",
      pronunciation_notes: "The 'h' in '하' is pronounced softly.",
      meaning_en: "Hello",
      formality: "formal",
      usage_context: "A common greeting used in various contexts.",
      similar_expressions: ["안녕", "여보세요"],
      example_in_context: "안녕하세요 넷플릭스의 신은 공무원 김풍입니다",
    },
    {
      expression: "부담되다",
      pronunciation: "budamdoeda",
      pronunciation_notes:
        "The '부' is pronounced clearly, while '담' may blend with '되다'.",
      meaning_en: "to be burdensome",
      formality: "neutral",
      usage_context: "Used to express feeling overwhelmed or pressured.",
      similar_expressions: ["힘들다", "어렵다"],
      example_in_context: "부담되지 않으세요?",
    },
  ],
  grammar_points: [
    {
      pattern: "아/어 보다",
      level: "intermediate",
      explanation_en:
        "Used to express trying something out or experiencing something.",
      formation: "Verb stem + 아/어 보다",
      function: "Indicates the action of trying or experiencing.",
      example_sentences: [
        {
          korean: "이 요리를 한번 만들어 봐야겠어요.",
          romanization: "I yori-reul hanbeon mandeureo bwaya gesseoyo.",
          english: "I should try making this dish.",
          breakdown:
            "이 (this) + 요리 (dish) + 를 (object marker) + 한번 (once) + 만들어 (make) + 봐야겠어요 (should try)",
        },
      ],
      common_mistakes: "Learners often forget to use the correct verb stem.",
    },
    {
      pattern: "~는  것 같다",
      level: "intermediate",
      explanation_en: "Used to express an opinion or assumption.",
      formation: "Verb stem + 는 것 같다",
      function: "Indicates a guess or assumption about something.",
      example_sentences: [
        {
          korean: "이 요리는 맛있는 것 같아요.",
          romanization: "I yori-neun mas-issneun geot gatayo.",
          english: "I think this dish is delicious.",
          breakdown:
            "이 (this) + 요리 (dish) + 는 (topic marker) + 맛있는 (delicious) + 것 같다 (seems to be)",
        },
      ],
      common_mistakes: "Confusing the verb forms when conjugating.",
    },
  ],
  vocabulary_by_category: {
    essential_verbs: [
      {
        word: "하다",
        meaning: "to do",
        conjugation_tip: "Changes based on tense and politeness level.",
      },
      {
        word: "보다",
        meaning: "to see/to try",
        conjugation_tip: "Used with additional endings to indicate tense.",
      },
    ],
    topic_specific: [
      {
        word: "셰프",
        meaning: "chef",
        usage_note: "Commonly used to refer to professional cooks.",
      },
      {
        word: "미슐랭",
        meaning: "Michelin",
        usage_note:
          "Refers to the Michelin Guide, a prestigious restaurant rating system.",
      },
    ],
  },
  natural_speech_patterns: [
    {
      pattern: "그렇죠?",
      type: "softener",
      meaning_en: "Right? or Isn't it?",
      usage_frequency: "very common",
      example: "그렇죠? 기분 이 되게 좋아요.",
    },
    {
      pattern: "아니요",
      type: "filler",
      meaning_en: "No",
      usage_frequency: "common",
      example: "아니요, 그게 아니죠.",
    },
  ],
  honorifics_analysis: {
    relationship_dynamics:
      "Younger speakers use casual speech with friends and formal speech with elders.",
    key_honorific_forms: [
      {
        expression: "셰프님",
        casual_equivalent: "셰프",
        when_to_use:
          "Use '님' as a sign of respect when addressing someone in a professional context.",
      },
    ],
  },
  pronunciation_guide: [
    {
      written: "부담되다",
      pronounced: "budamdoeda",
      rule: "The '부' is pronounced clearly, while '담' may blend with '되다'.",
      timestamp: "Not available",
    },
    {
      written: "기가 막히다",
      pronounced: "giga makida",
      rule: "The '기' is pronounced softly, with a slight pause before '막히다'.",
      timestamp: "Not available",
    },
  ],
  idiomatic_expressions: [
    {
      idiom: "눈이 높다",
      literal_translation: "to have high eyes",
      actual_meaning: "to be picky or have high standards",
      origin: "Refers to someone who is selective in their choices.",
      example: "그 사람은 눈이 높아서 좋은 사람을 찾기 힘들어요.",
    },
  ],
  practice_exercises: {
    fill_in_the_blank: [
      {
        sentence: "이 요리는 ___ 맛있어요.",
        answer: "정말",
        hint: "A word meaning 'really'.",
      },
    ],
    multiple_choice: [
      {
        question: "What does '부담되다' mean?",
        options: ["to be easy", "to be burdensome", "to be delicious"],
        correct_answer: "B",
        explanation: "It means to feel pressured or burdened.",
      },
    ],
    translation_practice: [
      {
        english: "This dish is amazing.",
        korean_answer: "이 요리는 기가 막혀요.",
        alternative_answers: ["이 요리는 정말 멋져요."],
      },
    ],
    listening_exercise: [
      {
        timestamp: "Not available",
        instruction: "Listen and fill in the blank",
        sentence: "이 요리는 ___ 맛있어요.",
        answer: "정말",
      },
    ],
  },
  common_mistakes: [
    {
      mistake_type: "Grammar",
      wrong: "나는 요리를 잘 해.",
      correct: "저는 요리를 잘 해요.",
      explanation: "Use '저' for politeness when speaking about oneself.",
    },
  ],
  review_summary: {
    total_expressions: "8",
    total_grammar_points: "2",
    difficulty_rating: "Medium for this level",
    estimated_study_time: "45 minutes",
    key_takeaways: [
      "Understanding casual speech patterns.",
      "Recognizing the importance of honorifics.",
      "Practicing common expressions used in cooking contexts.",
    ],
  },
}
};


export default function Result() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const level = searchParams.get("level") || "beginner";

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Result 페이지에서만 배경색 변경
    document.body.classList.add("bg-result");

    // 페이지를 떠날 때 원래 상태로 복구
    return () => {
      document.body.classList.remove("bg-result");
    };
  }, []);

  useEffect(() => {
    if (!url || !level) return;

    const run = async () => {
      setLoading(true);
      // const data = await analyzeYouTube(url, level);
      // setResult(data);
      setResult(DATA);
      setLoading(false);
    };

    run();
  }, [url, level]);

  if (loading) return <p>Analyzing...</p>;
  if (!result) return <p>No result</p>;

  return (
    <>
      <Header />
        <ResultResponse result={result}/>
    </>
  );
}
