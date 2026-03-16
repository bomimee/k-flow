import type { AnalysisResult } from '@/app/types/analysis';
import type { VideoClip, DramaSentence } from '@/app/types/drama';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function analyzeYouTube(
  url: string,
  level: string,
  mediaType: 'regular' | 'shorts' = 'regular'
): Promise<AnalysisResult> {
  try {
    console.log('🔵 Calling API:', `${API_BASE_URL}/api/analyze-youtube`);
    console.log('📦 Request:', { url, level, video_type: mediaType });

    const response = await fetch(`${API_BASE_URL}/api/analyze-youtube`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        level,
        video_type: mediaType
      }),
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('⚠️ API Error:', errorData);
      throw new Error(
        errorData.detail || `API request failed with status ${response.status}`
      );
    }

    const data: AnalysisResult = await response.json();
    console.log('✅ Analysis received:', data);

    return data;
  } catch (error) {
    console.warn('⚠️ analyzeYouTube error:', error);
    throw error;
  }
}

export function mapAnalysisToVideoClip(result: AnalysisResult): VideoClip {
  const { analysis, video_id } = result;

  const sentences: DramaSentence[] = (analysis.key_expressions || []).map((exp, index) => {
    const startTime = exp.audio_timestamp?.start ?? (index * 5);
    const endTime = exp.audio_timestamp?.end ?? (startTime + 3);

    return {
      id: `sentence-${index}`,
      korean: exp.expression,
      english: exp.meaning_en,
      pronunciation: exp.pronunciation,
      videoId: video_id,
      startTime,
      endTime,
      difficulty: 'medium',
      level: 1, // Default level
      context: exp.usage_context || 'Conversation from video',
      characters: ['Speaker'], // Default
      dramaTitle: analysis.video_context?.topic || 'YouTube Video',
      episode: 'Special',
      genre: 'variety',
      culturalNotes: analysis.video_context?.key_cultural_notes?.join(', '),
      vocabulary: [], // Can be extracted from exp if needed
      grammar: [], // Can be extracted from Exp if needed
    };
  });

  return {
    id: video_id,
    videoId: video_id,
    title: analysis.video_context?.topic || 'YouTube Analysis',
    thumbnail: `https://img.youtube.com/vi/${video_id}/maxresdefault.jpg`,
    duration: sentences.length > 0 ? sentences[sentences.length - 1].endTime : 0,
    sentences,
    level: 1,
    genre: 'variety',
    popularity: 90,
  };
}
