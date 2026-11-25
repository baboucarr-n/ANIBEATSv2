import type { OrbMotionMetrics, OrbPlaybackStatus, SonicTrackItem } from '../types/sonicOrb';

const BAND_COUNT = 16;

// Pre-computed logarithmic bin edges for fftSize=512 (256 frequency bins, ~86Hz/bin @ 44.1kHz)
const LOG_BIN_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0, 1],     // 0: sub-bass (~0-86Hz)
  [1, 2],     // 1: punch bass (~86-172Hz)
  [2, 3],     // 2: low bass (~172-258Hz)
  [3, 5],     // 3: upper bass (~258-430Hz)
  [5, 7],     // 4: low-mids (~430-600Hz)
  [7, 10],    // 5: body mids (~600-860Hz)
  [10, 14],   // 6: vocal core (~860-1.2kHz)
  [14, 19],   // 7: upper vocal (~1.2-1.6kHz)
  [19, 25],   // 8: presence low (~1.6-2.2kHz)
  [25, 33],   // 9: presence mid (~2.2-2.8kHz)
  [33, 44],   // 10: articulation (~2.8-3.8kHz)
  [44, 58],   // 11: crisp highs (~3.8-5.0kHz)
  [58, 76],   // 12: snare sizzle (~5.0-6.5kHz)
  [76, 100],  // 13: hi-hat edge (~6.5-8.6kHz)
  [100, 132], // 14: bright air (~8.6-11.4kHz)
  [132, 180], // 15: top sparkle (~11.4-15.5kHz)
];

function createEmptyBands(fill = 0.03): number[] {
  return Array.from({ length: BAND_COUNT }, () => fill);
}

/**
 * Pure procedural multi-band frequency synthesizer for playback states where Spotify DRM
 * prevents direct Web Audio API frequency inspection (Iframe / Embed playback).
 * Never pretends to measure protected audio FFTs; drives smooth 16-band harmonic envelopes
 * and percussive transients from real playback status, elapsed position, and track metadata.
 */
