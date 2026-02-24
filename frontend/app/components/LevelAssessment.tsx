import { useState, useEffect } from 'react';
import type { TTMIKLevel, UserLevelInfo, CurriculumRoadmap } from '@/app/types/level';
import { TTMIK_LEVELS } from '@/app/types/level';

interface LevelAssessmentProps {
  onLevelDetermined: (level: TTMIKLevel) => void;
}

export default function LevelAssessment({ onLevelDetermined }: LevelAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const assessmentQuestions = [
    {
      question: "How comfortable are you with basic Korean greetings (안녕하세요, 감사합니다)?",
      options: [
        "I don't know them at all",
        "I can recognize them but can't use them",
        "I can use them confidently",
        "I can use variations and understand context"
      ]
    },
    {
      question: "Can you form simple sentences like 'I eat rice' (저는 밥을 먹어요)?",
      options: [
        "I don't understand sentence structure",
        "I can recognize simple patterns but can't create my own",
        "I can form basic sentences with help",
        "I can create various simple sentences confidently"
      ]
    },
    {
      question: "How well do you understand Korean particles (이/가, 은/는, 을/를)?",
      options: [
        "I don't know what particles are",
        "I know they exist but can't use them correctly",
        "I can use basic particles in simple sentences",
        "I understand most particles and their nuances"
      ]
    },
    {
      question: "Can you understand K-drama content without subtitles?",
      options: [
        "I need English subtitles for everything",
        "I can catch some familiar words and phrases",
        "I can understand basic conversations with Korean subtitles",
        "I can understand most content without subtitles"
      ]
    },
    {
      question: "How is your vocabulary range?",
      options: [
        "Under 200 words (basic greetings and objects)",
        "200-600 words (everyday conversations)",
        "600-1500 words (complex topics)",
        "1500+ words (specialized and nuanced topics)"
      ]
    }
  ];

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateLevel(newAnswers);
    }
  };

  const calculateLevel = (finalAnswers: number[]) => {
    const averageScore = finalAnswers.reduce((a, b) => a + b, 0) / finalAnswers.length;

    let recommendedLevel: TTMIKLevel;
    if (averageScore < 1) {
      recommendedLevel = 1;
    } else if (averageScore < 1.5) {
      recommendedLevel = 2;
    } else if (averageScore < 2) {
      recommendedLevel = 3;
    } else if (averageScore < 2.5) {
      recommendedLevel = 4;
    } else if (averageScore < 3) {
      recommendedLevel = 5;
    } else if (averageScore < 3.5) {
      recommendedLevel = 6;
    } else {
      recommendedLevel = 7;
    }

    setShowResult(true);
    onLevelDetermined(recommendedLevel);
  };

  if (showResult) {
    return (
      <div className="text-center p-8 bg-[var(--lemon)] rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-black">Level Assessment Complete!</h2>
        <p className="text-lg mb-4 text-black">Your recommended starting level is being calculated...</p>
        <div className="animate-pulse">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold" style={{ color: "black" }}>Level Assessment</h2>
          <span className="text-sm text-black">
            Question {currentQuestion + 1} of {assessmentQuestions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / assessmentQuestions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-black">
          {assessmentQuestions[currentQuestion].question}
        </h3>

        <div className="space-y-3">
          {assessmentQuestions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-all duration-200 text-black"
            >
              <span className="flex items-center">
                <span className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3 text-sm font-semibold text-black">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}