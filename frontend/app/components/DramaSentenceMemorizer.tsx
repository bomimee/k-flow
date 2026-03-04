import { useState, useEffect, useRef } from 'react';
import type {
  DramaSentence,
  VideoClip,
  SubtitleMode,
  MemorizationSession,
  UserRecording,
  MimickingExercise
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
}

export default function DramaSentenceMemorizer({ clips, onSessionComplete }: DramaSentenceMemorizerProps) {
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
  const [showTranscript, setShowTranscript] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [userRecording, setUserRecording] = useState<UserRecording | null>(null);
  const [mimickingExercise, setMimickingExercise] = useState<MimickingExercise | null>(null);

  const playerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentClip && window.YT && window.YT.Player) {
      if (playerRef.current) {
        playerRef.current.loadVideoById({
          videoId: currentClip.videoId,
          startSeconds: currentSentence?.startTime || 0
        });
      } else {
        createPlayer();
      }
    }
  }, [currentClip]);

  const createPlayer = () => {
    if (!currentClip) return;

    playerRef.current = new window.YT.Player('youtube-player', {
      height: '100%',
      width: '100%',
      videoId: currentClip.videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        rel: 0,
        showinfo: 0,
        modestbranding: 1,
        disablekb: 1,
        fs: 0
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
  };

  const onPlayerReady = (event: any) => {
    if (currentSentence) {
      event.target.seekTo(currentSentence.startTime, true);
    }
  };

  const onPlayerStateChange = (event: any) => {
    // 1: playing, 2: paused
    if (event.data === 1) {
      setIsPlaying(true);
      startTimeUpdates();
    } else {
      setIsPlaying(false);
      stopTimeUpdates();
    }
  };

  const startTimeUpdates = () => {
    if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    timeUpdateIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);

        if (currentSentence && time >= currentSentence.endTime) {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
        }
      }
    }, 100);
  };

  const stopTimeUpdates = () => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  };

  const initializeSession = () => {
    if (clips.length === 0) return;

    const newSession: MemorizationSession = {
      id: Date.now().toString(),
      clips,
      currentClipIndex: 0,
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
    setCurrentClip(clips[0]);
    setCurrentSentence(clips[0].sentences[0]);
    createMimickingExercise(clips[0].sentences[0]);
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

  const handlePlayPause = () => {
    if (!playerRef.current || !currentSentence) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      const currentPos = playerRef.current.getCurrentTime();
      if (currentPos >= currentSentence.endTime || currentPos < currentSentence.startTime) {
        playerRef.current.seekTo(currentSentence.startTime, true);
      }
      playerRef.current.playVideo();
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
    // Simulate pronunciation analysis
    const mockAnalysis = {
      overallScore: Math.floor(Math.random() * 30) + 70, // 70-100
      phonemeScores: [],
      feedback: ['Good rhythm!', 'Clear pronunciation'],
      improvements: ['Work on intonation']
    };

    const recording: UserRecording = {
      sentenceId: currentSentence?.id || '',
      audioBlob,
      accuracy: mockAnalysis.overallScore,
      pronunciation: mockAnalysis,
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
          averageAccuracy: ((session.progress.averageAccuracy * session.progress.sentencesPracticed) + mockAnalysis.overallScore) / (session.progress.sentencesPracticed + 1)
        }
      };
      setSession(updatedSession);
    }
  };

  const moveToNextSentence = () => {
    if (!session || !currentClip) return;

    const nextSentenceIndex = session.currentSentenceIndex + 1;

    if (nextSentenceIndex < currentClip.sentences.length) {
      // Move to next sentence in same clip
      const nextSentence = currentClip.sentences[nextSentenceIndex];
      setCurrentSentence(nextSentence);
      setSession({ ...session, currentSentenceIndex: nextSentenceIndex });
      createMimickingExercise(nextSentence);
      setUserRecording(null);
      if (playerRef.current) {
        playerRef.current.seekTo(nextSentence.startTime, true);
        playerRef.current.pauseVideo();
      }
    } else {
      // Move to next clip
      const nextClipIndex = session.currentClipIndex + 1;
      if (nextClipIndex < clips.length) {
        const nextClip = clips[nextClipIndex];
        setCurrentClip(nextClip);
        setCurrentSentence(nextClip.sentences[0]);
        setSession({
          ...session,
          currentClipIndex: nextClipIndex,
          currentSentenceIndex: 0
        });
        createMimickingExercise(nextClip.sentences[0]);
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Drama Sentence Practice</h2>
          <p className="text-gray-600">{currentClip.title}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Sentence {session.currentSentenceIndex + 1} of {currentClip.sentences.length}
          </div>
          <div className="text-sm text-gray-600">
            Clip {session.currentClipIndex + 1} of {clips.length}
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden mb-6 aspect-video">
        <div id="youtube-player" className="w-full h-full"></div>

        {/* Subtitles */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pointer-events-none">
          <div className="text-center text-white">
            <p className="text-2xl font-bold mb-2">{getSubtitleText()}</p>
            {subtitleMode.showRomanization && (
              <p className="text-lg opacity-80">[{currentSentence.pronunciation}]</p>
            )}
          </div>
        </div>

        {/* Video Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none">
          <button
            onClick={handlePlayPause}
            className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors pointer-events-auto"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          <div className="flex items-center space-x-2 bg-black/40 px-3 py-1 rounded-full">
            <span className="text-white text-sm">
              {currentTime.toFixed(1)}s / {currentSentence.endTime.toFixed(1)}s
            </span>
          </div>
        </div>
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
                  ? 'bg-[var(--background)] text-white'
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
              checked={subtitleMode.showPronunciation}
              onChange={(e) => setSubtitleMode({ ...subtitleMode, showPronunciation: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm">Show Pronunciation Guide</span>
          </label>
        </div>
      </div>

      {/* Mimicking Exercise */}
      {mimickingExercise && (
        <div className="bg-gradient-to-r from-[var(--lemon)] to-[var(--lightbeige)] p-6 rounded-lg mb-6">
          <h3 className="text-xl font-bold mb-4">🎭 Mimicking Exercise</h3>

          <div className="space-y-4">
            {mimickingExercise.steps.map((step, index) => (
              <div
                key={step.type}
                className={`p-4 rounded-lg border-2 transition-all ${index === mimickingExercise.currentStep
                    ? 'border-[var(--background)] bg-white'
                    : index < mimickingExercise.currentStep
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{step.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{step.instruction}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {index < mimickingExercise.currentStep && (
                      <span className="text-green-500">✓</span>
                    )}
                    {index === mimickingExercise.currentStep && (
                      <button
                        onClick={() => {
                          if (step.type === 'record') {
                            if (recordingStatus === 'idle') {
                              startRecording();
                            } else if (recordingStatus === 'recording') {
                              stopRecording();
                            }
                          } else {
                            // Handle other step types
                            const nextStep = index + 1;
                            setMimickingExercise({
                              ...mimickingExercise,
                              currentStep: nextStep,
                              steps: mimickingExercise.steps.map((s, i) => ({
                                ...s,
                                completed: i <= nextStep
                              }))
                            });
                          }
                        }}
                        className="bg-[var(--background)] text-white px-4 py-2 rounded-lg font-medium hover:bg-[var(--lightblue)] transition-colors"
                      >
                        {step.type === 'record' && (
                          recordingStatus === 'idle' ? '🎤 Record' :
                            recordingStatus === 'recording' ? '⏹️ Stop' :
                              '⏳ Processing...'
                        )}
                        {step.type !== 'record' && 'Start'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recording Results */}
      {userRecording && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">🎤 Recording Analysis</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {userRecording.accuracy}%
              </p>
              <p className="text-sm text-gray-600">Accuracy Score</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Feedback:</p>
              {userRecording.pronunciation.feedback.map((feedback, index) => (
                <p key={index} className="text-sm text-green-600">✓ {feedback}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sentence Context */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-3">Context & Analysis</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-700">Context:</p>
            <p className="text-sm text-gray-600">{currentSentence.context}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700">Characters:</p>
            <p className="text-sm text-gray-600">{currentSentence.characters.join(', ')}</p>
          </div>

          {currentSentence.culturalNotes && (
            <div>
              <p className="text-sm font-semibold text-gray-700">Cultural Notes:</p>
              <p className="text-sm text-gray-600">{currentSentence.culturalNotes}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-gray-700">Difficulty:</p>
            <span className={`px-2 py-1 rounded text-xs font-medium ${currentSentence.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                currentSentence.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
              }`}>
              {currentSentence.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          {showTranscript ? 'Hide' : 'Show'} Transcript
        </button>

        <button
          onClick={moveToNextSentence}
          className="px-6 py-3 bg-[var(--background)] text-white rounded-lg font-medium hover:bg-[var(--lightblue)] transition-colors"
        >
          Next Sentence →
        </button>
      </div>
    </div>
  );
}