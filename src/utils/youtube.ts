export type WeeklyMustTag = 'ANIME' | 'RAP' | 'CAR' | 'TRAVEL';
export type WeeklyMustMood = '' | 'Hype' | 'Chill' | 'Late Night' | 'Sad' | 'Workout';

export interface WeeklyMustItem {
  id: number;
  title: string;
  creator: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  whyThisWeek: string;
  tag: WeeklyMustTag;
  moodTag?: WeeklyMustMood;
  weekLabel: string;
  isCurrent: boolean;
  createdAt: string;
}

export interface ParsedYouTubeUrl {
  valid: boolean;
  videoId: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  canonicalUrl: string | null;
}

const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const ALLOWED_YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
]);

/**
 * Validates youtube.com/watch?v=... and youtu.be/... URLs strictly.
 * Extracts the 11-character YouTube video ID and constructs safe embed & thumbnail URLs.
 */
export function parseYouTubeUrl(rawUrl: string): ParsedYouTubeUrl {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    return { valid: false, videoId: null, embedUrl: null, thumbnailUrl: null, canonicalUrl: null };
  }

  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol !== 'https:' && protocol !== 'http:') {
      return { valid: false, videoId: null, embedUrl: null, thumbnailUrl: null, canonicalUrl: null };
    }

    const host = parsed.hostname.toLowerCase();
    if (!ALLOWED_YOUTUBE_HOSTS.has(host)) {
      return { valid: false, videoId: null, embedUrl: null, thumbnailUrl: null, canonicalUrl: null };
    }

    let videoId: string | null = null;
    if (host === 'youtu.be') {
      const seg = parsed.pathname.replace(/^\/+/, '').split('/')[0];
      videoId = seg || null;
    } else if (parsed.pathname === '/watch') {
      videoId = parsed.searchParams.get('v');
    } else if (parsed.pathname.startsWith('/embed/') || parsed.pathname.startsWith('/shorts/')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      videoId = parts[1] || null;
    }

    if (!videoId || !VIDEO_ID_REGEX.test(videoId)) {
      return { valid: false, videoId: null, embedUrl: null, thumbnailUrl: null, canonicalUrl: null };
    }

    return {
      valid: true,
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch {
    return { valid: false, videoId: null, embedUrl: null, thumbnailUrl: null, canonicalUrl: null };
  }
}

export function formatTagLabel(tag: string): string {
  switch (tag?.toUpperCase()) {
    case 'ANIME':
      return 'Anime';
    case 'RAP':
      return 'Rap';
    case 'CAR':
      return 'Car';
    case 'TRAVEL':
      return 'Travel';
    default:
      return tag || 'Anime';
  }
}