export function computeProceduralOrbMetrics(params: {
  status: OrbPlaybackStatus;
  elapsedSec: number;
  positionMs: number;
  transitionImpulse: number;
  track: SonicTrackItem;
  reducedMotion: boolean;
}): OrbMotionMetrics {
  const { status, elapsedSec, positionMs, transitionImpulse, track, reducedMotion } = params;
  const bpm = Math.max(62, Math.min(162, track.energyProfile.bpm || 92));
  const beatHz = bpm / 60;
  const depth = track.energyProfile.depth ?? 0.65;
  const warmth = track.energyProfile.warmth ?? 0.68;

  // Prefer actual Spotify playback position when advancing, keeping fallback continuous on pause
  const activeTime = positionMs > 0 ? positionMs / 1000 : elapsedSec;

  if (reducedMotion) {
    const base = status === 'playing' ? 0.12 : 0.04;
    return {
      bass: base,
      mid: base * 0.85,
      high: base * 0.7,
      energy: status === 'playing' ? 0.15 : 0.05,
      transient: 0,
      bands: createEmptyBands(base),
      waveAmplitude: base,
      rotationSpeed: 0.05,
      transitionPulse: 0,
    };
  }

  if (status === 'loading') {
    const bands = createEmptyBands(0.08);
    for (let i = 0; i < BAND_COUNT; i++) {
      const wave = 0.5 + 0.5 * Math.sin(elapsedSec * 3.8 - i * 0.45);
      bands[i] = 0.08 + wave * 0.24;
    }
    const breathe = 0.5 + 0.5 * Math.sin(elapsedSec * 2.8);
    return {
      bass: 0.18 + breathe * 0.14,
      mid: 0.22 + breathe * 0.12,
      high: 0.16 + (1 - breathe) * 0.18,
      energy: 0.25 + breathe * 0.12,
      transient: 0.08,
      bands,
      waveAmplitude: 0.22 + breathe * 0.1,
      rotationSpeed: 0.4,
      transitionPulse: transitionImpulse,
    };
  }

  if (status === 'playing') {
    const beatPhase = activeTime * beatHz;
    const quarterCycle = beatPhase % 1;
    const twoBarCycle = (beatPhase * 0.5) % 1;
    const eighthCycle = (beatPhase * 2) % 1;
    const sixteenthCycle = (beatPhase * 4) % 1;

    // Kick impact peaks sharply on beat onset and decays exponentially
    const kickEnv = Math.exp(-quarterCycle * 5.2);
    // Syncopated snare/clap on 2 & 4
    const snareGate = twoBarCycle > 0.48 ? Math.exp(-(twoBarCycle - 0.5) * 9.0) : 0;
    const hiHatPulse = Math.exp(-sixteenthCycle * 6.5) * (0.55 + 0.45 * Math.sin(activeTime * 4.2));
    const harmonicSwell = 0.5 + 0.5 * Math.sin(activeTime * 1.45 + warmth * 3.4);

    const bands: number[] = new Array(BAND_COUNT);
    for (let i = 0; i < BAND_COUNT; i++) {
      const norm = i / (BAND_COUNT - 1);
      const localOsc =
        0.5 +
        0.5 *
          Math.sin(
            activeTime * (2.6 + i * 0.72) +
              i * 1.17 +
              Math.cos(activeTime * 1.3 + i * 0.4)
          );

      let val = 0;
      if (i <= 3) {
        // Sub & punch bass bands
        const subWeight = 1 - i * 0.14;
        val = (0.18 + kickEnv * 0.74 * subWeight + Math.exp(-eighthCycle * 5.5) * 0.16) * (0.76 + depth * 0.32);
      } else if (i <= 9) {
        // Vocal & synth mid-range harmonics
        const midFocus = 1 - Math.abs(norm - 0.44) * 1.25;
        val = 0.16 + harmonicSwell * 0.34 * midFocus + snareGate * 0.42 + localOsc * 0.24;
      } else {
        // Treble shimmer & percussion overtones
        val = 0.12 + hiHatPulse * 0.44 + snareGate * 0.34 + localOsc * 0.26;
      }
      bands[i] = Math.min(1, Math.max(0.04, val));
    }

    const bass = Math.min(1, (bands[0] + bands[1] + bands[2] + bands[3]) / 4);
    const mid = Math.min(1, (bands[4] + bands[5] + bands[6] + bands[7] + bands[8]) / 5);
    const high = Math.min(1, (bands[10] + bands[11] + bands[12] + bands[13] + bands[14]) / 5);
    const transient = Math.min(1, kickEnv * 0.85 + snareGate * 0.65);
    const energy = Math.min(1, bass * 0.45 + mid * 0.35 + high * 0.2);

    return {
      bass,
      mid,
      high,
      energy,
      transient,
      bands,
      waveAmplitude: 0.42 + bass * 0.42 + transient * 0.24 + transitionImpulse * 0.3,
      rotationSpeed: 0.34 + energy * 0.28,
      transitionPulse: transitionImpulse,
    };
  }

  if (status === 'paused') {
    const softDrift = 0.5 + 0.5 * Math.sin(elapsedSec * 0.7);
    const bands = Array.from({ length: BAND_COUNT }, (_, i) =>
      0.03 + 0.03 * (0.5 + 0.5 * Math.sin(elapsedSec * 0.65 + i * 0.45))
    );
    return {
      bass: 0.05 + softDrift * 0.025,
      mid: 0.06 + softDrift * 0.03,
      high: 0.04 + softDrift * 0.02,
      energy: 0.07,
      transient: 0,
      bands,
      waveAmplitude: 0.07,
      rotationSpeed: 0.06,
      transitionPulse: transitionImpulse * 0.35,
    };
  }

  // Idle & calm ambient equilibrium
  const calmBreath = 0.5 + 0.5 * Math.sin(elapsedSec * 0.55);
  const bands = Array.from({ length: BAND_COUNT }, (_, i) =>
    0.05 + 0.06 * (0.5 + 0.5 * Math.sin(elapsedSec * 0.9 + i * 0.55))
  );
  return {
    bass: 0.09 + calmBreath * 0.05,
    mid: 0.11 + calmBreath * 0.05,
    high: 0.07 + calmBreath * 0.05,
    energy: 0.12 + calmBreath * 0.04,
    transient: 0,
    bands,
    waveAmplitude: 0.12 + calmBreath * 0.04,
    rotationSpeed: 0.13,
    transitionPulse: transitionImpulse,
  };
}

/**
 * Real Web Audio API 16-band FFT & spectral-flux transient analyzer for permitted
 * audio sources: user-loaded local audio files OR user-shared browser tab audio streams
 * via getDisplayMedia. Strictly separated from Spotify Embed procedural sync.
 */
