'use client';

import { useRef, useEffect } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  startTime?: number;
  endTime?: number;
  onClose: () => void;
}

export default function YouTubePlayerModal({ videoId, startTime = 0, endTime, onClose }: YouTubePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // endTime이 있으면 타이머 설정
    if (endTime) {
      const duration = (endTime - startTime) * 1000;
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [endTime, startTime, onClose]);

  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${Math.floor(startTime)}&autoplay=1${endTime ? `&end=${Math.floor(endTime)}` : ''}`;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* YouTube iframe */}
        <iframe
          ref={iframeRef}
          width="800"
          height="450"
          src={embedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="max-w-[90vw] max-h-[80vh]"
        />
      </div>
    </div>
  );
}
