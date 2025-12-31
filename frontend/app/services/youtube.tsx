import type { AnalysisResult } from "../types/analysis";

export async function analyzeYouTube(url: string, level: string): Promise<AnalysisResult> {
  const res = await fetch("http://localhost:8000/analyze-youtube", {
    method: "POST",
    body: JSON.stringify({ url, level }),
    headers: { "Content-Type": "application/json" },
  });

  return res.json();
}
