import { useState, useRef, useCallback } from 'react';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Web Speech API (TTS)
  const playTTS = useCallback((text: string, lang: string = 'ko-KR') => {
    if ('speechSynthesis' in window) {
      // 이전 재생 중지
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9; // 약간 느리게
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Your browser does not support text-to-speech');
    }
  }, []);

  // 오디오 파일 재생
  const playAudioFile = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setCurrentAudio(url);

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    };
    audio.onerror = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
      alert('Failed to play audio');
    };

    audio.play().catch(err => {
      console.error('Audio play error:', err);
      setIsPlaying(false);
    });
  }, []);

  // 유튜브 타임스탬프 재생 (iframe 필요)
  const playYouTubeSegment = useCallback((videoId: string, start: number, end: number) => {
    // YouTube IFrame API 사용
    const url = `https://www.youtube.com/embed/${videoId}?start=${Math.floor(start)}&end=${Math.floor(end)}&autoplay=1`;
    window.open(url, 'youtube_player', 'width=560,height=315');
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentAudio(null);
  }, []);

  return {
    isPlaying,
    currentAudio,
    playTTS,
    playAudioFile,
    playYouTubeSegment,
    stop
  };
}