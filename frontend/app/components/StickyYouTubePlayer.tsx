interface StickyYouTubePlayerProps {
  videoId: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function StickyYouTubePlayer({ videoId, isVisible, onClose }: StickyYouTubePlayerProps) {
  if (!isVisible) return null;

  return (
    <div className="sticky top-0 z-40 bg-black shadow-lg">
      <div className="relative" style={{ paddingBottom: '56.25%' /* 16:9 비율 */ }}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    </div>
  );
}