export type OrbPlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export type OrbSyncMode = 'playback-sync' | 'web-audio-fft';

export type WebAudioSourceKind = 'local-file' | 'tab-audio';

export type SpotifyConnectionStatus =
  | 'initializing'
  | 'ready'
  | 'basic-embed'
  | 'external-only';

export interface SonicTrackItem {
  id: string;
  title: string;
  artist: string;
  collection: string;
  roomKey: string;
  roomLabel: string;
  platform: 'Spotify' | 'Apple Music';
  spotifyUrl?: string;
  openLinkUrl: string;
  note?: string;
  artworkUrl?: string;
  /** Curated tempo/feel hint used ONLY for honest procedural playback sync when DRM blocks Web Audio FFT */
  energyProfile: {
    bpm: number;
    warmth: number; // 0..1 shifts orange emphasis
    depth: number; // 0..1 shifts bass pulse scale
  };
}

export interface OrbMotionMetrics {
  bass: number;
  mid: number;
  high: number;
  energy: number;
  transient: number;
  bands: number[]; // 16 normalized logarithmic frequency bands (0..1)
  waveAmplitude: number;
  rotationSpeed: number;
  transitionPulse: number;
}
