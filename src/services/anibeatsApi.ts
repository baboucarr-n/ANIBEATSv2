import type {
  AnimeEntry,
  CarEntry,
  CurrentlyWatchingState,
  JournalEntry,
  PlaylistEntry,
  SongOfTheWeek,
  TravelDestination,
} from '../data/anibeatsData';
import type { CommunityPlaylistPick } from '../components/MusicPlaylistsSection';
import type { FanSuggestion } from '../components/CommunityJournalSection';

export interface BackendState {
  animeWall: AnimeEntry[];
  currentlyWatching: CurrentlyWatchingState;
  songOfTheWeek: SongOfTheWeek;
  playlists: PlaylistEntry[];
  cars: CarEntry[];
  travelTrips: TravelDestination[];
  visitedTravelIds: string[];
  storyPersonalNote: string;
  journalEntries: JournalEntry[];
  pollState: { votes: number[]; userChoice: number | null };
  communityPlaylists: CommunityPlaylistPick[];
  suggestions: FanSuggestion[];
}

// Defaults to same-origin /api/anibeats (served by Express live in AI Studio)
// Set VITE_API_BASE=http://localhost:8080/api/anibeats to target the Spring Boot server directly.
const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/+$/, '') || '/api/anibeats';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export const anibeatsApi = {
  health: () => requestJson<{ status: string; engine?: string }>('/health'),
  getState: () => requestJson<BackendState>('/state'),
  updateSong: (song: SongOfTheWeek) =>
    requestJson<BackendState>('/song', { method: 'PUT', body: JSON.stringify(song) }),
  updatePlaylists: (playlists: PlaylistEntry[]) =>
    requestJson<BackendState>('/playlists', { method: 'PUT', body: JSON.stringify(playlists) }),
  updateAnime: (animeWall: AnimeEntry[]) =>
    requestJson<BackendState>('/anime', { method: 'PUT', body: JSON.stringify(animeWall) }),
  updateWatching: (watching: CurrentlyWatchingState) =>
    requestJson<BackendState>('/watching', { method: 'PUT', body: JSON.stringify(watching) }),
  updateCars: (cars: CarEntry[]) =>
    requestJson<BackendState>('/cars', { method: 'PUT', body: JSON.stringify(cars) }),
  updateTravel: (travelTrips: TravelDestination[], visitedTravelIds: string[]) =>
    requestJson<BackendState>('/travel', {
      method: 'PUT',
      body: JSON.stringify({ travelTrips, visitedTravelIds }),
    }),
  votePoll: (optionIndex: number) =>
    requestJson<BackendState>('/poll/vote', {
      method: 'POST',
      body: JSON.stringify({ optionIndex }),
    }),
  addCommunityPlaylist: (pick: CommunityPlaylistPick) =>
    requestJson<BackendState>('/community-playlists', {
      method: 'POST',
      body: JSON.stringify(pick),
    }),
  addSuggestion: (suggestion: FanSuggestion) =>
    requestJson<BackendState>('/suggestions', {
      method: 'POST',
      body: JSON.stringify(suggestion),
    }),
  updateStoryJournal: (storyPersonalNote: string, journalEntries: JournalEntry[]) =>
    requestJson<BackendState>('/story-journal', {
      method: 'PUT',
      body: JSON.stringify({ storyPersonalNote, journalEntries }),
    }),
  resetDefaults: () => requestJson<BackendState>('/reset', { method: 'POST' }),
};
