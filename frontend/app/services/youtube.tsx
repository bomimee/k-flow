// frontend/src/app/services/youtube.ts
export async function analyzeYouTube(url: string) {
  const res = await fetch("http://localhost:8000/analyze-youtube", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  return res.json();
}
