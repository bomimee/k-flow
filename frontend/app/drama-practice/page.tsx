"use client";

import ModernNavigation from "@/app/components/ModernNavigation";
import DramaSentenceMemorizer from "@/app/components/DramaSentenceMemorizer";
import ResultResponse from "@/app/components/result";
import { useState, useEffect } from "react";
import type { VideoClip, MemorizationSession } from "@/app/types/drama";
import type { AnalysisResult } from "@/app/types/analysis";
import { analyzeYouTube, mapAnalysisToVideoClip } from "@/app/services/youtube";
import { useAuth } from "@/app/hooks/useAuth";

export default function DramaPracticePage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [sessionResults, setSessionResults] = useState<MemorizationSession | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [level, setLevel] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeClip, setActiveClip] = useState<VideoClip | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showPractice, setShowPractice] = useState(false);
  const [mediaType, setMediaType] = useState<'regular' | 'shorts'>('regular');
  const [trendingVideos, setTrendingVideos] = useState<any[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  const { user } = useAuth(); // ADDED: Auth hook to fetch user info for automatic level setting

  useEffect(() => {
    // Automatically set level based on user metadata
    if (user?.user_metadata?.level) {
      const uLevel = user.user_metadata.level;
      if (uLevel >= 8) setLevel("advanced");
      else if (uLevel >= 4) setLevel("intermediate");
      else setLevel("beginner");
    }
  }, [user]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/trending-youtube");
        if (res.ok) {
          const data = await res.json();
          setTrendingVideos(data);
        }
      } catch (e) {
        console.error("Failed to fetch trending videos", e);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  const handleStartPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl) return;

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeYouTube(youtubeUrl, level, mediaType);
      setAnalysisResult(result);
      const clip = mapAnalysisToVideoClip(result);
      setActiveClip(clip);
      setShowWelcome(false);
      setShowPractice(false);
      setSessionResults(null);
    } catch (err: any) {
      setError(err.message || "Failed to analyze video. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
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
              Learn Korean with real K-content clips. Practice pronunciation, understand context, and master natural speech patterns.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-8">
              {/* Drama Practice Explanation */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 text-red-900">
                  🎬 Why Learn with K-Contents?
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

              {/* Mode Selection Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                <button
                  onClick={() => setMediaType('regular')}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${mediaType === 'regular' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  📺 TV Shows / Dramas
                </button>
                <button
                  onClick={() => setMediaType('shorts')}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${mediaType === 'shorts' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  📱 Shorts / Reels <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded text-xs">New</span>
                </button>
              </div>

              {/* Available Dramas - Only show in regular mode for now */}
              {mediaType === 'regular' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">🔥 한국 인기 동영상 Top 10 (추천!)</h3>
                  <p className="text-sm text-gray-500">영상 클릭 시 아래 인풋 필드에 링크가 자동으로 입력됩니다.</p>
                {loadingTrending ? (
                  <div className="text-center py-8 text-gray-500 animate-pulse">인기 동영상을 불러오는 중입니다...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trendingVideos.map((video, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-lg p-2 hover:border-red-400 hover:bg-red-50 transition-colors cursor-pointer shadow-sm"
                        onClick={() => {
                          setYoutubeUrl(video.url);
                          // 자동으로 화면을 스크롤해서 아래로 내리기
                          document.getElementById('youtubeUrl')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <img src={video.thumbnail} alt={video.title} className="w-28 h-16 object-cover rounded-md" />
                          <div className="flex-1 overflow-hidden">
                            <h4 className="font-semibold text-sm line-clamp-2 leading-snug" title={video.title}>{video.title}</h4>
                            <div className="mt-2 text-xs text-red-600 font-medium">
                              클릭해서 링크 복사하기
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )}

              {/* Shorts Features Description */}
              {mediaType === 'shorts' && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6">
                  <h3 className="font-bold text-indigo-900 mb-2">⚡ 1-Minute Shorts Learning</h3>
                  <p className="text-sm text-indigo-800">
                    Paste a YouTube Shorts link to quickly extract key expressions. The player will be optimized for vertical viewing and focus on rapid mimicking practice.
                  </p>
                </div>
              )}

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

              <form onSubmit={handleStartPractice} className="space-y-6">
                <div>
                  <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    {mediaType === 'regular' ? 'YouTube Video URL' : 'YouTube Shorts URL'}
                  </label>
                  <input
                    id="youtubeUrl"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    required
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none transition-all ${mediaType === 'regular' ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {mediaType === 'regular' 
                      ? "Enter the URL of a Korean variety show or drama." 
                      : "Enter the URL of a YouTube Short (e.g., https://www.youtube.com/shorts/...)"}
                  </p>
                </div>

                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Level
                  </label>
                  <select
                    id="level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white"
                  >
                    <option value="beginner">Beginner (Level 1-3)</option>
                    <option value="intermediate">Intermediate (Level 4-7)</option>
                    <option value="advanced">Advanced (Level 8-10)</option>
                  </select>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 text-lg font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2 ${loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : mediaType === 'regular'
                      ? "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-red-500/25"
                      : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/25"
                    }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing Video...</span>
                    </>
                  ) : (
                    <>
                      <span>🎬</span>
                      <span>Analyze & Start Practice</span>
                    </>
                  )}
                </button>
              </form>
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
                onClick={() => {
                  setSessionResults(null);
                  setShowPractice(false);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Analysis
              </button>
              <button
                onClick={() => {
                  setSessionResults(null);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Practice Again
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

  // Analysis result view
  if (analysisResult && !showPractice) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <ModernNavigation />
        <main className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
              <p className="text-gray-500 text-sm mt-1">Review the expressions and grammar before practicing.</p>
            </div>
            <button
              onClick={() => setShowPractice(true)}
              className={`text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl font-bold transition-all flex items-center gap-2 ${activeClip?.videoId?.length && (youtubeUrl.includes('shorts') || mediaType === 'shorts') ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-red-500 hover:bg-red-600'}`}
            >
              <span>🎙️</span>
              <span>Start Speaking Practice</span>
            </button>
          </div>
          <ResultResponse result={analysisResult} />
        </main>
      </div>
    );
  }

  // Practice view (DramaSentenceMemorizer)
  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavigation />

      <main className="max-w-4xl mx-auto px-6 py-12 relative">
        <button
          onClick={() => setShowPractice(false)}
          className="absolute -top-4 left-6 text-gray-500 hover:text-gray-800 flex items-center gap-1 font-medium bg-white px-4 py-2 rounded-full shadow-sm hover:shadow transition-all"
        >
          ← Back to Analysis
        </button>
        <DramaSentenceMemorizer
          clips={activeClip ? [activeClip] : []}
          onSessionComplete={handleSessionComplete}
          isShorts={mediaType === 'shorts' || youtubeUrl.includes('shorts')}
        />
      </main>
    </div>
  );
}