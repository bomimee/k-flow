import type { AnalysisResult } from "../types/analysis";

export async function analyzeYouTube(url: string): Promise<AnalysisResult> {
  const res = await fetch("http://localhost:8000/analyze-youtube", {
    method: "POST",
    body: JSON.stringify({ url }),
    headers: { "Content-Type": "application/json" },
  });

  return res.json();
}
