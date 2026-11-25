import type {
  AnimeDemographic,
  AnimeGenreName,
  AnimeUniverseState,
  CompletedAnimeItem,
  CurrentlyWatchingItem,
  DiscoveryAnimeItem,
  DiscoveryCategory,
  StickerChatMessage,
} from '../data/animeUniverseData';

const API_BASE = (import.meta.env?.VITE_API_BASE || '').replace(/\/$/, '');

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let errMsg = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string; message?: string };
      if (data?.error) errMsg = data.error;
      else if (data?.message) errMsg = data.message;
    } catch {
      // keep fallback message
    }
    throw new Error(errMsg);
  }
  return res.json() as Promise<T>;
}

export interface CompletedAnimePayload {
  title: string;
  rank: number;
  posterUrl: string;
  genres: AnimeGenreName[];
  demographic: AnimeDemographic;
  frontNote: string;
  lifeLesson: string;
}

export interface WatchingAnimePayload {
  title: string;
  posterUrl: string;
  genres: AnimeGenreName[];
  demographic: AnimeDemographic;
  note: string;
  statusLabel: string;
  currentEp: number;
  totalEp: number;
}

export interface DiscoveryAnimePayload {
  title: string;
  posterUrl: string;
  category: DiscoveryCategory;
  genres: AnimeGenreName[];
  demographic: AnimeDemographic;
  synopsis: string;
  whyOnList: string;
  watchlistStatus: string;
}

export interface PromoteDiscoveryPayload {
  confirmedWatched: boolean;
  rank: number;
  frontNote: string;
  lifeLesson: string;
}

export interface SubmitSuggestionPayload {
  title: string;
  link: string;
  why: string;
  submittedBy: string;
  voterId?: string;
}

export interface ApproveSuggestionPayload {
  category?: DiscoveryCategory;
  demographic?: AnimeDemographic;
  genres?: AnimeGenreName[];
  posterUrl?: string;
  synopsis?: string;
}

export interface CommunityVotePayload {
  animeId: string;
  voterId: string;
  voterName?: string;
  upvoted: boolean;
  stars: number;
  dayKey?: string;
}

export const animeUniverseApi = {
  getAll(): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>('/api/anime-universe');
  },

  addCollectionItem(payload: CompletedAnimePayload): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>('/api/anime-universe/collection', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateCollectionItem(id: string, payload: CompletedAnimePayload): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>(`/api/anime-universe/collection/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteCollectionItem(id: string): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>(`/api/anime-universe/collection/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  reorderCollection(orderedIds: string[]): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>('/api/anime-universe/collection/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds }),
    });
  },

  addWatchingItem(payload: WatchingAnimePayload): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>('/api/anime-universe/watching', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateWatchingItem(id: string, payload: WatchingAnimePayload): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>(`/api/anime-universe/watching/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteWatchingItem(id: string): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>(`/api/anime-universe/watching/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  addDiscoveryItem(payload: DiscoveryAnimePayload): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>('/api/anime-universe/discovery', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateDiscoveryItem(id: string, payload: DiscoveryAnimePayload): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>(`/api/anime-universe/discovery/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteDiscoveryItem(id: string): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>(`/api/anime-universe/discovery/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  promoteDiscoveryToCollection(
    id: string,
    payload: PromoteDiscoveryPayload
  ): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>(
      `/api/anime-universe/discovery/${encodeURIComponent(id)}/promote`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  submitSuggestion(payload: SubmitSuggestionPayload): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>('/api/anime-universe/suggestions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  approveSuggestion(id: string, payload?: ApproveSuggestionPayload): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>(
      `/api/anime-universe/suggestions/${encodeURIComponent(id)}/approve`,
      {
        method: 'POST',
        body: JSON.stringify(payload ?? {}),
      }
    );
  },

  rejectSuggestion(id: string): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>(
      `/api/anime-universe/suggestions/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      }
    );
  },

  submitVote(payload: CommunityVotePayload): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>('/api/anime-universe/vote', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getStickerMessages(): Promise<StickerChatMessage[]> {
    return apiRequest<StickerChatMessage[]>('/api/anime-universe/sticker-chat');
  },

  sendStickerMessage(payload: {
    text?: string;
    stickerId?: string;
    senderName?: string;
    voterId?: string;
    dayKey?: string;
  }): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>('/api/anime-universe/sticker-chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  addAnimeComment(payload: {
    animeId: string;
    voterId: string;
    authorName?: string;
    text: string;
  }): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>('/api/anime-universe/comments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteAnimeComment(id: string): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>(
      `/api/anime-universe/comments/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      }
    );
  },

  updateRewardProfile(payload: {
    voterId: string;
    displayName?: string;
  }): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>('/api/anime-universe/rewards/profile', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  toggleStickerHeart(id: string, voterId: string): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>(
      `/api/anime-universe/sticker-chat/${encodeURIComponent(id)}/heart`,
      {
        method: 'POST',
        body: JSON.stringify({ voterId }),
      }
    );
  },

  deleteStickerMessage(id: string): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>(
      `/api/anime-universe/sticker-chat/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      }
    );
  },

  resetToPdfDefaults(): Promise<AnimeUniverseState> {
    return apiRequest<AnimeUniverseState>('/api/anime-universe/reset', {
      method: 'POST',
    });
  },
};

export type { CompletedAnimeItem, CurrentlyWatchingItem, DiscoveryAnimeItem };
