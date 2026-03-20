import { useState, useEffect, useRef } from 'react';
import type {
  DramaSentence,
  VideoClip,
  SubtitleMode,
  MemorizationSession,
  UserRecording,
  MimickingExercise,
  MimickingStep
} from '@/app/types/drama';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

interface DramaSentenceMemorizerProps {
  clips: VideoClip[];
  onSessionComplete: (session: MemorizationSession) => void;
  isShorts?: boolean;
}

export default function DramaSentenceMemorizer({ clips, onSessionComplete, isShorts = false }: DramaSentenceMemorizerProps) {
  const [session, setSession] = useState<MemorizationSession | null>(null);
  const [currentClip, setCurrentClip] = useState<VideoClip | null>(null);
  const [currentSentence, setCurrentSentence] = useState<DramaSentence | null>(null);
  const [subtitleMode, setSubtitleMode] = useState<SubtitleMode>({
    mode: 'both',
    showRomanization: true,
    showPronunciation: false
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [apiReady, setApiReady] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [userRecording, setUserRecording] = useState<UserRecording | null>(null);
  const [mimickingExercise, setMimickingExercise] = useState<MimickingExercise | null>(null);
  const [playerError, setPlayerError] = useState<{ code: number; message: string } | null>(null);

  // Helper: Set state AND sync ref at the same time
  const setCurrentSentenceAndRef = (s: DramaSentence | null) => {
    currentSentenceRef.current = s;
    setCurrentSentence(s);
  };
  const setIsPlayingAndRef = (v: boolean) => {
    isPlayingRef.current = v;
    setIsPlaying(v);
  };

  const playerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // ⚡ Ref-based state mirrors to avoid stale closures in setInterval
  const currentSentenceRef = useRef<DramaSentence | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    initializeSession();
  }, [clips]);

  // Initialize YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const checkAPI = setInterval(() => {
      if (window.YT && window.YT.Player) {
        setApiReady(true);
        clearInterval(checkAPI);
      }
    }, 500);

    return () => {
      clearInterval(checkAPI);
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentClip && apiReady && window.YT && window.YT.Player) {
      console.log('📺 Initializing/Updating Player for Video:', currentClip.videoId);
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        try {
          playerRef.current.loadVideoById({
            videoId: currentClip.videoId,
            startSeconds: currentSentence?.startTime || 0
          });
          playerRef.current.pauseVideo();
        } catch (e) {
          console.error('❌ Failed to load video by ID:', e);
          createPlayer();
        }
      } else {
        createPlayer();
      }
    }
  }, [currentClip?.videoId, apiReady]); // Use specific videoId to avoid unnecessary re-runs

  const createPlayer = () => {
    if (!currentClip || !currentClip.videoId) {
      console.warn('⚠️ Cannot create player: videoId is missing');
      return;
    }

    console.log('🏗️ Creating new YT.Player instance...');

    // Clear existing player if its container is gone
    const container = document.getElementById('youtube-player');
    if (!container) {
      console.error('❌ youtube-player container not found in DOM');
      return;
    }

    try {
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: currentClip.videoId,
        playerVars: {
          autoplay: 0,
          controls: 1, // Temporarily enabled to see YouTube internal errors
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          disablekb: 0,
          fs: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (e: any) => {
            console.log('✅ Player Ready');
            onPlayerReady(e);
          },
          onStateChange: (e: any) => {
            console.log('🔄 Player State Change:', e.data);
            onPlayerStateChange(e);
          },
          onError: (e: any) => {
            // Using warn instead of error to prevent dev tools from flagging this as a crash
            console.warn('📺 YouTube Player API signaled an error:', e.data);

            let message = "An error occurred with the video player.";
            if (e.data === 101 || e.data === 150) {
              message = "This video cannot be played here because the owner has disabled embedding. 🔒";
            } else if (e.data === 100) {
              message = "The video was not found. It might have been deleted or set to private.";
            } else if (e.data === 2 || e.data === 5) {
              message = "Invalid video parameter or HTML5 player error.";
            }

            setPlayerError({ code: e.data, message });
          }
        }
      });
    } catch (err) {
      console.warn('⚠️ Non-critical error during YT.Player construction:', err);
      setPlayerError({ code: -1, message: "Could not initialize player. Please try another video." });
    }
  };

  const onPlayerReady = (event: any) => {
    const sentence = currentSentenceRef.current;
    if (sentence) {
      // ⚡ ref에서 읽어 Seek - stale closure 없음
      event.target.seekTo(Math.max(0, sentence.startTime - 0.3), true);
    }
  };

  const onPlayerStateChange = (event: any) => {
    // 1: playing, 2: paused, 0: ended
    if (event.data === 1) {
      setIsPlayingAndRef(true);
      startTimeUpdates();
    } else {
      setIsPlayingAndRef(false);
      stopTimeUpdates();
    }
  };

  const startTimeUpdates = () => {
    if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);

    timeUpdateIntervalRef.current = setInterval(() => {
      // ⚡ Read from refs to always have the latest state (no stale closure)
      const sentence = currentSentenceRef.current;
      const playing = isPlayingRef.current;

      if (playerRef.current && playerRef.current.getCurrentTime && playing && sentence) {
        const currentTime = playerRef.current.getCurrentTime();
        setCurrentTime(currentTime);

        // 1. µ정전 종료 지점 체크: endTime 임박 시 일시 정지
        if (currentTime >= sentence.endTime) {
          console.log('🛑 End time reached, pausing.', { currentTime, end: sentence.endTime });
          playerRef.current.pauseVideo();
          setIsPlayingAndRef(false);
          stopTimeUpdates();
          return;
        }

        // 2. 싱크 이탈 감시 (Watchdog) - 1s 이상 볼어나오면 재정렬
        if (currentTime < sentence.startTime - 1.5) {
          console.warn('⚠️ Before start, re-seeking to:', sentence.startTime);
          playerRef.current.seekTo(Math.max(0, sentence.startTime - 0.3), true);
        }
      }
    }, 50); // 50ms 간격으로 고정밀 체크
  };

  const stopTimeUpdates = () => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  };

  const initializeSession = () => {
    if (clips.length === 0) return;

    // 타임스탬프 필터링 후 문장이 하나도 없을 수 있음
    const firstClipWithSentences = clips.find(c => c.sentences.length > 0);
    if (!firstClipWithSentences) {
      console.warn('⚠️ No sentences with valid timestamps found in any clip.');
      return;
    }

    const newSession: MemorizationSession = {
      id: Date.now().toString(),
      clips,
      currentClipIndex: clips.indexOf(firstClipWithSentences),
      currentSentenceIndex: 0,
      mode: 'practice',
      subtitleMode,
      startTime: new Date(),
      progress: {
        sentencesWatched: 0,
        sentencesPracticed: 0,
        sentencesMastered: 0,
        averageAccuracy: 0,
        timeSpent: 0
      },
      userRecordings: []
    };

    setSession(newSession);
    setCurrentClip(firstClipWithSentences);
    setCurrentSentenceAndRef(firstClipWithSentences.sentences[0]);
    updateExercise(firstClipWithSentences.sentences[0]);
  };

  const updateExercise = (sentence: DramaSentence | null | undefined) => {
    if (!sentence) return; // 가드
    const exercise = createMimickingExercise(sentence);
    setMimickingExercise(exercise);
  };

  const createMimickingExercise = (sentence: DramaSentence): MimickingExercise => {
    const exercise: MimickingExercise = {
      id: `mimic-${sentence.id}`,
      sentence,
      steps: [
        {
          type: 'listen',
          title: 'Step 1: Listen',
          instruction: 'Listen to the native speaker pronounce the sentence naturally.',
          completed: false
        },
        {
          type: 'breakdown',
          title: 'Step 2: Breakdown',
          instruction: 'Listen to each word pronounced separately.',
          completed: false
        },
        {
          type: 'slow',
          title: 'Step 3: Slow Practice',
          instruction: 'Practice at 80% speed to get the rhythm right.',
          completed: false
        },
        {
          type: 'practice',
          title: 'Step 4: Shadow Practice',
          instruction: 'Repeat along with the native speaker at normal speed.',
          completed: false
        },
        {
          type: 'record',
          title: 'Step 5: Record Yourself',
          instruction: 'Record your pronunciation and compare with the original.',
          completed: false
        }
      ],
      currentStep: 0,
      completed: false,
      score: 0
    };

    setMimickingExercise(exercise);
    return exercise;
  };

  const handleStepAction = (step: MimickingStep, index: number) => {
    const sentence = currentSentenceRef.current; // ⚡ always fresh
    if (!sentence || !mimickingExercise) return;

    if (step.type === 'record') {
      if (recordingStatus === 'idle') startRecording();
      else if (recordingStatus === 'recording') stopRecording();
      return;
    }

    if (playerRef.current) {
      let rate = 1.0;
      if (step.type === 'slow') rate = 0.8;
      else if (step.type === 'breakdown') rate = 0.7;

      try {
        if (playerRef.current.setPlaybackRate) playerRef.current.setPlaybackRate(rate);
        playerRef.current.seekTo(Math.max(0, sentence.startTime - 0.3), true);
        playerRef.current.playVideo();
      } catch (err) {
        console.error('Playback action failed:', err);
      }
    }

    setMimickingExercise({
      ...mimickingExercise,
      steps: mimickingExercise.steps.map((s, i) =>
        i === index ? { ...s, completed: true } : s
      )
    });
  };

  const handlePlayPause = () => {
    const sentence = currentSentenceRef.current;
    const playing = isPlayingRef.current;

    // If player is not ready, try to create it manually on click
    if (!playerRef.current) {
      if (window.YT && window.YT.Player) {
        createPlayer();
        setTimeout(() => {
          if (playerRef.current?.playVideo) playerRef.current.playVideo();
        }, 500);
      } else {
        console.error('❌ YouTube API not ready yet');
      }
      return;
    }

    if (!sentence) {
      console.warn('⚠️ No current sentence selected');
      return;
    }

    try {
      if (playing) {
        playerRef.current.pauseVideo();
      } else {
        const currentPos = typeof playerRef.current.getCurrentTime === 'function'
          ? playerRef.current.getCurrentTime()
          : -1;

        // 현재 위치가 문장 범위 밖이면 시작 지점으로 seek
        if (currentPos < sentence.startTime - 0.5 || currentPos >= sentence.endTime) {
          playerRef.current.seekTo(Math.max(0, sentence.startTime - 0.3), true);
        }
        // 속도 정상화
        if (playerRef.current.setPlaybackRate) playerRef.current.setPlaybackRate(1.0);
        playerRef.current.playVideo();
      }
    } catch (err) {
      console.error('❌ Error in handlePlayPause:', err);
      createPlayer();
    }
  };

  const handleSubtitleModeChange = (mode: SubtitleMode['mode']) => {
    const newMode = { ...subtitleMode, mode };
    setSubtitleMode(newMode);
    if (session) {
      setSession({ ...session, subtitleMode: newMode });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        processRecording(audioBlob);
      };

      mediaRecorder.start();
      setRecordingStatus('recording');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to use recording features.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingStatus === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingStatus('processing');
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    setRecordingStatus('processing');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('target_sentence', currentSentence?.korean || '');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/evaluate-pronunciation`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Evaluation failed');
      const data = await res.json();

      const analysis = {
        overallScore: data.score,
        phonemeScores: [],
        feedback: data.feedback,
        improvements: data.improvements
      };

      const recording: UserRecording = {
        sentenceId: currentSentence?.id || '',
        audioBlob,
        accuracy: analysis.overallScore,
        pronunciation: analysis,
        timestamp: new Date()
      };

      setUserRecording(recording);
      setRecordingStatus('idle');

      // Update session
      if (session) {
        const updatedSession = {
          ...session,
          userRecordings: [...session.userRecordings, recording],
          progress: {
            ...session.progress,
            sentencesPracticed: session.progress.sentencesPracticed + 1,
            averageAccuracy: ((session.progress.averageAccuracy * session.progress.sentencesPracticed) + analysis.overallScore) / (session.progress.sentencesPracticed + 1)
          }
        };
        setSession(updatedSession);
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      alert('Failed to evaluate pronunciation. Please try again.');
      setRecordingStatus('idle');
    }
  };

  const moveToNextSentence = () => {
    if (!session || !currentClip) return;

    const nextSentenceIndex = session.currentSentenceIndex + 1;

    if (nextSentenceIndex < currentClip.sentences.length) {
      // Move to next sentence in same clip
      const nextSentence = currentClip.sentences[nextSentenceIndex];
      setCurrentSentenceAndRef(nextSentence); // ⚡ ref도 같이 업데이트
      setSession({ ...session, currentSentenceIndex: nextSentenceIndex });
      updateExercise(nextSentence);
      setUserRecording(null);
      if (playerRef.current) {
        playerRef.current.seekTo(Math.max(0, nextSentence.startTime - 0.3), true);
        playerRef.current.pauseVideo();
      }
    } else {
      // Move to next clip
      const nextClipIndex = session.currentClipIndex + 1;
      if (nextClipIndex < clips.length) {
        const nextClip = clips[nextClipIndex];
        setCurrentClip(nextClip);
        setCurrentSentenceAndRef(nextClip.sentences[0]); // ⚡ ref도 같이 업데이트
        setSession({
          ...session,
          currentClipIndex: nextClipIndex,
          currentSentenceIndex: 0
        });
        updateExercise(nextClip.sentences[0]);
        setUserRecording(null);
      } else {
        // Session complete
        completeSession();
      }
    }
  };

  const completeSession = () => {
    if (!session) return;

    const completedSession = {
      ...session,
      progress: {
        ...session.progress,
        timeSpent: Math.floor((Date.now() - session.startTime.getTime()) / 1000)
      }
    };

    onSessionComplete(completedSession);
  };

  const getSubtitleText = () => {
    if (!currentSentence) return '';

    switch (subtitleMode.mode) {
      case 'korean':
        return currentSentence.korean;
      case 'english':
        return currentSentence.english;
      case 'both':
        return `${currentSentence.korean}\n${currentSentence.english}`;
      case 'none':
        return '';
      default:
        return currentSentence.korean;
    }
  };

  if (!session || !currentClip || !currentSentence) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse">
          <div className="w-16 h-16 border-4 border-[var(--background)] border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-[var(--background)] rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.2)] overflow-hidden border border-white/10">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 pb-6 border-b border-black/5">
        <div>
          <h2 className="text-4xl font-black text-[var(--font-dark)] tracking-tight">Practice Sessions</h2>
          <p className="text-[var(--lightblue)] font-extrabold">{currentClip.title}</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-sm font-black text-white bg-slate-900 px-5 py-2.5 rounded-full shadow-lg">
            Sentence {session.currentSentenceIndex + 1} / {currentClip.sentences.length}
          </div>
          <div className="text-sm font-black text-black bg-[var(--lemon)] px-5 py-2.5 rounded-full shadow-lg border border-black/5">
            Clip {session.currentClipIndex + 1} / {clips.length}
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className={`relative bg-black rounded-lg overflow-hidden mb-6 ${isShorts ? 'aspect-[9/16] max-w-sm mx-auto' : 'aspect-video w-full'}`}>
        <div id="youtube-player" className="w-full h-full"></div>

        {/* Error Overlay */}
        {playerError && (
          <div className="absolute inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-8 text-center">
            <div className="text-5xl mb-4">🚫</div>
            <h3 className="text-white text-xl font-bold mb-2">Video Unplayable</h3>
            <p className="text-gray-300 mb-6">{playerError.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => window.open(`https://www.youtube.com/watch?v=${currentClip.videoId}`, '_blank')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
              >
                Watch on YouTube 📺
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
              >
                Try Another Video 🔄
              </button>
            </div>
            {playerError.code === 150 && (
              <p className="text-xs text-gray-500 mt-4">
                Tip: This often happens with official TV show clips. Try searching for "Shorts" or different uploaders of the same clip.
              </p>
            )}
          </div>
        )}

        {/* Subtitles */}
        {!playerError && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pointer-events-none">
            <div className="text-center text-white">
              <p className="text-2xl font-bold mb-2">{getSubtitleText()}</p>
              {subtitleMode.showRomanization && (
                <p className="text-lg opacity-80">[{currentSentence.pronunciation}]</p>
              )}
            </div>
          </div>
        )}

        {/* Video Controls */}
        {!playerError && (
          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('▶️ Play Button Clicked (UI Overlay)');
                handlePlayPause();
              }}
              className="bg-white/90 text-black p-4 rounded-full hover:bg-white transition-all shadow-xl active:scale-95 pointer-events-auto border-2 border-white/50"
            >
              {isPlaying ? (
                <span className="text-2xl" aria-hidden="true">⏸️</span>
              ) : (
                <span className="text-2xl" aria-hidden="true">▶️</span>
              )}
            </button>

            <div className="flex items-center space-x-2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm pointer-events-auto">
              <span className="text-white text-sm font-mono font-bold">
                {currentTime.toFixed(1)}s / {currentSentence.endTime.toFixed(1)}s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Subtitle Mode Controls */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-3">Subtitle Mode</h3>
        <div className="flex flex-wrap gap-2">
          {(['korean', 'english', 'both', 'none'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => handleSubtitleModeChange(mode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${subtitleMode.mode === mode
                ? 'bg-[var(--background)] text-black'
                : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              {mode === 'korean' && '🇰🇷 Korean'}
              {mode === 'english' && '🇺🇸 English'}
              {mode === 'both' && '🇰🇷+🇺🇸 Both'}
              {mode === 'none' && '🚫 None'}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={subtitleMode.showRomanization}
              onChange={(e) => setSubtitleMode({ ...subtitleMode, showRomanization: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm">Show Romanization</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              onChange={(e) => setSubtitleMode({ ...subtitleMode, showPronunciation: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm">Show Pronunciation Guide</span>
          </label>
        </div>
      </div>

      {/* Target Sentence Display - High Contrast Refactor */}
      <div className="bg-black/30 border-2 border-white/20 backdrop-blur-2xl p-10 rounded-[2.5rem] mb-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] group transition-all duration-500 hover:border-[var(--lemon)]/30">
        <div className="flex justify-between items-center mb-8">
          <span className="bg-[var(--lemon)] text-black px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(239,248,137,0.4)]">
            🎯 Target Sentence
          </span>
          <div className="flex gap-2">
            <span className="px-4 py-1.5 rounded-xl text-[10px] font-black bg-white/10 text-white border border-white/20 uppercase tracking-widest">
              {currentSentence.difficulty} LEVEL
            </span>
          </div>
        </div>

        <h2 className="text-5xl font-black mb-8 leading-[1.2] text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] tracking-tight">
          {currentSentence.korean}
        </h2>

        <div className="space-y-4 border-l-[6px] border-[var(--lemon)] pl-8 py-2 bg-white/5 rounded-r-2xl">
          <p className="text-2xl italic font-black text-[var(--lemon)] drop-shadow-sm">
            "{currentSentence.english}"
          </p>
          {currentSentence.pronunciation && (
            <p className="text-sm font-mono text-[var(--font-dark)] font-black uppercase tracking-widest opacity-80">
              [{currentSentence.pronunciation}]
            </p>
          )}
        </div>
      </div>

      {/* Mimicking Exercise */}
      {mimickingExercise && (
        <div className="bg-[var(--lightblue)] border border-white/20 backdrop-blur-xl p-8 rounded-3xl mb-10 shadow-2xl overflow-hidden relative group">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black flex items-center gap-3 text-white drop-shadow-lg">
              <span className="p-2 bg-black/40 rounded-xl shadow-inner text-2xl">🎭</span> Mimicking Practice
            </h3>
            <span className="text-[10px] font-black px-4 py-2 rounded-full text-black bg-[var(--lemon)] uppercase tracking-widest shadow-[0_0_20px_rgba(239,248,137,0.4)]">
              Step {mimickingExercise.currentStep + 1} / 5
            </span>
          </div>

          <div className="space-y-4">
            {mimickingExercise.steps.map((step, index) => {
              const isActive = index === mimickingExercise.currentStep;
              const isCompleted = index < mimickingExercise.currentStep;

              return (
                <div
                  key={step.type}
                  onClick={() => {
                    setMimickingExercise({
                      ...mimickingExercise,
                      currentStep: index
                    });
                  }}
                  className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${isActive
                    ? 'border-[var(--lemon)] bg-white shadow-2xl transform scale-[1.02] ring-2 ring-[var(--lemon)]/50'
                    : 'border-white/10 bg-black/20 hover:border-white/30 hover:bg-black/40'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-500 shadow-md ${isCompleted ? 'bg-green-500 text-white' :
                        isActive ? 'text-black bg-[var(--lemon)]' : 'bg-white/5 text-white/40 border border-white/10'
                        }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <div>
                        <h4 className={`text-xl font-black transition-colors ${isActive ? 'text-black' : 'text-white'}`}>
                          {step.title}
                        </h4>
                        <p className={`text-sm font-bold transition-colors ${isActive ? 'text-black/60' : 'text-white/50'}`}>
                          {step.instruction}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isActive && (
                        <div className="flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStepAction(step, index);
                            }}
                            className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${step.type === 'record'
                              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse border-2 border-red-400/30'
                              : 'bg-black text-[var(--lemon)] hover:bg-black/90'
                              }`}
                          >
                            {step.type === 'record' ? (
                              recordingStatus === 'idle' ? '🎤 Record Now' :
                                recordingStatus === 'recording' ? '⏹️ Stop' : '⏳ Processing...'
                            ) : (
                              step.completed ? '▶️ Play Again' : 'Start →'
                            )}
                          </button>

                          {step.completed && index < mimickingExercise.steps.length - 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMimickingExercise({
                                  ...mimickingExercise,
                                  currentStep: index + 1
                                });
                              }}
                              className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white shadow-2xl transition-all active:scale-95 animate-in fade-in slide-in-from-left-4"
                            >
                              Next →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recording Results */}
      {userRecording && (
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl p-8 rounded-3xl mb-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--lemon)]/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-[var(--lemon)]/20 transition-colors duration-700"></div>

          <h3 className="text-xl font-black text-[var(--brown)] mb-8 flex items-center gap-3">
            <span className="p-2 bg-white/10 rounded-xl">🎤</span> Analysis Report
          </h3>

          <div className="flex flex-col md:flex-row gap-8 items-stretch justify-between">
            <div className="text-center md:text-left bg-black/40 border border-white/10 p-6 rounded-3xl shadow-inner min-w-[160px] flex flex-col justify-center">
              <p className="text-6xl font-black text-[var(--lemon)] drop-shadow-[0_0_15px_rgba(239,248,137,0.3)]">
                {userRecording.accuracy}<span className="text-2xl opacity-60">%</span>
              </p>
              <p className="text-[10px] font-black text-[var(--brown)] uppercase tracking-[0.2em] mt-3">Score</p>
            </div>

            <div className="flex-1 space-y-4">
              {userRecording.pronunciation.feedback && userRecording.pronunciation.feedback.length > 0 && (
                <div className="bg-green-500/10 p-5 rounded-2xl border border-green-500/20 backdrop-blur-sm">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-600"></span> Perfect Highlights
                  </p>
                  <div className="space-y-2">
                    {userRecording.pronunciation.feedback.map((feedback, index) => (
                      <p key={index} className="text-sm text-[var(--brown)] font-bold flex items-center gap-2">
                        <span className="text-green-600">✦</span> {feedback}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {userRecording.pronunciation.improvements && userRecording.pronunciation.improvements.length > 0 && (
                <div className="bg-orange-500/10 p-5 rounded-2xl border border-orange-500/20 backdrop-blur-sm">
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span> Pro Improvements
                  </p>
                  <div className="space-y-2">
                    {userRecording.pronunciation.improvements.map((improvement, index) => (
                      <p key={index} className="text-sm text-[var(--brown)] font-bold flex items-center gap-2">
                        <span className="text-orange-400">⚡</span> {improvement}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Decision Section */}
          <div className="mt-10 flex flex-col sm:flex-row gap-5 pt-8 border-t border-white/20">
            <button
              onClick={() => {
                setUserRecording(null);
                if (currentSentence) updateExercise(currentSentence);
                if (playerRef.current) {
                  playerRef.current.seekTo(currentSentence?.startTime || 0, true);
                  playerRef.current.playVideo();
                }
              }}
              className="flex-1 px-8 py-4 rounded-2xl font-black bg-black text-[var(--lemon)] border-2 border-[var(--lemon)]/20 hover:bg-black/90 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl group/retry"
            >
              <span className="group-hover/retry:rotate-180 transition-transform duration-500 text-xl">🔄</span> Retry Practice
            </button>
            <button
              onClick={moveToNextSentence}
              disabled={!session || session.currentSentenceIndex >= currentClip.sentences.length - 1}
              className={`flex-1 px-8 py-4 rounded-2xl font-black text-black shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 hover:scale-[1.02] ${!session || session.currentSentenceIndex >= currentClip.sentences.length - 1
                ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
                : 'bg-[var(--lemon)] hover:brightness-110'
                }`}
            >
              <span className="text-lg">Next Sentence</span>
              <span className="text-2xl">➡️</span>
            </button>
          </div>
        </div>
      )}

      {/* Sentence Context */}
      <div className="bg-[var(--primary-dark)] border border-white/10 backdrop-blur-sm p-8 rounded-3xl mb-10 overflow-hidden relative">
        <h3 className="text-xl font-black text-[var(--font)] mb-6 flex items-center gap-3">
          <span className="p-2 bg-white/10 rounded-xl">📚</span> Context & Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black text-[var(--lightblue)] uppercase tracking-[0.2em] mb-2">Narrative Context</p>
              <p className="text-[var(--font)] leading-relaxed font-medium">{currentSentence.context}</p>
            </div>

            <div>
              <p className="text-[10px] font-black text-[var(--lightblue)] uppercase tracking-[0.2em] mb-2">Key Characters</p>
              <div className="flex flex-wrap gap-2">
                {currentSentence.characters.map((char, i) => (
                  <span key={i} className="px-3 py-1 bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-[var(--font)]">
                    {char}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {currentSentence.culturalNotes && (
              <div>
                <p className="text-[10px] font-black text-[var(--lightblue)] uppercase tracking-[0.2em] mb-2">Cultural Notes</p>
                <div className="bg-[var(--font)]/5 border border-[var(--lemon)]/20 p-4 rounded-2xl">
                  <p className="text-sm text-[var(--font)]/90 leading-relaxed italic">"{currentSentence.culturalNotes}"</p>
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] font-black text-[var(--lightblue)] uppercase tracking-[0.2em] mb-2">Linguistic Challenge</p>
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${currentSentence.difficulty === 'easy' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                currentSentence.difficulty === 'medium' ? 'bg-[var(--lemon)]/20 text-[var(--lemon)] border border-[var(--lemon)]/30' :
                  'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                {currentSentence.difficulty} Level
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => {
            console.log('➡️ Move to next sentence');
            moveToNextSentence();
          }}
          className="px-12 py-4 bg-[var(--lemon)] text-black rounded-xl font-bold hover:bg-[var(--primary-dark)] hover:text-white transition-all shadow-lg active:scale-95 flex items-center gap-3 text-lg"
        >
          <span>Next Sentence</span>
          <span className="text-xl">➡️</span>
        </button>
      </div>
    </div>
  );
}