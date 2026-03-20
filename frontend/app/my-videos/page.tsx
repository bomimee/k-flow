"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ModernNavigation from "@/app/components/ModernNavigation";

interface VideoAnalysis {
  video_id: string;
  source: "subtitle" | "speech";
  level: string;
  created_at: string;
  youtube_url?: string;
  video_context?: {
    topic?: string;
    speech_style?: string;
  };
}

const SOURCE_LABEL: Record<string, string> = {
  subtitle: "자막",
  speech: "음성인식",
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

function getThumbnail(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  const days = Math.floor(hrs / 24);
  return `${days}일 전`;
}

export default function MyVideosPage() {
  const [videos, setVideos] = useState<VideoAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/video-analyses");
        if (!res.ok) throw new Error("목록을 불러오지 못했습니다.");
        const data = await res.json();
        setVideos(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#CDE4F0" }}>
      <ModernNavigation />
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1E3A5F]">📺 내 분석 영상</h1>
          <p className="text-[#1E3A5F]/60 mt-1">분석했던 YouTube 영상들을 복습하고 퀴즈를 풀어보세요.</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[var(--lemon)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-xl font-bold text-[#1E3A5F] mb-2">아직 분석한 영상이 없어요</h2>
            <p className="text-[#1E3A5F]/60 mb-6">드라마 연습 탭에서 YouTube URL을 입력해 분석을 시작해보세요!</p>
            <Link
              href="/drama-practice"
              className="inline-block px-8 py-3 rounded-full font-bold text-[#1E3A5F] hover:opacity-80 transition-all shadow-lg"
              style={{ background: "var(--lemon, #EFF889)" }}
            >
              영상 분석하러 가기 →
            </Link>
          </div>
        )}

        {!loading && videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {videos.map((v) => {
              const topic = v.video_context?.topic || "YouTube 영상";
              const youtubeLink = v.youtube_url
                ? v.youtube_url
                : `https://www.youtube.com/watch?v=${v.video_id}`;

              return (
                <div
                  key={v.video_id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* 썸네일 */}
                  <div className="relative">
                    <img
                      src={getThumbnail(v.video_id)}
                      alt={topic}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/320x180/CDE4F0/1E3A5F?text=Video";
                      }}
                    />
                    {/* 소스 뱃지 */}
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                      {SOURCE_LABEL[v.source] || v.source}
                    </span>
                    {/* 레벨 뱃지 */}
                    {v.level && (
                      <span
                        className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-semibold ${LEVEL_COLORS[v.level] || "bg-gray-100 text-gray-600"}`}
                      >
                        {v.level}
                      </span>
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-1">{timeAgo(v.created_at)}</p>
                    <h3
                      className="font-bold text-[#1E3A5F] text-sm leading-snug mb-3 line-clamp-2"
                      title={topic}
                    >
                      {topic}
                    </h3>

                    {/* 액션 버튼 */}
                    <div className="flex gap-2 flex-wrap">
                      <Link
                        href={`/vocabulary-quiz/video/${v.video_id}`}
                        className="flex-1 text-center py-2 rounded-xl font-bold text-sm text-[#1E3A5F] transition-all hover:opacity-80"
                        style={{ background: "var(--lemon, #EFF889)" }}
                      >
                        🎯 단어 퀴즈
                      </Link>
                      <a
                        href={youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition-all"
                      >
                        ▶
                      </a>
                      <Link
                        href={`/drama-practice?url=${encodeURIComponent(youtubeLink)}`}
                        className="flex-1 text-center py-2 rounded-xl font-bold text-sm bg-[#1E3A5F] text-white hover:opacity-80 transition-all"
                      >
                        🎙️ 다시 연습
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
