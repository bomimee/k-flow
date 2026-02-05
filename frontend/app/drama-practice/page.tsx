"use client";

import ModernNavigation from "@/app/components/ModernNavigation";
import DramaSentenceMemorizer from "@/app/components/DramaSentenceMemorizer";
import { useState } from "react";
import type { VideoClip, MemorizationSession } from "@/app/types/drama";

export default function DramaPracticePage() {
  // 데모 비디오 클립 데이터 - 실제로는 YouTube API에서 가져옴
  const demoVideoClips: VideoClip[] = [
    {
      id: 'crash-landing-ep1',
      videoId: 'C7Jz7i0cPjE',
      title: 'Crash Landing on You - Episode 1',
      thumbnail: '/images/crash-landing-thumb.jpg',
      duration: 180,
      level: 2,
      genre: 'romance',
      popularity: 95,
      sentences: [
        {
          id: 'sentence-1',
          korean: '정말요?',
          english: 'Really?',
          pronunciation: 'jeongmal-yo?',
          videoId: 'C7Jz7i0cPjE',
          startTime: 120,
          endTime: 123,
          difficulty: 'easy',
          level: 1,
          context: 'Character expresses surprise',
          characters: ['Yoon Se-ri', 'Ri Jeong-hyeok'],
          dramaTitle: 'Crash Landing on You',
          episode: 'Episode 1',
          genre: 'romance',
          culturalNotes: 'This is a common expression of surprise in Korean',
          vocabulary: [
            {
              word: '정말',
              meaning: 'really',
              position: { start: 0, end: 2 }
            }
          ],
          grammar: [
            {
              pattern: '-요',
              explanation: 'Polite sentence ending',
              position: { start: 2, end: 4 }
            }
          ]
        },
        {
          id: 'sentence-2',
          korean: '괜찮아요.',
          english: "I'm okay.",
          pronunciation: 'gwaenchan-a-yo',
          videoId: 'C7Jz7i0cPjE',
          startTime: 125,
          endTime: 128,
          difficulty: 'easy',
          level: 1,
          context: 'Character reassures someone',
          characters: ['Yoon Se-ri'],
          dramaTitle: 'Crash Landing on You',
          episode: 'Episode 1',
          genre: 'romance',
          vocabulary: [
            {
              word: '괜찮다',
              meaning: 'to be okay',
              position: { start: 0, end: 3 }
            }
          ],
          grammar: []
        }
      ]
    }
  ];

  const [showWelcome, setShowWelcome] = useState(true);
  const [sessionResults, setSessionResults] = useState<MemorizationSession | null>(null);

  const handleStartPractice = () => {
    setShowWelcome(false);
    setSessionResults(null);
  };

  const handleSessionComplete = (session: MemorizationSession) => {
    setSessionResults(session);
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernNavigation />
        
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              K-Drama Practice
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learn Korean with real K-drama clips. Practice pronunciation, understand context, and master natural speech patterns.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-8">
              {/* Drama Practice Explanation */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 text-red-900">
                  🎬 Why Learn with K-Dramas?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">🎭</span>
                    </div>
                    <h4 className="font-semibold mb-1">Authentic Context</h4>
                    <p className="text-gray-600">Real situations and emotions</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">🗣️</span>
                    </div>
                    <h4 className="font-semibold mb-1">Natural Speech</h4>
                    <p className="text-gray-600">Native pronunciation patterns</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">🌟</span>
                    </div>
                    <h4 className="font-semibold mb-1">Cultural Learning</h4>
                    <p className="text-gray-600">Understand Korean culture</p>
                  </div>
                </div>
              </div>

              {/* Available Dramas */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Available K-Dramas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {demoVideoClips.map((clip) => (
                    <div key={clip.id} className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-500">🎬</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{clip.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {clip.sentences.length} sentences • Level {clip.level} • {clip.genre}
                          </p>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded">Popular</span>
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Romance</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Practice Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-red-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold">Video Clips</h4>
                      <p className="text-sm text-gray-600">Real K-drama scenes</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-red-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold">Subtitle Modes</h4>
                      <p className="text-sm text-gray-600">Korean, English, or none</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-red-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold">Mimicking Practice</h4>
                      <p className="text-sm text-gray-600">Step-by-step pronunciation</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-red-500 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold">Recording</h4>
                      <p className="text-sm text-gray-600">Compare your pronunciation</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartPractice}
                className="w-full btn-primary py-4 text-lg"
              >
                Start Drama Practice
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (sessionResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernNavigation />
        
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl">🎉</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Practice Session Complete!
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-red-600 mb-2">
                  {sessionResults.progress.sentencesPracticed}
                </div>
                <div className="text-gray-600">Sentences Practiced</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {Math.round(sessionResults.progress.averageAccuracy)}%
                </div>
                <div className="text-gray-600">Average Accuracy</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Time Spent</span>
                <span className="font-semibold">{Math.floor(sessionResults.progress.timeSpent / 60)}m {sessionResults.progress.timeSpent % 60}s</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Recordings</span>
                <span className="font-semibold">{sessionResults.userRecordings.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Clips Studied</span>
                <span className="font-semibold">{sessionResults.clips.length}</span>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleStartPractice}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Continue Practicing
              </button>
              <a
                href="/vocabulary-quiz"
                className="btn-primary px-6 py-3"
              >
                Try Vocabulary Quiz
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavigation />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <DramaSentenceMemorizer
          clips={demoVideoClips}
          onSessionComplete={handleSessionComplete}
        />
      </main>
    </div>
  );
}