"use client";
// frontend/src/app/practice/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Input from "../components/Input";
import Button from "../components/Button";

export default function PracticePage() {
  const [url, setUrl] = useState("");
  const [level, setLevel] = useState("");
  const [urlError, setUrlError] = useState(false); // URL 에러 상태
  const router = useRouter();

  // 유튜브 링크 검증 함수
  const isYouTubeUrl = (value: string) => {
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return ytRegex.test(value);
  };

  const handleGo = () => {
    // 둘 다 입력 안 됐으면 alert
    if (!url.trim() || !level) {
      alert("Please provide both a YouTube link and select your level");
      return;
    }

    // URL 검증
    if (!isYouTubeUrl(url)) {
      setUrlError(true);
      return;
    }

    // 정상 URL이면 페이지 이동
    setUrlError(false);
    router.push(
      `/result?url=${encodeURIComponent(url)}&level=${encodeURIComponent(
        level
      )}`
    );
  };

  return (
    <>
      <Header />
      <section className="space-y-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-black mt-30">
          please provide a youtube link below ⬇
        </h2>

        <Input
          value={url}
          onChange={(value) => {
            setUrl(value);
            setUrlError(false); // 입력할 때 에러 초기화
          }}
          text="Go"
        />
        {/* URL 검증 에러 메시지 */}
        {urlError && (
          <p className="text-red-500 text-sm mt-1">
            Please enter a valid YouTube link
          </p>
        )}

      <div className="flex items-center mt-2">
  {/* Select 고정 폭 */}
  <div className="relative" style={{ width: "300px" }}>
    <select
      value={level}
      onChange={(e) => setLevel(e.target.value)}
      className="block w-full px-3 py-2 pr-8 bg-[var(--font)] text-black border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Level</option>
      <option value="beginner">Beginner</option>
      <option value="intermediate">Intermediate</option>
      <option value="advanced">Advanced</option>
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
      ▼
    </div>
  </div>

  {/* Button */}
  <div className="ml-24 flex-shrink-0">
    <Button url={url} text="Go" onClick={handleGo} />
  </div>
</div>

      </section>
    </>
  );
}
