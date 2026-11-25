import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import {
  ExternalLink,
  ListMusic,
  Loader2,
  Pause,
  Play,
  Radio,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type {
  OrbPlaybackStatus,
  OrbSyncMode,
  SonicTrackItem,
  SpotifyConnectionStatus,
  WebAudioSourceKind,
} from '../../types/sonicOrb';
import { WebAudioAnalyserEngine } from '../../utils/orbAudioSync';
import { parseSpotifyUrl } from '../../utils/spotify';
import {
  fetchSpotifyOembedMetadata,
  loadSpotifyIframeApi,
  spotifyUrlToUri,
  type SpotifyEmbedController,
} from '../../utils/spotifyEmbedApi';
import { SonicOrbCanvas } from '../three/SonicOrbCanvas';

type RepeatMode = 'off' | 'queue' | 'track';

interface BeatsSonicPlayerProps {
  queue: SonicTrackItem[];
  activeTrackId: string;
  onSelectTrack: (trackId: string) => void;
}

function formatMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function BeatsSonicPlayer({
  queue,
  activeTrackId,
  onSelectTrack,
}: BeatsSonicPlayerProps) {
  const activeIndex = useMemo(() => {
    const idx = queue.findIndex((item) => item.id === activeTrackId);
    return idx >= 0 ? idx : 0;
  }, [queue, activeTrackId]);

  const activeTrack: SonicTrackItem = queue[activeIndex] ?? queue[0];

  // Player state
  const [status, setStatus] = useState<OrbPlaybackStatus>('idle');
  const [syncMode, setSyncMode] = useState<OrbSyncMode>('playback-sync');
  const [audioSourceKind, setAudioSourceKind] = useState<WebAudioSourceKind>('local-file');
  const [spotifyStatus, setSpotifyStatus] = useState<SpotifyConnectionStatus>('initializing');
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('queue');

  // Clean unobtrusive trays toggled from the minimal bottom utility bar
  const [queueOpen, setQueueOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [dockExpanded, setDockExpanded] = useState(false);
  const [trackChangeKey, setTrackChangeKey] = useState(0);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);

  // Artwork cache fetched from official Spotify oEmbed endpoint
  const [artworkMap, setArtworkMap] = useState<Record<string, string>>({});

  // Local non-DRM <audio> & Live Tab Audio Web Audio FFT state
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const [localAudioName, setLocalAudioName] = useState<string>('');
  const [volume, setVolume] = useState(0.85);
  const [muted, setMuted] = useState(false);

  const webAudioEngine = useMemo(() => new WebAudioAnalyserEngine(), []);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const embedHostRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const initialUriRef = useRef<string | null>(spotifyUrlToUri(activeTrack?.spotifyUrl));
  const pendingAutoPlayRef = useRef(false);
  const trackEndedHandledRef = useRef(false);
  const repeatModeRef = useRef<RepeatMode>(repeatMode);
  repeatModeRef.current = repeatMode;
  const syncModeRef = useRef<OrbSyncMode>(syncMode);
  syncModeRef.current = syncMode;
  const audioSourceKindRef = useRef<WebAudioSourceKind>(audioSourceKind);
  audioSourceKindRef.current = audioSourceKind;

  const displayTrack: SonicTrackItem = useMemo(() => {
    if (syncMode === 'web-audio-fft' && audioSourceKind === 'local-file' && localAudioUrl) {
      return {
        ...activeTrack,
        id: `local-${localAudioName}`,
        title: localAudioName || 'Local Audio File',
        artist: 'Web Audio API · Live Frequency Spectrum',
        collection: 'Direct Frequency Analysis (FFT)',
        roomLabel: 'Web Audio FFT',
        energyProfile: { bpm: 100, warmth: 0.65, depth: 0.85 },
      };
    }
    return activeTrack;
  }, [activeTrack, audioSourceKind, localAudioName, localAudioUrl, syncMode]);

  // Fetch genuine album/playlist thumbnail from Spotify oEmbed for active track
  useEffect(() => {
    if (!activeTrack?.spotifyUrl) return;
    if (activeTrack.artworkUrl || artworkMap[activeTrack.id]) return;

    let cancelled = false;
    void fetchSpotifyOembedMetadata(activeTrack.spotifyUrl).then((meta) => {
      if (!cancelled && meta?.thumbnailUrl) {
        setArtworkMap((prev) => ({
          ...prev,
          [activeTrack.id]: meta.thumbnailUrl!,
        }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeTrack, artworkMap]);

  // Trigger gentle orb harmonic pulse on track change without resetting the 3D WebGL scene
  const prevTrackIdRef = useRef(activeTrack?.id);
  useEffect(() => {
    if (prevTrackIdRef.current !== activeTrack?.id) {
      prevTrackIdRef.current = activeTrack?.id;
      setTrackChangeKey((k) => k + 1);
      setPositionMs(0);
      setDurationMs(0);
      trackEndedHandledRef.current = false;

      if (syncModeRef.current === 'web-audio-fft' && audioSourceKindRef.current === 'local-file') {
        localAudioRef.current?.pause();
        setSyncMode('playback-sync');
      }
    }
  }, [activeTrack?.id]);

  // Dispose WebAudioContext & blob URL on unmount
  useEffect(() => {
    return () => {
      webAudioEngine.dispose();
    };
  }, [webAudioEngine]);

  useEffect(() => {
    return () => {
      if (localAudioUrl) {
        URL.revokeObjectURL(localAudioUrl);
      }
    };
  }, [localAudioUrl]);

  // Queue navigation helpers
  const pickNextIndex = useCallback(
    (direction: 1 | -1) => {
      if (queue.length <= 1) return 0;
      if (shuffleEnabled && queue.length > 2) {
        let randomIdx = activeIndex;
        while (randomIdx === activeIndex) {
          randomIdx = Math.floor(Math.random() * queue.length);
        }
        return randomIdx;
      }
      return (activeIndex + direction + queue.length) % queue.length;
    },
    [activeIndex, queue.length, shuffleEnabled]
  );

  const handleNextTrack = useCallback(
    (autoPlay = false) => {
      const next = queue[pickNextIndex(1)];
      if (!next) return;
      pendingAutoPlayRef.current = autoPlay;
      setStatus('loading');
      onSelectTrack(next.id);
    },
    [onSelectTrack, pickNextIndex, queue]
  );

  const handlePrevTrack = useCallback(() => {
    if (syncMode === 'web-audio-fft' && audioSourceKind === 'local-file' && localAudioRef.current) {
      if (localAudioRef.current.currentTime > 3) {
        localAudioRef.current.currentTime = 0;
        return;
      }
    } else if (positionMs > 4000 && controllerRef.current) {
      controllerRef.current.seek(0);
      setPositionMs(0);
      return;
    }

    const prev = queue[pickNextIndex(-1)];
    if (!prev) return;
    pendingAutoPlayRef.current = status === 'playing';
    setStatus('loading');
    onSelectTrack(prev.id);
  }, [audioSourceKind, onSelectTrack, pickNextIndex, positionMs, queue, status, syncMode]);

  const handleNextRef = useRef(handleNextTrack);
  handleNextRef.current = handleNextTrack;

  // Initialize permanent Spotify Embed IFrame API controller once
  useEffect(() => {
    const host = embedHostRef.current;
    const initialUri = initialUriRef.current;
    if (!host || !initialUri) {
      setSpotifyStatus('external-only');
      return;
    }

    let cancelled = false;
    setSpotifyStatus('initializing');

    loadSpotifyIframeApi()
      .then((api) => {
        if (cancelled || !embedHostRef.current) return;
        api.createController(
          embedHostRef.current,
          {
            uri: initialUri,
            width: '100%',
            height: 152,
            theme: '0',
          },
          (controller) => {
            if (cancelled) {
              try {
                controller.destroy();
              } catch {
                // ignore
              }
              return;
            }

            controllerRef.current = controller;

            controller.addListener('ready', () => {
              if (cancelled) return;
              setSpotifyStatus('ready');
              if (pendingAutoPlayRef.current) {
                pendingAutoPlayRef.current = false;
                try {
                  controller.play();
                } catch {
                  // browser autoplay gate respected
                }
              }
            });

            controller.addListener('playback_started', () => {
              if (cancelled) return;
              setSpotifyStatus('ready');
              if (
                syncModeRef.current === 'playback-sync' ||
                audioSourceKindRef.current === 'tab-audio'
              ) {
                setStatus('playing');
              }
            });

            controller.addListener('playback_update', (ev) => {
              if (cancelled) return;
              if (
                syncModeRef.current === 'web-audio-fft' &&
                audioSourceKindRef.current === 'local-file'
              ) {
                return;
              }
              const { isPaused, isBuffering, duration, position } = ev.data;
              setSpotifyStatus('ready');
              setPositionMs(Math.max(0, position || 0));
              setDurationMs(Math.max(0, duration || 0));

              if (isBuffering) {
                setStatus('loading');
              } else if (!isPaused) {
                setStatus('playing');
              } else if ((position || 0) > 250) {
                setStatus('paused');
              } else {
                setStatus('idle');
              }

              if (duration > 2000 && position >= duration - 750 && !isPaused) {
                if (!trackEndedHandledRef.current) {
                  trackEndedHandledRef.current = true;
                  if (repeatModeRef.current === 'track') {
                    controller.seek(0);
                    controller.play();
                  } else if (repeatModeRef.current === 'queue') {
                    handleNextRef.current(true);
                  }
                }
              } else if (duration > 0 && position < duration - 1500) {
                trackEndedHandledRef.current = false;
              }
            });
          }
        );
      })
      .catch(() => {
        if (!cancelled) {
          setSpotifyStatus('basic-embed');
        }
      });

    return () => {
      cancelled = true;
      if (controllerRef.current) {
        try {
          controllerRef.current.destroy();
        } catch {
          // ignore
        }
        controllerRef.current = null;
      }
    };
  }, []);

  // Swap Spotify URI via single persistent controller when activeTrack changes
  const lastLoadedUriRef = useRef<string | null>(initialUriRef.current);
  useEffect(() => {
    const uri = spotifyUrlToUri(activeTrack?.spotifyUrl);
    if (!uri) {
      setSpotifyStatus('external-only');
      return;
    }

    if (controllerRef.current && uri !== lastLoadedUriRef.current) {
      lastLoadedUriRef.current = uri;
      setStatus('loading');
      try {
        controllerRef.current.loadUri(uri);
        if (pendingAutoPlayRef.current) {
          pendingAutoPlayRef.current = false;
          window.setTimeout(() => {
            try {
              controllerRef.current?.play();
            } catch {
              // ignore autoplay gate
            }
          }, 180);
        } else {
          window.setTimeout(() => {
            setStatus((cur) => (cur === 'loading' ? 'idle' : cur));
          }, 800);
        }
      } catch {
        setStatus('idle');
      }
    }
  }, [activeTrack?.spotifyUrl]);

  // Keep local <audio> volume synced
  useEffect(() => {
    if (localAudioRef.current) {
      localAudioRef.current.volume = muted ? 0 : volume;
    }
  }, [muted, volume]);

  const handleTogglePlay = useCallback(() => {
    if (syncMode === 'web-audio-fft' && audioSourceKind === 'local-file' && localAudioRef.current) {
      webAudioEngine.attachAudioElement(localAudioRef.current);
      webAudioEngine.resumeIfNeeded();
      if (localAudioRef.current.paused) {
        void localAudioRef.current.play();
      } else {
        localAudioRef.current.pause();
      }
      return;
    }

    if (controllerRef.current && spotifyStatus === 'ready') {
      try {
        controllerRef.current.togglePlay();
      } catch {
        setDockExpanded(true);
      }
    } else {
      setDockExpanded(true);
    }
  }, [audioSourceKind, spotifyStatus, syncMode, webAudioEngine]);

  const handleSeek = useCallback(
    (nextMs: number) => {
      if (syncMode === 'web-audio-fft' && audioSourceKind === 'local-file' && localAudioRef.current) {
        localAudioRef.current.currentTime = nextMs / 1000;
        setPositionMs(nextMs);
        return;
      }
      if (controllerRef.current && spotifyStatus === 'ready') {
        try {
          controllerRef.current.seek(Math.floor(nextMs / 1000));
          setPositionMs(nextMs);
        } catch {
          // ignore
        }
      }
    },
    [audioSourceKind, spotifyStatus, syncMode]
  );

  const handleLocalFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioNotice(null);
    webAudioEngine.detachMediaStream();

    if (controllerRef.current && status === 'playing') {
      try {
        controllerRef.current.pause();
      } catch {
        // ignore
      }
    }

    if (localAudioUrl) {
      URL.revokeObjectURL(localAudioUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalAudioUrl(objectUrl);
    setLocalAudioName(file.name.replace(/\.[^/.]+$/, ''));
    setAudioSourceKind('local-file');
    setSyncMode('web-audio-fft');
    setPositionMs(0);
    setDurationMs(0);
    setStatus('loading');
    setTrackChangeKey((k) => k + 1);
  };

  const handleCaptureTabAudio = async () => {
    setAudioNotice(null);
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
      setAudioNotice('Live tab audio capture is unavailable in this browser context. Load a local audio file instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } as MediaTrackConstraints,
      });

      // Drop video tracks immediately; we only analyze audio frequencies
      for (const videoTrack of stream.getVideoTracks()) {
        videoTrack.stop();
        stream.removeTrack(videoTrack);
      }

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        setAudioNotice('No audio track was shared. Enable "Share tab audio" when selecting your browser tab.');
        return;
      }

      const ok = webAudioEngine.attachMediaStream(stream);
      if (!ok) {
        setAudioNotice('Could not attach live Web Audio frequency analyzer to this stream.');
        return;
      }

      audioTracks[0].addEventListener('ended', () => {
        webAudioEngine.detachMediaStream();
        setSyncMode('playback-sync');
        setTrackChangeKey((k) => k + 1);
      });

      setAudioSourceKind('tab-audio');
      setSyncMode('web-audio-fft');
      if (status !== 'playing') {
        setStatus('playing');
      }
      setTrackChangeKey((k) => k + 1);
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError') {
        setAudioNotice('Tab audio capture was cancelled or blocked by iframe permissions. You can load a local audio file for live FFT.');
      } else {
        setAudioNotice('Live tab capture could not start here. Load an audio file for real-time Web Audio FFT.');
      }
    }
  };

  const exitWebAudioMode = () => {
    localAudioRef.current?.pause();
    webAudioEngine.detachMediaStream();
    setSyncMode('playback-sync');
    setAudioNotice(null);
    if (audioSourceKind === 'local-file') {
      setStatus('idle');
      setPositionMs(0);
      setDurationMs(0);
    }
    setTrackChangeKey((k) => k + 1);
  };

  const cycleRepeatMode = () => {
    setRepeatMode((prev) => (prev === 'off' ? 'queue' : prev === 'queue' ? 'track' : 'off'));
  };

  const fallbackParsed = useMemo(
    () => (activeTrack?.spotifyUrl ? parseSpotifyUrl(activeTrack.spotifyUrl) : null),
    [activeTrack?.spotifyUrl]
  );

  const progressMax = Math.max(1000, durationMs || 1000);
  const progressPct = Math.min(100, Math.max(0, (positionMs / progressMax) * 100));
  const canSeek =
    (syncMode === 'web-audio-fft' && audioSourceKind === 'local-file') ||
    (spotifyStatus === 'ready' && durationMs > 0);

  const footerStatusText =
    syncMode === 'web-audio-fft'
      ? audioSourceKind === 'tab-audio'
        ? 'Live Tab Audio · Web Audio FFT'
        : 'Local Audio · Web Audio FFT'
      : 'Spotify playback';

  return (
    <section
      aria-label="BEATS 3D Sonic Orb Listening Room"
      className="w-full max-w-[600px] mx-auto mb-14"
    >
      {/* Hidden non-DRM audio element for real Web Audio FFT mode when user supplies local audio */}
      {localAudioUrl && (
        <audio
          ref={localAudioRef}
          src={localAudioUrl}
          preload="metadata"
          onLoadedMetadata={(e) => {
            const audio = e.currentTarget;
            setDurationMs((audio.duration || 0) * 1000);
            webAudioEngine.attachAudioElement(audio);
            void audio.play().catch(() => {
              setStatus('paused');
            });
          }}
          onPlay={() => {
            if (localAudioRef.current) {
              webAudioEngine.attachAudioElement(localAudioRef.current);
              webAudioEngine.resumeIfNeeded();
            }
            setStatus('playing');
          }}
          onPause={() => {
            if (localAudioRef.current && localAudioRef.current.currentTime > 0.1) {
              setStatus('paused');
            } else {
              setStatus('idle');
            }
          }}
          onTimeUpdate={(e) => {
            setPositionMs(e.currentTarget.currentTime * 1000);
          }}
          onEnded={() => {
            if (repeatMode === 'track' && localAudioRef.current) {
              localAudioRef.current.currentTime = 0;
              void localAudioRef.current.play();
            } else {
              setStatus('idle');
            }
          }}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleLocalFileUpload}
        className="hidden"
        aria-label="Load local audio file for Web Audio FFT analysis"
      />

      {/* Exact Player Composition Container (#101116) */}
      <div className="rounded-2xl bg-[#101116] border border-white/[0.08] p-5 sm:p-7 flex flex-col gap-5 shadow-[0_32px_90px_-36px_rgba(0,0,0,0.85)]">
        {/* Row 1: ANIBEATS | BEATS / LISTENING ROOM */}
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold tracking-tight text-white">ANIBEATS</h3>
          <span className="font-data text-xs uppercase tracking-[0.06em] text-[#A8A9B5]">
            BEATS / LISTENING ROOM
          </span>
        </div>

        {/* Row 2: Centered NOW PLAYING + Commanding 3D Sonic Orb + Title & Artist */}
        <div className="flex flex-col items-center gap-2 py-1">
          <p className="text-xs font-medium tracking-[0.12em] uppercase text-[#B5B7C4]">
            NOW PLAYING
          </p>

          <div className="w-full max-w-[400px] sm:max-w-[440px] aspect-square rounded-2xl overflow-hidden bg-[#040508] border border-white/[0.05]">
            <SonicOrbCanvas
              status={status}
              track={displayTrack}
              syncMode={syncMode}
              webAudioEngine={webAudioEngine}
              positionMs={positionMs}
              trackChangeKey={trackChangeKey}
            />
          </div>

          <div className="w-full text-center mt-1 px-2">
            <h4 className="text-xl sm:text-[22px] font-semibold text-white tracking-tight truncate">
              {displayTrack.title}
            </h4>
            <p className="text-sm text-[#B5B7C4] mt-0.5 truncate">{displayTrack.artist}</p>
          </div>
        </div>

        {/* Row 3: Timestamps Above + Ultra-Thin #454653 / #E58B55 Progress Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-[#B5B7C4] tabular-nums">
            <span>{formatMs(positionMs)}</span>
            <span>{durationMs > 0 ? formatMs(durationMs) : '--:--'}</span>
          </div>

          <div className="relative h-[3px] rounded-full bg-[#454653]">
            <div
              className="h-[3px] rounded-full bg-[#E58B55] transition-[width] duration-150"
              style={{ width: `${progressPct}%` }}
            />
            <input
              type="range"
              min={0}
              max={progressMax}
              value={Math.min(progressMax, positionMs)}
              disabled={!canSeek}
              onChange={(e) => handleSeek(Number(e.target.value))}
              aria-label="Seek playback position"
              className="absolute -top-2.5 inset-x-0 w-full h-6 opacity-0 cursor-pointer disabled:cursor-default"
            />
          </div>
        </div>

        {/* Row 4: Centered Transport Controls with Solid White 52px Play/Pause */}
        <div className="flex items-center justify-center gap-4 sm:gap-5 py-0.5">
          <button
            type="button"
            onClick={() => setShuffleEnabled((v) => !v)}
            aria-pressed={shuffleEnabled}
            aria-label="Toggle shuffle"
            className={`min-h-[40px] min-w-[40px] rounded-full inline-flex items-center justify-center cursor-pointer transition-colors ${
              shuffleEnabled ? 'text-[#E58B55]' : 'text-[#B5B7C4] hover:text-white'
            }`}
          >
            <Shuffle className="w-[18px] h-[18px]" />
          </button>

          <button
            type="button"
            onClick={handlePrevTrack}
            aria-label="Previous track"
            className="min-h-[40px] min-w-[40px] rounded-full inline-flex items-center justify-center text-white hover:text-[#E58B55] cursor-pointer transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            aria-label={status === 'playing' ? 'Pause playback' : 'Play track'}
            className="w-[52px] h-[52px] shrink-0 rounded-full bg-white hover:bg-zinc-100 text-[#101116] inline-flex items-center justify-center cursor-pointer transition-transform active:scale-95"
          >
            {status === 'loading' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : status === 'playing' ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-[1px]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNextTrack(status === 'playing')}
            aria-label="Next track"
            className="min-h-[40px] min-w-[40px] rounded-full inline-flex items-center justify-center text-white hover:text-[#E58B55] cursor-pointer transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={cycleRepeatMode}
            aria-label={`Repeat mode: ${repeatMode}`}
            className={`min-h-[40px] min-w-[40px] rounded-full inline-flex items-center justify-center cursor-pointer transition-colors ${
              repeatMode !== 'off' ? 'text-[#E58B55]' : 'text-[#B5B7C4] hover:text-white'
            }`}
          >
            {repeatMode === 'track' ? (
              <Repeat1 className="w-[18px] h-[18px]" />
            ) : (
              <Repeat className="w-[18px] h-[18px]" />
            )}
          </button>
        </div>

        {/* Row 5: Minimal Footer Bar (Spotify playback left · Volume & Queue icons right) */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              setDockExpanded((v) => !v);
              setQueueOpen(false);
            }}
            aria-expanded={dockExpanded}
            className="text-xs text-[#B5B7C4] hover:text-white transition-colors cursor-pointer text-left truncate"
          >
            {footerStatusText}
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (syncMode === 'web-audio-fft' && audioSourceKind === 'local-file') {
                  setVolumeOpen((v) => !v);
                } else {
                  setDockExpanded((v) => !v);
                }
                setQueueOpen(false);
              }}
              aria-label="Volume and audio controls"
              className={`min-h-[36px] min-w-[36px] rounded-lg inline-flex items-center justify-center cursor-pointer transition-colors ${
                volumeOpen || dockExpanded ? 'text-white' : 'text-[#B5B7C4] hover:text-white'
              }`}
            >
              {muted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setQueueOpen((v) => !v);
                setVolumeOpen(false);
              }}
              aria-expanded={queueOpen}
              aria-label={`Toggle queue (${queue.length} items)`}
              className={`min-h-[36px] min-w-[36px] rounded-lg inline-flex items-center justify-center cursor-pointer transition-colors ${
                queueOpen ? 'text-[#E58B55]' : 'text-[#B5B7C4] hover:text-white'
              }`}
            >
              <ListMusic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Local Audio Volume Control Popover (when local file FFT mode is active) */}
        {volumeOpen && syncMode === 'web-audio-fft' && audioSourceKind === 'local-file' && (
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="text-xs text-[#B5B7C4] hover:text-white cursor-pointer"
            >
              {muted ? 'Unmute' : 'Mute'}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={muted ? 0 : volume}
              onChange={(e) => {
                setMuted(false);
                setVolume(Number(e.target.value));
              }}
              aria-label="Local audio volume"
              className="flex-1 h-1 rounded-full accent-[#E58B55] cursor-pointer"
            />
            <span className="font-data text-xs text-[#B5B7C4] tabular-nums w-9 text-right">
              {Math.round((muted ? 0 : volume) * 100)}%
            </span>
          </div>
        )}

        {/* Expandable Audio Input / Spotify Dock Drawer (iframe always stays live-mounted inside non-zero child) */}
        <div
          className={
            dockExpanded
              ? 'pt-4 border-t border-white/[0.08] space-y-3'
              : 'h-0 overflow-hidden opacity-0 pointer-events-none'
          }
          aria-hidden={!dockExpanded}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {(displayTrack.artworkUrl || artworkMap[displayTrack.id]) &&
                syncMode !== 'web-audio-fft' && (
                  <img
                    src={displayTrack.artworkUrl || artworkMap[displayTrack.id]}
                    alt={`${displayTrack.title} artwork`}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-md object-cover shrink-0 border border-white/10"
                  />
                )}
              <span className="text-xs text-[#B5B7C4] truncate">
                {syncMode === 'web-audio-fft'
                  ? audioSourceKind === 'tab-audio'
                    ? 'Live Tab Audio FFT active'
                    : 'Local File FFT active'
                  : 'Spotify Playback & Frequency Input'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDockExpanded(false)}
              aria-label="Close audio drawer"
              className="text-xs text-[#A8A9B5] hover:text-white cursor-pointer inline-flex items-center gap-1 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {syncMode === 'web-audio-fft' ? (
              <button
                type="button"
                onClick={exitWebAudioMode}
                className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 text-white cursor-pointer transition-colors"
              >
                Return to Spotify Sync
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => void handleCaptureTabAudio()}
                  className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-white cursor-pointer transition-colors"
                >
                  <Radio className="w-3.5 h-3.5 text-[#0EA5FF]" />
                  <span>Capture Tab Audio (Live FFT)</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-white cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-[#E58B55]" />
                  <span>Local Audio File (FFT)</span>
                </button>
              </>
            )}

            <a
              href={activeTrack.openLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium text-[#B5B7C4] hover:text-white bg-white/[0.04] cursor-pointer transition-colors ml-auto"
            >
              <span>Open in {activeTrack.platform}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {audioNotice && (
            <p className="text-xs text-[#E58B55] leading-relaxed">{audioNotice}</p>
          )}

          {/* Persistent Single Spotify Embed IFrame Controller */}
          <div className="rounded-xl overflow-hidden bg-[#0A0B0F] border border-white/[0.08]">
            {spotifyStatus === 'basic-embed' && fallbackParsed?.valid && fallbackParsed.embedUrl ? (
              <iframe
                key={fallbackParsed.embedUrl}
                title={`Spotify embed: ${activeTrack.title}`}
                src={`${fallbackParsed.embedUrl}&theme=0`}
                width="100%"
                height={152}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="block border-0"
              />
            ) : (
              <div style={{ height: dockExpanded ? 152 : 80, overflow: 'hidden' }}>
                <div ref={embedHostRef} className="w-full h-full" />
              </div>
            )}
          </div>
        </div>

        {/* Expandable Queue Drawer */}
        {queueOpen && (
          <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-[#B5B7C4]">
                Listening Queue ({activeIndex + 1} / {queue.length})
              </span>
              <button
                type="button"
                onClick={() => setQueueOpen(false)}
                className="text-xs text-[#A8A9B5] hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {queue.map((item, idx) => {
                const isCurrent = item.id === activeTrack.id && syncMode === 'playback-sync';
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      pendingAutoPlayRef.current = status === 'playing';
                      onSelectTrack(item.id);
                    }}
                    className={`w-full text-left rounded-xl px-3 py-2.5 border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-[#171923] border-[#E58B55]/65 text-white'
                        : 'bg-[#0C0D12] border-white/[0.06] hover:border-white/20 text-zinc-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        <span className="font-data text-xs text-[#A8A9B5] mr-2 tabular-nums">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        {item.title}
                      </p>
                      <p className="text-xs text-[#B5B7C4] truncate mt-0.5">
                        {item.artist} · {item.roomLabel}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="text-[11px] font-medium text-[#E58B55] shrink-0">
                        Playing
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
