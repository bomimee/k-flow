import type { AnalysisResult } from '@/app/types/analysis';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000' || 'http://localhost:8000';

export async function analyzeYouTube(
  url: string, 
  level: string,
): Promise<AnalysisResult> {
  try {
    console.log('🔵 Calling API:', `${API_BASE_URL}/api/analyze-youtube`);
    console.log('📦 Request:', { url, level });

    const response = await fetch(`${API_BASE_URL}/api/analyze-youtube`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        level
      }),
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API Error:', errorData);
      throw new Error(
        errorData.detail || `API request failed with status ${response.status}`
      );
    }

    const data: AnalysisResult = await response.json();
    console.log('✅ Analysis received:', data);
    
    return data;
  } catch (error) {
    console.error('❌ analyzeYouTube error:', error);
    throw error;
  }
}
