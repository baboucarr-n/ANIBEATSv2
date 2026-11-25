export interface ParsedSpotifyUrl {
  valid: boolean;
  type: 'playlist' | 'track' | 'album' | 'artist' | 'episode' | null;
  id: string | null;
  canonicalUrl: string | null;
  embedUrl: string | null;
}

/**
 * Safely parses a Spotify web URL or URI into a validated Spotify embed URL.
 * Supports:
 * - https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd?si=...
 * - https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd
 * - https://open.spotify.com/track/0kdqcbwei4MDWFEX5f33yG
 * - spotify:playlist:37i9dQZF1DX0XUsuxWHRQd
 */
export function parseSpotifyUrl(input: string): ParsedSpotifyUrl {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, type: null, id: null, canonicalUrl: null, embedUrl: null };
  }

  // Support spotify:type:id URI format
  const uriMatch = trimmed.match(
    /^spotify:(playlist|track|album|artist|episode):([a-zA-Z0-9]+)$/
  );
  if (uriMatch) {
    const [, type, id] = uriMatch as [string, ParsedSpotifyUrl['type'], string];
    return {
      valid: true,
      type,
      id,
      canonicalUrl: `https://open.spotify.com/${type}/${id}`,
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`,
    };
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname !== 'open.spotify.com') {
      return { valid: false, type: null, id: null, canonicalUrl: null, embedUrl: null };
    }

    const segments = url.pathname.split('/').filter(Boolean);
    // Handle optional /intl-xx/ or /embed/ prefixes
    const cleanSegments = segments.filter(
      (seg) => seg !== 'embed' && !seg.startsWith('intl-')
    );

    if (cleanSegments.length < 2) {
      return { valid: false, type: null, id: null, canonicalUrl: null, embedUrl: null };
    }

    const [rawType, rawId] = cleanSegments;
    const allowedTypes = ['playlist', 'track', 'album', 'artist', 'episode'];
    if (!allowedTypes.includes(rawType) || !/^[a-zA-Z0-9]+$/.test(rawId)) {
      return { valid: false, type: null, id: null, canonicalUrl: null, embedUrl: null };
    }

    const type = rawType as Exclude<ParsedSpotifyUrl['type'], null>;
    return {
      valid: true,
      type,
      id: rawId,
      canonicalUrl: `https://open.spotify.com/${type}/${rawId}`,
      embedUrl: `https://open.spotify.com/embed/${type}/${rawId}?utm_source=generator`,
    };
  } catch {
    return { valid: false, type: null, id: null, canonicalUrl: null, embedUrl: null };
  }
}
