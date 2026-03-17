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

  // Heuristic to filter out simple English loanwords that don't add much learning value
  const isLoanword = (korean: string, english: string) => {
    const k = korean.toLowerCase().replace(/ /g, '');
    const e = english.toLowerCase().replace(/ /g, '');
    // Common transliterations that are too obvious
    const obvious = ['메시지', '커피', '핸드폰', '스마트폰', '인터넷', '파일', '데이터'];
    if (obvious.includes(korean)) return true;
    // Simple phonetic match check can be complex, so we'll stick to 'obvious' for now
    // or if the English meaning is just the phonetic transcription
    return false;
  };

  const sentences: DramaSentence[] = (analysis.key_expressions || [])
    .filter(exp => !isLoanword(exp.expression, exp.meaning_en))
    .map((exp, index) => {
      if (!exp.audio_timestamp) {
        console.warn(`🕒 Missing timestamp for: "${exp.expression}". Using default.`);
      }

      const startTime = exp.audio_timestamp?.start ?? (index * 5);
      const endTime = exp.audio_timestamp?.end ?? (startTime + 3);

      return {
        id: `sentence-${index}-${Date.now()}`, // Unique ID for each session
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
        vocabulary: [],
        grammar: [],
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
