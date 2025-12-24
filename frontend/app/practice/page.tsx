"use client";
// frontend/src/app/practice/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Input from "../components/Input";

export default function PracticePage() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleGo = () => {
    if (!url.trim()) return;

    router.push(`/result?url=${encodeURIComponent(url)}`);
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
          onChange={setUrl}
          text="Go"
          onAnalyze={handleGo}
        />
      </section>
    </>
  );
}
