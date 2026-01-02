import { useState, useRef, useCallback } from "react";
import YouTubePlayerModal from "./YoutubePlayerModal";

interface AudioTimestamp {
  start: number;
  end: number;
  text: string;
}

interface AudioButtonProps {
  text: string;
  audioClipUrl?: string;
  timestamp?: AudioTimestamp;
  videoId?: string;
  className?: string;
}

export function AudioButton({
  text,
  audioClipUrl,
  timestamp,
  videoId,
  className = "",
}: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showYouTubePlayer, setShowYouTubePlayer] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const playTTS = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 0.9;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const playAudioFile = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsPlaying(false);
      alert("Failed to play audio");
    };

    audio.play().catch((err) => {
      console.error("Audio play error:", err);
      setIsPlaying(false);
    });
  }, []);

  const handlePlay = () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    // 우선순위: 1. 오디오 클립 2. 유튜브 타임스탬프 3. TTS
    if (audioClipUrl) {
      playAudioFile(audioClipUrl);
    } else if (timestamp && videoId) {
      // 유튜브 플레이어 모달 열기
      setShowYouTubePlayer(true);
    } else {
      playTTS(text);
    }
  };

  return (
    <>
      <button
        onClick={handlePlay}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${className} ${
          isPlaying
            ? "bg-blue-600 text-white"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
        }`}
        title={
          audioClipUrl
            ? "Play original audio clip"
            : timestamp
            ? "Play from YouTube video"
            : "Play pronunciation (TTS)"
        }
      >
        {isPlaying ? (
          <>
            <svg
              className="w-4 h-4 animate-pulse"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" />
            </svg>
            <span className="text-sm">Stop</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
            <span className="text-sm">
              {audioClipUrl
                ? "🎵 Original"
                : timestamp
                ? "▶️ YouTube"
                : "🔊 Listen"}
            </span>
          </>
        )}
      </button>

      {/* YouTube 플레이어 모달 */}
      {showYouTubePlayer && videoId && timestamp && (
        <YouTubePlayerModal
          videoId={videoId}
          startTime={timestamp.start}
          endTime={timestamp.end}
          onClose={() => setShowYouTubePlayer(false)}
        />
      )}
    </>
  );
}