export class WebAudioAnalyserEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private elementSource: MediaElementAudioSourceNode | null = null;
  private streamSource: MediaStreamAudioSourceNode | null = null;
  private activeStream: MediaStream | null = null;
  private freqData: Uint8Array<ArrayBuffer> | null = null;
  private attachedEl: HTMLAudioElement | null = null;
  private prevLowEnergy = 0;
  private smoothedTransient = 0;
  private readonly bandsBuffer: number[] = createEmptyBands(0.03);

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    if (!this.analyser) {
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.72;
      this.freqData = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
    }
    return this.ctx;
  }

  public attachAudioElement(audioEl: HTMLAudioElement): boolean {
    try {
      const ctx = this.ensureContext();
      if (!ctx || !this.analyser) return false;

      // Cleanly detach any active tab stream source before switching to local file element
      this.detachMediaStream();

      if (this.attachedEl !== audioEl) {
        this.elementSource?.disconnect();
        this.elementSource = ctx.createMediaElementSource(audioEl);
        this.elementSource.connect(this.analyser);
        this.analyser.connect(ctx.destination);
        this.attachedEl = audioEl;
      } else if (this.elementSource) {
        // Ensure speaker output is connected for local file playback
        try {
          this.analyser.connect(ctx.destination);
        } catch {
          // already connected
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  public attachMediaStream(stream: MediaStream): boolean {
    try {
      const ctx = this.ensureContext();
      if (!ctx || !this.analyser) return false;
      if (stream.getAudioTracks().length === 0) return false;

      this.detachMediaStream();

      // Disconnect analyser from destination when monitoring tab/system audio to prevent echo feedback
      try {
        this.analyser.disconnect(ctx.destination);
      } catch {
        // not connected to destination
      }

      this.activeStream = stream;
      this.streamSource = ctx.createMediaStreamSource(stream);
      this.streamSource.connect(this.analyser);
      return true;
    } catch {
      return false;
    }
  }

  public detachMediaStream() {
    try {
      this.streamSource?.disconnect();
    } catch {
      // ignore
    }
    this.streamSource = null;

    if (this.activeStream) {
      for (const track of this.activeStream.getTracks()) {
        try {
          track.stop();
        } catch {
          // ignore
        }
      }
      this.activeStream = null;
    }
  }

  public sampleMetrics(reducedMotion: boolean, transitionImpulse: number): OrbMotionMetrics | null {
    if (!this.analyser || !this.freqData) return null;
    this.analyser.getByteFrequencyData(this.freqData);

    const len = this.freqData.length;
    if (!len) return null;

    for (let b = 0; b < BAND_COUNT; b++) {
      const [start, end] = LOG_BIN_RANGES[b];
      const clampedStart = Math.min(len - 1, start);
      const clampedEnd = Math.min(len, Math.max(clampedStart + 1, end));
      let sum = 0;
      for (let i = clampedStart; i < clampedEnd; i++) {
        sum += this.freqData[i];
      }
      const raw = sum / ((clampedEnd - clampedStart) * 255);
      // Slight gentle treble boost so hi-hats/air shine equally alongside heavy sub-bass
      const boost = 1.15 + (b / (BAND_COUNT - 1)) * 0.42;
      this.bandsBuffer[b] = Math.min(1, Math.pow(raw * boost, 0.92));
    }

    const bass = Math.min(
      1,
      (this.bandsBuffer[0] + this.bandsBuffer[1] + this.bandsBuffer[2] + this.bandsBuffer[3]) / 4
    );
    const mid = Math.min(
      1,
      (this.bandsBuffer[4] +
        this.bandsBuffer[5] +
        this.bandsBuffer[6] +
        this.bandsBuffer[7] +
        this.bandsBuffer[8] +
        this.bandsBuffer[9]) /
        6
    );
    const high = Math.min(
      1,
      (this.bandsBuffer[10] +
        this.bandsBuffer[11] +
        this.bandsBuffer[12] +
        this.bandsBuffer[13] +
        this.bandsBuffer[14] +
        this.bandsBuffer[15]) /
        6
    );
    const energy = Math.min(1, bass * 0.46 + mid * 0.34 + high * 0.2);

    // Spectral flux transient detector for sharp kick / snare vibration kicks
    const lowMidEnergy = bass * 0.72 + mid * 0.28;
    const flux = Math.max(0, lowMidEnergy - this.prevLowEnergy);
    this.prevLowEnergy = this.prevLowEnergy * 0.82 + lowMidEnergy * 0.18;
    this.smoothedTransient = Math.max(this.smoothedTransient * 0.82, Math.min(1, flux * 3.8));

    if (reducedMotion) {
      return {
        bass: bass * 0.25,
        mid: mid * 0.2,
        high: high * 0.15,
        energy: energy * 0.25,
        transient: 0,
        bands: this.bandsBuffer.map((v) => v * 0.25),
        waveAmplitude: 0.1 + energy * 0.12,
        rotationSpeed: 0.05,
        transitionPulse: 0,
      };
    }

    return {
      bass,
      mid,
      high,
      energy,
      transient: this.smoothedTransient,
      bands: this.bandsBuffer,
      waveAmplitude: 0.28 + bass * 0.62 + this.smoothedTransient * 0.28 + transitionImpulse * 0.25,
      rotationSpeed: 0.22 + energy * 0.48,
      transitionPulse: transitionImpulse,
    };
  }

  public resumeIfNeeded() {
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  public dispose() {
    this.detachMediaStream();
    try {
      this.elementSource?.disconnect();
      this.analyser?.disconnect();
      if (this.ctx && this.ctx.state !== 'closed') {
        void this.ctx.close();
      }
    } catch {
      // ignore cleanup errors
    }
    this.ctx = null;
    this.analyser = null;
    this.elementSource = null;
    this.freqData = null;
    this.attachedEl = null;
  }
}
