import { parseSpotifyUrl } from './spotify';

export interface SpotifyPlaybackUpdateEvent {
  data: {
    isPaused: boolean;
    isBuffering: boolean;
    duration: number;
    position: number;
    playingURI?: string;
  };
}

export interface SpotifyEmbedController {
  loadUri: (spotifyUri: string) => void;
  play: () => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  destroy: () => void;
  addListener: (
    event: 'ready' | 'playback_update' | 'playback_started',
    callback: (event: SpotifyPlaybackUpdateEvent) => void
  ) => void;
  removeListener?: (event: string) => void;
}

export interface SpotifyIframeApi {
  createController: (
    element: HTMLElement,
    options: {
      uri: string;
      width?: string | number;
      height?: string | number;
      theme?: '0' | '1';
    },
    callback: (controller: SpotifyEmbedController) => void
  ) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
    __anibeatsSpotifyIframeApi?: SpotifyIframeApi;
  }
}

const SPOTIFY_IFRAME_API_SRC = 'https://open.spotify.com/embed/iframe-api/v1';

let pendingPromise: Promise<SpotifyIframeApi> | null = null;

/**
 * Converts a curated Spotify playlist/track/album web URL or URI into a Spotify URI (`spotify:type:id`).
 */
export function spotifyUrlToUri(url?: string): string | null {
  if (!url) return null;
  const parsed = parseSpotifyUrl(url);
  if (!parsed.valid || !parsed.type || !parsed.id) return null;
  return `spotify:${parsed.type}:${parsed.id}`;
}

/**
 * Loads Spotify's official Embed IFrame API script once, preserving any existing global hook,
 * and rejects cleanly on timeout or load error so callers can drop into fallback embed mode.
 */
export function loadSpotifyIframeApi(timeoutMs = 7000): Promise<SpotifyIframeApi> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not available'));
  }

  if (window.__anibeatsSpotifyIframeApi) {
    return Promise.resolve(window.__anibeatsSpotifyIframeApi);
  }

  if (pendingPromise) {
    return pendingPromise;
  }

  pendingPromise = new Promise<SpotifyIframeApi>((resolve, reject) => {
    let settled = false;

    const timer = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        pendingPromise = null;
        reject(new Error('Spotify IFrame API timed out'));
      }
    }, timeoutMs);

    const prevHandler = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (IFrameAPI: SpotifyIframeApi) => {
      window.__anibeatsSpotifyIframeApi = IFrameAPI;
      if (typeof prevHandler === 'function') {
        try {
          prevHandler(IFrameAPI);
        } catch {
          // ignore upstream handler errors
        }
      }
      if (!settled) {
        settled = true;
        window.clearTimeout(timer);
        resolve(IFrameAPI);
      }
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${SPOTIFY_IFRAME_API_SRC}"]`
    );

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = SPOTIFY_IFRAME_API_SRC;
      script.async = true;
      script.onerror = () => {
        if (!settled) {
          settled = true;
          window.clearTimeout(timer);
          pendingPromise = null;
          reject(new Error('Failed to load Spotify IFrame API script'));
        }
      };
      document.head.appendChild(script);
    }
  });

  return pendingPromise;
}

export interface SpotifyOembedMeta {
  title?: string;
  thumbnailUrl?: string;
}

const oembedCache = new Map<string, SpotifyOembedMeta>();

/**
 * Fetches official album/playlist artwork and canonical title from Spotify's public oEmbed endpoint.
 */
export async function fetchSpotifyOembedMetadata(
  spotifyUrl?: string
): Promise<SpotifyOembedMeta | null> {
  if (!spotifyUrl) return null;
  const parsed = parseSpotifyUrl(spotifyUrl);
  if (!parsed.valid || !parsed.canonicalUrl) return null;

  const cached = oembedCache.get(parsed.canonicalUrl);
  if (cached) return cached;

  try {
    const endpoint = `https://open.spotify.com/oembed?url=${encodeURIComponent(
      parsed.canonicalUrl
    )}`;
    const res = await fetch(endpoint);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      title?: string;
      thumbnail_url?: string;
    };
    const meta: SpotifyOembedMeta = {
      title: json.title,
      thumbnailUrl: json.thumbnail_url,
    };
    oembedCache.set(parsed.canonicalUrl, meta);
    return meta;
  } catch {
    return null;
  }
}
