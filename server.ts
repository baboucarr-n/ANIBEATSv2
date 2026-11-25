import fs from 'node:fs/promises';
import path from 'node:path';
import express, { type Request, type Response } from 'express';
import { createServer as createViteServer } from 'vite';
import {
  DEFAULT_ANIME_WALL,
  DEFAULT_CURRENTLY_WATCHING,
  DEFAULT_GARAGE,
  DEFAULT_JOURNAL_ENTRIES,
  DEFAULT_PLAYLISTS,
  DEFAULT_SONG_OF_THE_WEEK,
  DEFAULT_TRAVEL_TRIPS,
  type AnimeEntry,
  type CarEntry,
  type CurrentlyWatchingState,
  type JournalEntry,
  type PlaylistEntry,
  type SongOfTheWeek,
  type TravelDestination,
} from './src/data/anibeatsData.ts';
import {
  parseYouTubeUrl,
  type WeeklyMustItem,
  type WeeklyMustMood,
  type WeeklyMustTag,
} from './src/utils/youtube.ts';
import {
  ALL_ANIME_DEMOGRAPHICS,
  ALL_ANIME_GENRES,
  DEFAULT_ANIME_UNIVERSE_STATE,
  DISCOVERY_CATEGORIES,
  type AnimeCommentItem,
  type AnimeDemographic,
  type AnimeGenreName,
  type AnimeUniverseState,
  type CompletedAnimeItem,
  type CommunityRankSnapshots,
  type CommunityVoteRecord,
  type CurrentlyWatchingItem,
  type DiscoveryAnimeItem,
  type DiscoveryCategory,
  type PendingAnimeSuggestion,
  type RankingPeriod,
  type RewardUserProfile,
  type StickerChatMessage,
} from './src/data/animeUniverseData.ts';
import { VALID_STICKER_ID_SET } from './src/data/stickerPack.ts';
import {
  calculateStreakEndingAt,
  createEmptyRewardProfile,
  DAILY_QUEST_CHAT_TARGET,
  DAILY_QUEST_STICKER_TARGET,
  DAILY_QUEST_VOTE_TARGET,
  getEffectiveBadges,
  getMaxCommunityVoteCount,
  normalizeDayKey,
  REWARD_XP_VALUES,
} from './src/utils/rewardSystem.ts';
import {
  createEmptyRankSnapshots,
  extractPeriodRankMap,
  RANKING_PERIODS,
} from './src/utils/communityRankings.ts';

export interface PollStatePayload {
  votes: number[];
  userChoice: number | null;
}

export interface CommunityPlaylistPayload {
  id: string;
  name: string;
  link: string;
  why: string;
}

export interface FanSuggestionPayload {
  id: string;
  category: string;
  title: string;
  link?: string;
  why: string;
}

export interface AnibeatsStatePayload {
  animeWall: AnimeEntry[];
  currentlyWatching: CurrentlyWatchingState;
  songOfTheWeek: SongOfTheWeek;
  playlists: PlaylistEntry[];
  cars: CarEntry[];
  travelTrips: TravelDestination[];
  visitedTravelIds: string[];
  storyPersonalNote: string;
  journalEntries: JournalEntry[];
  pollState: PollStatePayload;
  communityPlaylists: CommunityPlaylistPayload[];
  suggestions: FanSuggestionPayload[];
  weeklyMusts: WeeklyMustItem[];
  animeUniverse: AnimeUniverseState;
}

const DEFAULT_STORY_NOTE =
  'This isn’t a portfolio, a CV, or a page trying to sound corporate. It’s simply my personal corner on the internet — a vision board of what moves me and where I want to go in life.';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'anibeats-db.json');

function createSeededWeeklyMust(): WeeklyMustItem[] {
  return [
    {
      id: 1,
      title: 'To be filled — Weekly MUST coming soon',
      creator: 'To be filled by me',
      youtubeUrl: '',
      youtubeVideoId: '',
      whyThisWeek:
        'To be filled by me — my own words on why this is the one video you have to watch this week.',
      tag: 'ANIME',
      moodTag: '',
      weekLabel: 'Week 48 — 2026',
      isCurrent: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

function createDefaultState(): AnibeatsStatePayload {
  return {
    animeWall: structuredClone(DEFAULT_ANIME_WALL),
    currentlyWatching: structuredClone(DEFAULT_CURRENTLY_WATCHING),
    songOfTheWeek: structuredClone(DEFAULT_SONG_OF_THE_WEEK),
    playlists: structuredClone(DEFAULT_PLAYLISTS),
    cars: structuredClone(DEFAULT_GARAGE),
    travelTrips: structuredClone(DEFAULT_TRAVEL_TRIPS),
    visitedTravelIds: [],
    storyPersonalNote: DEFAULT_STORY_NOTE,
    journalEntries: structuredClone(DEFAULT_JOURNAL_ENTRIES),
    pollState: { votes: [0, 0, 0], userChoice: null },
    communityPlaylists: [],
    suggestions: [],
    weeklyMusts: createSeededWeeklyMust(),
    animeUniverse: structuredClone(DEFAULT_ANIME_UNIVERSE_STATE),
  };
}

let stateCache: AnibeatsStatePayload | null = null;
let writeQueue: Promise<void> = Promise.resolve();

async function ensureStateLoaded(): Promise<AnibeatsStatePayload> {
  if (stateCache) return stateCache;
  try {
    const raw = await fs.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<AnibeatsStatePayload>;
    const defaults = createDefaultState();
    stateCache = {
      ...defaults,
      ...parsed,
      animeWall: Array.isArray(parsed.animeWall) && parsed.animeWall.length > 0 ? parsed.animeWall : defaults.animeWall,
      playlists: Array.isArray(parsed.playlists) && parsed.playlists.length > 0 ? parsed.playlists : defaults.playlists,
      cars: Array.isArray(parsed.cars) && parsed.cars.length > 0 ? parsed.cars : defaults.cars,
      travelTrips: Array.isArray(parsed.travelTrips) && parsed.travelTrips.length > 0 ? parsed.travelTrips : defaults.travelTrips,
      journalEntries: Array.isArray(parsed.journalEntries) && parsed.journalEntries.length > 0 ? parsed.journalEntries : defaults.journalEntries,
      visitedTravelIds: Array.isArray(parsed.visitedTravelIds) ? parsed.visitedTravelIds : [],
      communityPlaylists: Array.isArray(parsed.communityPlaylists) ? parsed.communityPlaylists : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      pollState: parsed.pollState && Array.isArray(parsed.pollState.votes) ? parsed.pollState : defaults.pollState,
      weeklyMusts: Array.isArray(parsed.weeklyMusts) && parsed.weeklyMusts.length > 0 ? parsed.weeklyMusts : defaults.weeklyMusts,
      animeUniverse:
        parsed.animeUniverse &&
        Array.isArray(parsed.animeUniverse.collection) &&
        parsed.animeUniverse.collection.length > 0
          ? {
              collection: parsed.animeUniverse.collection,
              watching: Array.isArray(parsed.animeUniverse.watching)
                ? parsed.animeUniverse.watching
                : defaults.animeUniverse.watching,
              discovery: Array.isArray(parsed.animeUniverse.discovery)
                ? parsed.animeUniverse.discovery
                : defaults.animeUniverse.discovery,
              pendingSuggestions: Array.isArray(parsed.animeUniverse.pendingSuggestions)
                ? parsed.animeUniverse.pendingSuggestions
                : [],
              communityVotes: Array.isArray(parsed.animeUniverse.communityVotes)
                ? parsed.animeUniverse.communityVotes
                : [],
              communityRankSnapshots: parsed.animeUniverse.communityRankSnapshots ?? createEmptyRankSnapshots(),
              stickerChatMessages: Array.isArray(parsed.animeUniverse.stickerChatMessages)
                ? parsed.animeUniverse.stickerChatMessages
                : [],
              animeComments: Array.isArray(parsed.animeUniverse.animeComments)
                ? parsed.animeUniverse.animeComments
                : [],
              rewardProfiles:
                parsed.animeUniverse.rewardProfiles &&
                typeof parsed.animeUniverse.rewardProfiles === 'object'
                  ? parsed.animeUniverse.rewardProfiles
                  : {},
            }
          : defaults.animeUniverse,
    };
  } catch {
    stateCache = createDefaultState();
    await persistState(stateCache);
  }
  return stateCache;
}

async function persistState(next: AnibeatsStatePayload): Promise<void> {
  stateCache = next;
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(next, null, 2), 'utf-8');
  });
  await writeQueue;
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '2mb' }));

  // Health endpoint matching Spring Boot AnibeatsController
  app.get('/api/anibeats/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', engine: 'express-mirror', springBootDir: 'backend-springboot' });
  });

  app.get('/api/anibeats/state', async (_req: Request, res: Response) => {
    const state = await ensureStateLoaded();
    res.json(state);
  });

  app.put('/api/anibeats/state', async (req: Request, res: Response) => {
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({ error: 'Invalid state payload' });
      return;
    }
    const current = await ensureStateLoaded();
    const next: AnibeatsStatePayload = { ...current, ...req.body };
    await persistState(next);
    res.json(next);
  });

  app.put('/api/anibeats/song', async (req: Request, res: Response) => {
    const body = req.body as Partial<SongOfTheWeek>;
    if (!body || typeof body.title !== 'string') {
      res.status(400).json({ error: 'Invalid song payload' });
      return;
    }
    const current = await ensureStateLoaded();
    const next: AnibeatsStatePayload = {
      ...current,
      songOfTheWeek: {
        title: body.title,
        artist: String(body.artist ?? ''),
        spotifyUrl: String(body.spotifyUrl ?? ''),
        why: String(body.why ?? ''),
      },
    };
    await persistState(next);
    res.json(next);
  });

  app.put('/api/anibeats/playlists', async (req: Request, res: Response) => {
    if (!Array.isArray(req.body)) {
      res.status(400).json({ error: 'Expected playlist array' });
      return;
    }
    const current = await ensureStateLoaded();
    const next: AnibeatsStatePayload = { ...current, playlists: req.body as PlaylistEntry[] };
    await persistState(next);
    res.json(next);
  });

  app.put('/api/anibeats/anime', async (req: Request, res: Response) => {
    if (!Array.isArray(req.body)) {
      res.status(400).json({ error: 'Expected anime array' });
      return;
    }
    const current = await ensureStateLoaded();
    const next: AnibeatsStatePayload = { ...current, animeWall: req.body as AnimeEntry[] };
    await persistState(next);
    res.json(next);
  });

  app.put('/api/anibeats/watching', async (req: Request, res: Response) => {
    const body = req.body as Partial<CurrentlyWatchingState>;
    if (!body || typeof body.title !== 'string') {
      res.status(400).json({ error: 'Invalid watching payload' });
      return;
    }
    const current = await ensureStateLoaded();
    const next: AnibeatsStatePayload = {
      ...current,
      currentlyWatching: {
        title: body.title,
        currentEp: Number(body.currentEp ?? 0),
        totalEp: Math.max(1, Number(body.totalEp ?? 1)),
        note: String(body.note ?? ''),
      },
    };
    await persistState(next);
    res.json(next);
  });

  app.put('/api/anibeats/cars', async (req: Request, res: Response) => {
    if (!Array.isArray(req.body)) {
      res.status(400).json({ error: 'Expected cars array' });
      return;
    }
    const current = await ensureStateLoaded();
    const next: AnibeatsStatePayload = { ...current, cars: req.body as CarEntry[] };
    await persistState(next);
    res.json(next);
  });

  app.put('/api/anibeats/travel', async (req: Request, res: Response) => {
    const body = req.body as {
      travelTrips?: TravelDestination[];
      visitedTravelIds?: string[];
    };
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Invalid travel payload' });
      return;
    }
    const current = await ensureStateLoaded();
    const next: AnibeatsStatePayload = {
      ...current,
      travelTrips: Array.isArray(body.travelTrips) ? body.travelTrips : current.travelTrips,
      visitedTravelIds: Array.isArray(body.visitedTravelIds)
        ? body.visitedTravelIds
        : current.visitedTravelIds,
    };
    await persistState(next);
    res.json(next);
  });

  app.post('/api/anibeats/poll/vote', async (req: Request, res: Response) => {
    const optionIndex = Number(req.body?.optionIndex ?? -1);
    if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex > 2) {
      res.status(400).json({ error: 'Invalid poll optionIndex' });
      return;
    }
    const current = await ensureStateLoaded();
    const votes = [...(current.pollState?.votes ?? [0, 0, 0])];
    while (votes.length < 3) votes.push(0);
    const prevChoice = current.pollState?.userChoice ?? null;
    if (prevChoice !== null && prevChoice >= 0 && prevChoice < votes.length) {
      votes[prevChoice] = Math.max(0, votes[prevChoice] - 1);
    }
    votes[optionIndex] = (votes[optionIndex] ?? 0) + 1;
    const next: AnibeatsStatePayload = {
      ...current,
      pollState: { votes, userChoice: optionIndex },
    };
    await persistState(next);
    res.json(next);
  });

  app.post('/api/anibeats/community-playlists', async (req: Request, res: Response) => {
    const pick = req.body as Partial<CommunityPlaylistPayload>;
    if (!pick?.name?.trim() || !pick?.link?.trim()) {
      res.status(400).json({ error: 'Name and Spotify link are required' });
      return;
    }
    const current = await ensureStateLoaded();
    const item: CommunityPlaylistPayload = {
      id: pick.id || `pl-pick-${Date.now()}`,
      name: pick.name.trim(),
      link: pick.link.trim(),
      why: String(pick.why ?? '').trim(),
    };
    const next: AnibeatsStatePayload = {
      ...current,
      communityPlaylists: [item, ...current.communityPlaylists],
    };
    await persistState(next);
    res.json(next);
  });

  app.post('/api/anibeats/suggestions', async (req: Request, res: Response) => {
    const sug = req.body as Partial<FanSuggestionPayload>;
    if (!sug?.category?.trim() || !sug?.title?.trim()) {
      res.status(400).json({ error: 'Category and title are required' });
      return;
    }
    const current = await ensureStateLoaded();
    const item: FanSuggestionPayload = {
      id: sug.id || `sug-${Date.now()}`,
      category: sug.category.trim(),
      title: sug.title.trim(),
      link: sug.link?.trim() || undefined,
      why: String(sug.why ?? '').trim(),
    };
    const next: AnibeatsStatePayload = {
      ...current,
      suggestions: [item, ...current.suggestions],
    };
    await persistState(next);
    res.json(next);
  });

  app.put('/api/anibeats/story-journal', async (req: Request, res: Response) => {
    const body = req.body as {
      storyPersonalNote?: string;
      journalEntries?: JournalEntry[];
    };
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Invalid story-journal payload' });
      return;
    }
    const current = await ensureStateLoaded();
    const next: AnibeatsStatePayload = {
      ...current,
      storyPersonalNote:
        typeof body.storyPersonalNote === 'string'
          ? body.storyPersonalNote
          : current.storyPersonalNote,
      journalEntries: Array.isArray(body.journalEntries)
        ? body.journalEntries
        : current.journalEntries,
    };
    await persistState(next);
    res.json(next);
  });

  app.post('/api/anibeats/reset', async (_req: Request, res: Response) => {
    const fresh = createDefaultState();
    await persistState(fresh);
    res.json(fresh);
  });

  // ── WEEKLY MUST — YOUTUBE REST ENDPOINTS (matches Spring Boot WeeklyMustController) ──
  const VALID_WEEKLY_TAGS = new Set<WeeklyMustTag>(['ANIME', 'RAP', 'CAR', 'TRAVEL']);
  const VALID_WEEKLY_MOOD_MAP: Record<string, WeeklyMustMood> = {
    '': '',
    hype: 'Hype',
    chill: 'Chill',
    'late night': 'Late Night',
    late_night: 'Late Night',
    sad: 'Sad',
    workout: 'Workout',
  };

  const normalizeTag = (raw: unknown): WeeklyMustTag | null => {
    const upper = String(raw ?? '').trim().toUpperCase() as WeeklyMustTag;
    return VALID_WEEKLY_TAGS.has(upper) ? upper : null;
  };

  const normalizeMood = (raw: unknown): WeeklyMustMood => {
    const key = String(raw ?? '').trim().toLowerCase();
    return VALID_WEEKLY_MOOD_MAP[key] ?? '';
  };

  app.get('/api/weekly-must/current', async (_req: Request, res: Response) => {
    const state = await ensureStateLoaded();
    const current = state.weeklyMusts.find((m) => m.isCurrent) ?? null;
    res.json(current);
  });

  app.get('/api/weekly-must/archive', async (_req: Request, res: Response) => {
    const state = await ensureStateLoaded();
    const archive = state.weeklyMusts
      .filter((m) => !m.isCurrent)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(archive);
  });

  app.get('/api/weekly-must/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid Weekly MUST id' });
      return;
    }
    const state = await ensureStateLoaded();
    const found = state.weeklyMusts.find((m) => m.id === id);
    if (!found) {
      res.status(404).json({ error: 'Weekly MUST not found' });
      return;
    }
    res.json(found);
  });

  app.post('/api/admin/weekly-must', async (req: Request, res: Response) => {
    const body = req.body as Partial<WeeklyMustItem> & { isCurrent?: boolean };
    const title = String(body?.title ?? '').trim();
    const creator = String(body?.creator ?? '').trim();
    const youtubeUrl = String(body?.youtubeUrl ?? '').trim();
    const weekLabel = String(body?.weekLabel ?? '').trim();
    const whyThisWeek = String(body?.whyThisWeek ?? '').trim();
    const tag = normalizeTag(body?.tag);
    const moodTag = normalizeMood(body?.moodTag);
    const isCurrent = Boolean(body?.isCurrent);

    if (!title || !creator || !weekLabel) {
      res.status(400).json({ error: 'Title, creator, and week label are required' });
      return;
    }
    if (!tag) {
      res.status(400).json({ error: 'Tag must be ANIME, RAP, CAR, or TRAVEL' });
      return;
    }

    const parsedYt = parseYouTubeUrl(youtubeUrl);
    if (!parsedYt.valid || !parsedYt.videoId) {
      res.status(400).json({ error: 'Please provide a valid youtube.com/watch?v= or youtu.be/ link' });
      return;
    }

    const state = await ensureStateLoaded();
    const nextId = state.weeklyMusts.reduce((max, item) => Math.max(max, item.id), 0) + 1;

    const existingCleared = isCurrent
      ? state.weeklyMusts.map((m) => ({ ...m, isCurrent: false }))
      : [...state.weeklyMusts];

    const created: WeeklyMustItem = {
      id: nextId,
      title,
      creator,
      youtubeUrl,
      youtubeVideoId: parsedYt.videoId,
      whyThisWeek,
      tag,
      moodTag,
      weekLabel,
      isCurrent,
      createdAt: new Date().toISOString(),
    };

    await persistState({ ...state, weeklyMusts: [created, ...existingCleared] });
    res.status(201).json(created);
  });

  app.put('/api/admin/weekly-must/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid Weekly MUST id' });
      return;
    }
    const state = await ensureStateLoaded();
    const existing = state.weeklyMusts.find((m) => m.id === id);
    if (!existing) {
      res.status(404).json({ error: 'Weekly MUST not found' });
      return;
    }

    const body = req.body as Partial<WeeklyMustItem>;
    const title = String(body?.title ?? '').trim();
    const creator = String(body?.creator ?? '').trim();
    const youtubeUrl = String(body?.youtubeUrl ?? '').trim();
    const weekLabel = String(body?.weekLabel ?? '').trim();
    const whyThisWeek = String(body?.whyThisWeek ?? '').trim();
    const tag = normalizeTag(body?.tag);
    const moodTag = normalizeMood(body?.moodTag);
    const isCurrent = Boolean(body?.isCurrent);

    if (!title || !creator || !weekLabel) {
      res.status(400).json({ error: 'Title, creator, and week label are required' });
      return;
    }
    if (!tag) {
      res.status(400).json({ error: 'Tag must be ANIME, RAP, CAR, or TRAVEL' });
      return;
    }

    let videoId = '';
    if (youtubeUrl) {
      const parsedYt = parseYouTubeUrl(youtubeUrl);
      if (!parsedYt.valid || !parsedYt.videoId) {
        res.status(400).json({ error: 'Please provide a valid youtube.com/watch?v= or youtu.be/ link' });
        return;
      }
      videoId = parsedYt.videoId;
    }

    const updated: WeeklyMustItem = {
      ...existing,
      title,
      creator,
      youtubeUrl,
      youtubeVideoId: videoId,
      whyThisWeek,
      tag,
      moodTag,
      weekLabel,
      isCurrent,
    };

    const nextList = state.weeklyMusts.map((m) => {
      if (m.id === id) return updated;
      return isCurrent ? { ...m, isCurrent: false } : m;
    });

    await persistState({ ...state, weeklyMusts: nextList });
    res.json(updated);
  });

  app.delete('/api/admin/weekly-must/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid Weekly MUST id' });
      return;
    }
    const state = await ensureStateLoaded();
    const exists = state.weeklyMusts.some((m) => m.id === id);
    if (!exists) {
      res.status(404).json({ error: 'Weekly MUST not found' });
      return;
    }
    const nextList = state.weeklyMusts.filter((m) => m.id !== id);
    await persistState({ ...state, weeklyMusts: nextList });
    res.status(204).send();
  });

  app.post('/api/admin/weekly-must/:id/set-current', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid Weekly MUST id' });
      return;
    }
    const state = await ensureStateLoaded();
    const target = state.weeklyMusts.find((m) => m.id === id);
    if (!target) {
      res.status(404).json({ error: 'Weekly MUST not found' });
      return;
    }

    const nextList = state.weeklyMusts.map((m) => ({
      ...m,
      isCurrent: m.id === id,
    }));
    const updatedTarget = nextList.find((m) => m.id === id)!;
    await persistState({ ...state, weeklyMusts: nextList });
    res.json(updatedTarget);
  });

  // ── ANIME UNIVERSE ENDPOINTS (matches Spring Boot AnimeUniverseController) ──
  const VALID_GENRE_SET = new Set<string>(ALL_ANIME_GENRES);
  const VALID_DEMO_SET = new Set<string>(ALL_ANIME_DEMOGRAPHICS);
  const VALID_CAT_SET = new Set<string>(DISCOVERY_CATEGORIES);

  const sanitizePoster = (raw: unknown): string | null => {
    const str = String(raw ?? '').trim();
    if (!str) return '/assets/anime/aot.jpg';
    if (str.startsWith('/assets/') || str.startsWith('https://') || str.startsWith('http://')) {
      return str;
    }
    return null;
  };

  const sanitizeAnimeGenres = (raw: unknown): AnimeGenreName[] => {
    if (!Array.isArray(raw)) return ['Action'];
    const filtered = raw
      .map((g) => String(g).trim())
      .filter((g): g is AnimeGenreName => VALID_GENRE_SET.has(g));
    return filtered.length > 0 ? Array.from(new Set(filtered)) : ['Action'];
  };

  const sanitizeDemo = (raw: unknown): AnimeDemographic => {
    const val = String(raw ?? '').trim();
    return VALID_DEMO_SET.has(val) ? (val as AnimeDemographic) : 'Shonen';
  };

  const sanitizeCat = (raw: unknown): DiscoveryCategory => {
    const val = String(raw ?? '').trim();
    return VALID_CAT_SET.has(val) ? (val as DiscoveryCategory) : 'Dark Fantasy';
  };

  const reindexCollection = (items: CompletedAnimeItem[]): CompletedAnimeItem[] =>
    items.map((item, idx) => ({ ...item, rank: idx + 1 }));

  const clampRank = (rank: unknown, max: number): number => {
    const num = Number(rank);
    if (!Number.isFinite(num) || num < 1) return 1;
    return Math.min(Math.floor(num), Math.max(1, max));
  };

  app.get('/api/anime-universe', async (_req: Request, res: Response) => {
    const state = await ensureStateLoaded();
    res.json(state.animeUniverse);
  });

  app.post('/api/anime-universe/collection', async (req: Request, res: Response) => {
    const title = String(req.body?.title ?? '').trim();
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    const posterUrl = sanitizePoster(req.body?.posterUrl);
    if (!posterUrl) {
      res.status(400).json({ error: 'Poster URL must start with /assets/, http://, or https://' });
      return;
    }
    const state = await ensureStateLoaded();
    const list = [...state.animeUniverse.collection];
    const targetRank = clampRank(req.body?.rank ?? list.length + 1, list.length + 1);
    const created: CompletedAnimeItem = {
      id: `col-${Date.now()}`,
      rank: targetRank,
      title,
      posterUrl,
      genres: sanitizeAnimeGenres(req.body?.genres),
      demographic: sanitizeDemo(req.body?.demographic),
      frontNote: String(req.body?.frontNote ?? '').trim(),
      lifeLesson: String(req.body?.lifeLesson ?? '').trim(),
    };
    list.splice(targetRank - 1, 0, created);
    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      collection: reindexCollection(list),
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  app.put('/api/anime-universe/collection/:id', async (req: Request, res: Response) => {
    const title = String(req.body?.title ?? '').trim();
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    const posterUrl = sanitizePoster(req.body?.posterUrl);
    if (!posterUrl) {
      res.status(400).json({ error: 'Poster URL must start with /assets/, http://, or https://' });
      return;
    }
    const state = await ensureStateLoaded();
    const list = [...state.animeUniverse.collection];
    const idx = list.findIndex((i) => i.id === req.params.id);
    if (idx < 0) {
      res.status(404).json({ error: 'Anime collection entry not found' });
      return;
    }
    const [existing] = list.splice(idx, 1);
    const targetRank = clampRank(req.body?.rank ?? existing.rank, list.length + 1);
    const updated: CompletedAnimeItem = {
      ...existing,
      rank: targetRank,
      title,
      posterUrl,
      genres: sanitizeAnimeGenres(req.body?.genres),
      demographic: sanitizeDemo(req.body?.demographic),
      frontNote: String(req.body?.frontNote ?? '').trim(),
      lifeLesson: String(req.body?.lifeLesson ?? '').trim(),
    };
    list.splice(targetRank - 1, 0, updated);
    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      collection: reindexCollection(list),
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  app.delete('/api/anime-universe/collection/:id', async (req: Request, res: Response) => {
    const state = await ensureStateLoaded();
    const filtered = state.animeUniverse.collection.filter((i) => i.id !== req.params.id);
    if (filtered.length === state.animeUniverse.collection.length) {
      res.status(404).json({ error: 'Anime collection entry not found' });
      return;
    }
    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      collection: reindexCollection(filtered),
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  app.post('/api/anime-universe/collection/reorder', async (req: Request, res: Response) => {
    const orderedIds = req.body?.orderedIds;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      res.status(400).json({ error: 'orderedIds array is required' });
      return;
    }
    const state = await ensureStateLoaded();
    const byId = new Map(state.animeUniverse.collection.map((i) => [i.id, i]));
    const reordered: CompletedAnimeItem[] = [];
    for (const id of orderedIds) {
      const found = byId.get(String(id));
      if (found) {
        reordered.push(found);
        byId.delete(String(id));
      }
    }
    for (const leftover of byId.values()) reordered.push(leftover);
    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      collection: reindexCollection(reordered),
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  app.post('/api/anime-universe/watching', async (req: Request, res: Response) => {
    const title = String(req.body?.title ?? '').trim();
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    const posterUrl = sanitizePoster(req.body?.posterUrl);
    if (!posterUrl) {
      res.status(400).json({ error: 'Poster URL must start with /assets/, http://, or https://' });
      return;
    }
    const state = await ensureStateLoaded();
    const created: CurrentlyWatchingItem = {
      id: `watch-${Date.now()}`,
      title,
      posterUrl,
      genres: sanitizeAnimeGenres(req.body?.genres),
      demographic: sanitizeDemo(req.body?.demographic),
      note: String(req.body?.note ?? '').trim(),
      statusLabel:
        String(req.body?.statusLabel ?? '').trim() || 'Currently Watching. No final rating.',
      currentEp: Math.max(0, Math.floor(Number(req.body?.currentEp ?? 1))),
      totalEp: Math.max(1, Math.floor(Number(req.body?.totalEp ?? 24))),
    };
    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      watching: [...state.animeUniverse.watching, created],
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  app.put('/api/anime-universe/watching/:id', async (req: Request, res: Response) => {
    const title = String(req.body?.title ?? '').trim();
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    const posterUrl = sanitizePoster(req.body?.posterUrl);
    if (!posterUrl) {
      res.status(400).json({ error: 'Poster URL must start with /assets/, http://, or https://' });
      return;
    }
    const state = await ensureStateLoaded();
    const idx = state.animeUniverse.watching.findIndex((w) => w.id === req.params.id);
    if (idx < 0) {
      res.status(404).json({ error: 'Watching entry not found' });
      return;
    }
    const updated: CurrentlyWatchingItem = {
      ...state.animeUniverse.watching[idx],
      title,
      posterUrl,
      genres: sanitizeAnimeGenres(req.body?.genres),
      demographic: sanitizeDemo(req.body?.demographic),
      note: String(req.body?.note ?? '').trim(),
      statusLabel:
        String(req.body?.statusLabel ?? '').trim() || 'Currently Watching. No final rating.',
      currentEp: Math.max(0, Math.floor(Number(req.body?.currentEp ?? 0))),
      totalEp: Math.max(1, Math.floor(Number(req.body?.totalEp ?? 1))),
    };
    const nextWatching = [...state.animeUniverse.watching];
    nextWatching[idx] = updated;
    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      watching: nextWatching,
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  app.delete('/api/anime-universe/watching/:id', async (req: Request, res: Response) => {
    const state = await ensureStateLoaded();
    const nextWatching = state.animeUniverse.watching.filter((w) => w.id !== req.params.id);
    if (nextWatching.length === state.animeUniverse.watching.length) {
      res.status(404).json({ error: 'Watching entry not found' });
      return;
    }
    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      watching: nextWatching,
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  app.post('/api/anime-universe/discovery', async (req: Request, res: Response) => {
    const title = String(req.body?.title ?? '').trim();
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    const posterUrl = sanitizePoster(req.body?.posterUrl);
    if (!posterUrl) {
      res.status(400).json({ error: 'Poster URL must start with /assets/, http://, or https://' });
      return;
    }
    const state = await ensureStateLoaded();
    const created: DiscoveryAnimeItem = {
      id: `disc-${Date.now()}`,
      title,
      posterUrl,
      category: sanitizeCat(req.body?.category),
      genres: sanitizeAnimeGenres(req.body?.genres),
      demographic: sanitizeDemo(req.body?.demographic),
      synopsis: String(req.body?.synopsis ?? '').trim(),
      whyOnList: String(req.body?.whyOnList ?? '').trim(),
      watchlistStatus:
        String(req.body?.watchlistStatus ?? '').trim() || 'Candidate · Pending Confirmation',
    };
    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      discovery: [...state.animeUniverse.discovery, created],
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  app.put('/api/anime-universe/discovery/:id', async (req: Request, res: Response) => {
    const title = String(req.body?.title ?? '').trim();
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    const posterUrl = sanitizePoster(req.body?.posterUrl);
    if (!posterUrl) {
      res.status(400).json({ error: 'Poster URL must start with /assets/, http://, or https://' });
      return;
    }
    const state = await ensureStateLoaded();
    const idx = state.animeUniverse.discovery.findIndex((d) => d.id === req.params.id);
    if (idx < 0) {
      res.status(404).json({ error: 'Discovery candidate not found' });
      return;
    }
    const nextDiscovery = [...state.animeUniverse.discovery];
    nextDiscovery[idx] = {
      ...nextDiscovery[idx],
      title,
      posterUrl,
      category: sanitizeCat(req.body?.category),
      genres: sanitizeAnimeGenres(req.body?.genres),
      demographic: sanitizeDemo(req.body?.demographic),
      synopsis: String(req.body?.synopsis ?? '').trim(),
      whyOnList: String(req.body?.whyOnList ?? '').trim(),
      watchlistStatus:
        String(req.body?.watchlistStatus ?? '').trim() || 'Candidate · Pending Confirmation',
    };
    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      discovery: nextDiscovery,
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  app.delete('/api/anime-universe/discovery/:id', async (req: Request, res: Response) => {
    const state = await ensureStateLoaded();
    const nextDiscovery = state.animeUniverse.discovery.filter((d) => d.id !== req.params.id);
    if (nextDiscovery.length === state.animeUniverse.discovery.length) {
      res.status(404).json({ error: 'Discovery candidate not found' });
      return;
    }
    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      discovery: nextDiscovery,
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  app.post('/api/anime-universe/discovery/:id/promote', async (req: Request, res: Response) => {
    if (req.body?.confirmedWatched !== true) {
      res.status(400).json({
        error: 'Explicit watched confirmation is required before moving Discovery to Collection',
      });
      return;
    }
    const state = await ensureStateLoaded();
    const candidate = state.animeUniverse.discovery.find((d) => d.id === req.params.id);
    if (!candidate) {
      res.status(404).json({ error: 'Discovery candidate not found' });
      return;
    }
    const nextDiscovery = state.animeUniverse.discovery.filter((d) => d.id !== req.params.id);
    const list = [...state.animeUniverse.collection];
    const targetRank = clampRank(req.body?.rank ?? list.length + 1, list.length + 1);
    const promoted: CompletedAnimeItem = {
      id: `col-${Date.now()}`,
      rank: targetRank,
      title: candidate.title,
      posterUrl: candidate.posterUrl,
      genres: candidate.genres,
      demographic: candidate.demographic,
      frontNote: String(req.body?.frontNote ?? '').trim() || candidate.whyOnList,
      lifeLesson: String(req.body?.lifeLesson ?? '').trim(),
    };
    list.splice(targetRank - 1, 0, promoted);
    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      collection: reindexCollection(list),
      discovery: nextDiscovery,
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  const sanitizeExternalUrl = (raw: unknown): string | null => {
    const str = String(raw ?? '').trim();
    if (!str) return null;
    try {
      const parsed = new URL(str);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
    } catch {
      // Invalid URL
    }
    return null;
  };

  const applyRewardAction = (
    universe: AnimeUniverseState,
    opts: {
      voterId?: string;
      displayName?: string;
      source: 'chat' | 'comment' | 'suggest' | 'vote';
      animeIdForVote?: string;
      stickerIdForChat?: string;
      dayKey?: string;
    }
  ): Record<string, RewardUserProfile> => {
    const baseProfiles = { ...(universe.rewardProfiles ?? {}) };
    const voterId = String(opts.voterId ?? '').trim().slice(0, 120);
    if (!voterId) return baseProfiles;

    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const existing = baseProfiles[voterId] ?? createEmptyRewardProfile(voterId, opts.displayName);
    const cleanedName = String(opts.displayName ?? '')
      .replace(/[\r\n\t]+/g, ' ')
      .trim()
      .slice(0, 32);

    const nextDisplayName =
      cleanedName && cleanedName !== 'Community Member'
        ? cleanedName
        : existing.displayName || (cleanedName || undefined);

    const profile: RewardUserProfile = {
      ...existing,
      displayName: nextDisplayName,
      votedAnimeIds: Array.isArray(existing.votedAnimeIds) ? [...existing.votedAnimeIds] : [],
      chatDays: Array.isArray(existing.chatDays) ? [...existing.chatDays] : [],
      badges: Array.isArray(existing.badges) ? [...existing.badges] : [],
      xpEvents: Array.isArray(existing.xpEvents) ? [...existing.xpEvents] : [],
      updatedAt: nowIso,
    };

    const cutoffMs = nowMs - 14 * 24 * 60 * 60 * 1000;
    profile.xpEvents = profile.xpEvents.filter((ev) => {
      const ts = Date.parse(ev.at);
      return Number.isFinite(ts) && ts >= cutoffMs;
    });

    if (opts.source === 'chat') {
      profile.totalXp += REWARD_XP_VALUES.chat;
      profile.chatCount += 1;
      profile.xpEvents.push({ amount: REWARD_XP_VALUES.chat, source: 'chat', at: nowIso });

      const dayKey = normalizeDayKey(opts.dayKey, nowMs);
      if (!profile.chatDays.includes(dayKey)) {
        profile.chatDays = [...profile.chatDays, dayKey].sort().slice(-45);
      }
      const streak = calculateStreakEndingAt(profile.chatDays, dayKey);
      profile.currentStreak = streak;
      profile.longestStreak = Math.max(profile.longestStreak || 0, streak);

      if (streak >= 2 && profile.lastStreakBonusDate !== dayKey) {
        profile.totalXp += REWARD_XP_VALUES.streakBonus;
        profile.lastStreakBonusDate = dayKey;
        profile.xpEvents.push({
          amount: REWARD_XP_VALUES.streakBonus,
          source: 'streak',
          at: nowIso,
        });
      }

      // Daily Quests: Chat 2 times (+50 XP) & Send 5 stickers (+30 XP), auto-reset per dayKey
      const prevQuest =
        profile.dailyQuestProgress && profile.dailyQuestProgress.dayKey === dayKey
          ? profile.dailyQuestProgress
          : {
              dayKey,
              chatCount: 0,
              completed: false,
              stickerCount: 0,
              stickerCompleted: false,
              voteCount: 0,
              voteCompleted: false,
            };

      const nextChatCount = prevQuest.chatCount + 1;
      const chatNewlyDone = !prevQuest.completed && nextChatCount >= DAILY_QUEST_CHAT_TARGET;

      const prevStickerCount = prevQuest.stickerCount ?? 0;
      const nextStickerCount = prevStickerCount + (opts.stickerIdForChat ? 1 : 0);
      const stickerNewlyDone =
        !prevQuest.stickerCompleted && nextStickerCount >= DAILY_QUEST_STICKER_TARGET;

      profile.dailyQuestProgress = {
        ...prevQuest,
        dayKey,
        chatCount: nextChatCount,
        completed: prevQuest.completed || chatNewlyDone,
        completedAt: prevQuest.completed
          ? prevQuest.completedAt
          : chatNewlyDone
            ? nowIso
            : undefined,
        stickerCount: nextStickerCount,
        stickerCompleted: Boolean(prevQuest.stickerCompleted) || stickerNewlyDone,
        stickerCompletedAt: prevQuest.stickerCompleted
          ? prevQuest.stickerCompletedAt
          : stickerNewlyDone
            ? nowIso
            : undefined,
      };

      if (chatNewlyDone) {
        profile.totalXp += REWARD_XP_VALUES.dailyQuestChat;
        profile.xpEvents.push({
          amount: REWARD_XP_VALUES.dailyQuestChat,
          source: 'daily_quest',
          at: nowIso,
        });
      }

      if (stickerNewlyDone) {
        profile.totalXp += REWARD_XP_VALUES.dailyQuestSticker;
        profile.xpEvents.push({
          amount: REWARD_XP_VALUES.dailyQuestSticker,
          source: 'daily_quest',
          at: nowIso,
        });
      }
    } else if (opts.source === 'comment') {
      profile.totalXp += REWARD_XP_VALUES.comment;
      profile.commentCount += 1;
      profile.xpEvents.push({ amount: REWARD_XP_VALUES.comment, source: 'comment', at: nowIso });
    } else if (opts.source === 'suggest') {
      profile.totalXp += REWARD_XP_VALUES.suggest;
      profile.suggestCount += 1;
      profile.xpEvents.push({ amount: REWARD_XP_VALUES.suggest, source: 'suggest', at: nowIso });
    } else if (opts.source === 'vote' && opts.animeIdForVote) {
      if (!profile.votedAnimeIds.includes(opts.animeIdForVote)) {
        profile.votedAnimeIds.push(opts.animeIdForVote);
        profile.totalXp += REWARD_XP_VALUES.vote;
        profile.voteCount += 1;
        profile.xpEvents.push({ amount: REWARD_XP_VALUES.vote, source: 'vote', at: nowIso });
      }

      // Daily Quest: Vote 1 Anime = +20 XP (auto-resets per dayKey)
      const dayKey = normalizeDayKey(opts.dayKey, nowMs);
      const prevQuest =
        profile.dailyQuestProgress && profile.dailyQuestProgress.dayKey === dayKey
          ? profile.dailyQuestProgress
          : {
              dayKey,
              chatCount: 0,
              completed: false,
              stickerCount: 0,
              stickerCompleted: false,
              voteCount: 0,
              voteCompleted: false,
            };
      const nextVoteCount = (prevQuest.voteCount ?? 0) + 1;
      const voteNewlyDone = !prevQuest.voteCompleted && nextVoteCount >= DAILY_QUEST_VOTE_TARGET;

      profile.dailyQuestProgress = {
        ...prevQuest,
        dayKey,
        voteCount: nextVoteCount,
        voteCompleted: Boolean(prevQuest.voteCompleted) || voteNewlyDone,
        voteCompletedAt: prevQuest.voteCompleted
          ? prevQuest.voteCompletedAt
          : voteNewlyDone
            ? nowIso
            : undefined,
      };

      if (voteNewlyDone) {
        profile.totalXp += REWARD_XP_VALUES.dailyQuestVote;
        profile.xpEvents.push({
          amount: REWARD_XP_VALUES.dailyQuestVote,
          source: 'daily_quest',
          at: nowIso,
        });
      }
    }

    baseProfiles[voterId] = profile;
    const maxVotes = getMaxCommunityVoteCount(baseProfiles);
    for (const [id, p] of Object.entries(baseProfiles)) {
      baseProfiles[id] = {
        ...p,
        badges: getEffectiveBadges(p, maxVotes),
      };
    }

    return baseProfiles;
  };

  app.post('/api/anime-universe/suggestions', async (req: Request, res: Response) => {
    const title = String(req.body?.title ?? '').trim().slice(0, 140);
    const why = String(req.body?.why ?? '').trim().slice(0, 500);
    const submittedBy = String(req.body?.submittedBy ?? '').trim().slice(0, 80) || 'Community Member';
    const voterId = String(req.body?.voterId ?? '').trim().slice(0, 120);
    const link = sanitizeExternalUrl(req.body?.link);

    if (!title) {
      res.status(400).json({ error: 'Anime title is required' });
      return;
    }
    if (!link) {
      res.status(400).json({ error: 'Please enter a valid http:// or https:// streaming link' });
      return;
    }
    if (!why) {
      res.status(400).json({ error: 'Please share why you love this anime' });
      return;
    }

    const state = await ensureStateLoaded();
    const pendingList = Array.isArray(state.animeUniverse.pendingSuggestions)
      ? state.animeUniverse.pendingSuggestions
      : [];

    const created: PendingAnimeSuggestion = {
      id: `sug-anime-${Date.now()}`,
      title,
      link,
      why,
      submittedBy,
      submittedAt: new Date().toISOString(),
    };

    const nextRewardProfiles = applyRewardAction(state.animeUniverse, {
      voterId,
      displayName: submittedBy,
      source: 'suggest',
    });

    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      pendingSuggestions: [created, ...pendingList],
      rewardProfiles: nextRewardProfiles,
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.status(201).json(nextUniverse);
  });

  app.post('/api/anime-universe/suggestions/:id/approve', async (req: Request, res: Response) => {
    const state = await ensureStateLoaded();
    const pendingList = Array.isArray(state.animeUniverse.pendingSuggestions)
      ? state.animeUniverse.pendingSuggestions
      : [];
    const suggestion = pendingList.find((s) => s.id === req.params.id);
    if (!suggestion) {
      res.status(404).json({ error: 'Pending suggestion not found' });
      return;
    }

    const posterUrl = sanitizePoster(req.body?.posterUrl ?? '/assets/anime/frieren.jpg');
    if (!posterUrl) {
      res.status(400).json({ error: 'Poster URL must start with /assets/, http://, or https://' });
      return;
    }

    const approvedItem: DiscoveryAnimeItem = {
      id: `disc-${Date.now()}`,
      title: suggestion.title,
      posterUrl,
      category: sanitizeCat(req.body?.category ?? 'Drama / Emotional'),
      genres: sanitizeAnimeGenres(req.body?.genres ?? ['Action', 'Drama']),
      demographic: sanitizeDemo(req.body?.demographic ?? 'Shonen'),
      synopsis:
        String(req.body?.synopsis ?? '').trim() ||
        `Community pick suggested by ${suggestion.submittedBy}.`,
      whyOnList: suggestion.why,
      watchlistStatus: `Approved Suggestion · Suggested by ${suggestion.submittedBy}`,
      streamingUrl: suggestion.link,
      suggestedBy: suggestion.submittedBy,
    };

    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      pendingSuggestions: pendingList.filter((s) => s.id !== req.params.id),
      discovery: [...state.animeUniverse.discovery, approvedItem],
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  app.delete('/api/anime-universe/suggestions/:id', async (req: Request, res: Response) => {
    const state = await ensureStateLoaded();
    const pendingList = Array.isArray(state.animeUniverse.pendingSuggestions)
      ? state.animeUniverse.pendingSuggestions
      : [];
    const nextPending = pendingList.filter((s) => s.id !== req.params.id);
    if (nextPending.length === pendingList.length) {
      res.status(404).json({ error: 'Pending suggestion not found' });
      return;
    }
    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      pendingSuggestions: nextPending,
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  app.post('/api/anime-universe/vote', async (req: Request, res: Response) => {
    const animeId = String(req.body?.animeId ?? '').trim();
    const voterId = String(req.body?.voterId ?? '').trim().slice(0, 120);
    const voterName = String(req.body?.voterName ?? '').trim().slice(0, 80);
    const upvoted = Boolean(req.body?.upvoted);
    const rawStars = Number(req.body?.stars ?? 0);
    const stars = Number.isInteger(rawStars) && rawStars >= 0 && rawStars <= 5 ? rawStars : -1;

    if (!animeId || !voterId) {
      res.status(400).json({ error: 'animeId and voterId are required' });
      return;
    }
    if (stars < 0) {
      res.status(400).json({ error: 'Stars rating must be an integer between 0 and 5' });
      return;
    }

    const state = await ensureStateLoaded();
    const validIds = new Set<string>([
      ...state.animeUniverse.collection.map((c) => c.id),
      ...state.animeUniverse.watching.map((w) => w.id),
      ...state.animeUniverse.discovery.map((d) => d.id),
    ]);

    if (!validIds.has(animeId)) {
      res.status(404).json({ error: 'Anime card not found' });
      return;
    }

    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const currentUniverse = state.animeUniverse;
    const existingVotes: CommunityVoteRecord[] = Array.isArray(currentUniverse.communityVotes)
      ? currentUniverse.communityVotes
      : [];

    const preRankMaps: Record<RankingPeriod, Record<string, number>> = {
      week: extractPeriodRankMap(currentUniverse, 'week', nowMs),
      month: extractPeriodRankMap(currentUniverse, 'month', nowMs),
      year: extractPeriodRankMap(currentUniverse, 'year', nowMs),
      all_time: extractPeriodRankMap(currentUniverse, 'all_time', nowMs),
    };

    const filteredVotes = existingVotes.filter(
      (v) => !(v.animeId === animeId && v.voterId === voterId)
    );
    const nextVotes: CommunityVoteRecord[] =
      upvoted || stars > 0
        ? [
            ...filteredVotes,
            {
              animeId,
              voterId,
              voterName: voterName || undefined,
              upvoted,
              stars,
              updatedAt: nowIso,
            },
          ]
        : filteredVotes;

    const tentativeUniverse: AnimeUniverseState = {
      ...currentUniverse,
      communityVotes: nextVotes,
    };

    const nextSnapshots: CommunityRankSnapshots = {
      ...(currentUniverse.communityRankSnapshots ?? createEmptyRankSnapshots()),
    };

    for (const p of RANKING_PERIODS) {
      const preMap = preRankMaps[p.key];
      const postMap = extractPeriodRankMap(tentativeUniverse, p.key, nowMs);
      const preOrder = Object.entries(preMap)
        .sort((a, b) => a[1] - b[1])
        .map(([id]) => id)
        .join(',');
      const postOrder = Object.entries(postMap)
        .sort((a, b) => a[1] - b[1])
        .map(([id]) => id)
        .join(',');
      if (preOrder !== postOrder) {
        nextSnapshots[p.key] = preMap;
      }
    }

    const nextRewardProfiles =
      upvoted || stars > 0
        ? applyRewardAction(tentativeUniverse, {
            voterId,
            displayName: voterName,
            source: 'vote',
            animeIdForVote: animeId,
            dayKey: req.body?.dayKey,
          })
        : tentativeUniverse.rewardProfiles ?? {};

    const nextUniverse: AnimeUniverseState = {
      ...tentativeUniverse,
      communityRankSnapshots: nextSnapshots,
      rewardProfiles: nextRewardProfiles,
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  app.get('/api/anime-universe/sticker-chat', async (_req: Request, res: Response) => {
    const state = await ensureStateLoaded();
    const list = Array.isArray(state.animeUniverse.stickerChatMessages)
      ? state.animeUniverse.stickerChatMessages
      : [];
    res.json(list);
  });

  app.post('/api/anime-universe/sticker-chat', async (req: Request, res: Response) => {
    const rawText = String(req.body?.text ?? '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim()
      .slice(0, 500);
    const rawStickerId = typeof req.body?.stickerId === 'string' ? req.body.stickerId.trim() : '';
    const rawSender = String(req.body?.senderName ?? '')
      .replace(/[\r\n\t]+/g, ' ')
      .trim()
      .slice(0, 32);

    const rawVoterId = String(req.body?.voterId ?? '').trim().slice(0, 120);
    const dayKey = req.body?.dayKey;

    if (Array.isArray(req.body?.stickerId) || Array.isArray(req.body?.stickers)) {
      res.status(400).json({ error: 'Max 1 sticker per message' });
      return;
    }

    if (rawStickerId && !VALID_STICKER_ID_SET.has(rawStickerId)) {
      res.status(400).json({ error: 'Invalid sticker selection' });
      return;
    }

    if (!rawText && !rawStickerId) {
      res.status(400).json({ error: 'Type a message or pick a sticker to send' });
      return;
    }

    const state = await ensureStateLoaded();
    const currentMessages = Array.isArray(state.animeUniverse.stickerChatMessages)
      ? state.animeUniverse.stickerChatMessages
      : [];

    const created: StickerChatMessage = {
      id: `stk-msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: rawText || undefined,
      stickerId: rawStickerId || undefined,
      senderName: rawSender || undefined,
      voterId: rawVoterId || undefined,
      createdAt: new Date().toISOString(),
      hearts: 0,
      heartedBy: [],
    };

    const nextRewardProfiles = applyRewardAction(state.animeUniverse, {
      voterId: rawVoterId,
      displayName: rawSender,
      source: 'chat',
      stickerIdForChat: rawStickerId || undefined,
      dayKey,
    });

    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      stickerChatMessages: [...currentMessages, created].slice(-250),
      rewardProfiles: nextRewardProfiles,
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.status(201).json(nextUniverse);
  });

  app.post('/api/anime-universe/comments', async (req: Request, res: Response) => {
    const animeId = String(req.body?.animeId ?? '').trim();
    const voterId = String(req.body?.voterId ?? '').trim().slice(0, 120);
    const authorName = String(req.body?.authorName ?? '')
      .replace(/[\r\n\t]+/g, ' ')
      .trim()
      .slice(0, 32);
    const text = String(req.body?.text ?? '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim()
      .slice(0, 500);

    if (!animeId || !voterId) {
      res.status(400).json({ error: 'animeId and voterId are required' });
      return;
    }
    if (!text) {
      res.status(400).json({ error: 'Comment text is required' });
      return;
    }

    const state = await ensureStateLoaded();
    const validIds = new Set<string>([
      ...state.animeUniverse.collection.map((c) => c.id),
      ...state.animeUniverse.watching.map((w) => w.id),
      ...state.animeUniverse.discovery.map((d) => d.id),
    ]);
    if (!validIds.has(animeId)) {
      res.status(404).json({ error: 'Anime card not found' });
      return;
    }

    const currentComments = Array.isArray(state.animeUniverse.animeComments)
      ? state.animeUniverse.animeComments
      : [];

    const created: AnimeCommentItem = {
      id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      animeId,
      voterId,
      authorName: authorName || undefined,
      text,
      createdAt: new Date().toISOString(),
    };

    const nextRewardProfiles = applyRewardAction(state.animeUniverse, {
      voterId,
      displayName: authorName,
      source: 'comment',
    });

    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      animeComments: [...currentComments, created],
      rewardProfiles: nextRewardProfiles,
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.status(201).json(nextUniverse);
  });

  app.delete('/api/anime-universe/comments/:id', async (req: Request, res: Response) => {
    const state = await ensureStateLoaded();
    const currentComments = Array.isArray(state.animeUniverse.animeComments)
      ? state.animeUniverse.animeComments
      : [];
    const nextComments = currentComments.filter((c) => c.id !== req.params.id);
    if (nextComments.length === currentComments.length) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }
    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      animeComments: nextComments,
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  app.post('/api/anime-universe/rewards/profile', async (req: Request, res: Response) => {
    const voterId = String(req.body?.voterId ?? '').trim().slice(0, 120);
    const displayName = String(req.body?.displayName ?? '')
      .replace(/[\r\n\t]+/g, ' ')
      .trim()
      .slice(0, 32);
    if (!voterId) {
      res.status(400).json({ error: 'voterId is required' });
      return;
    }
    const state = await ensureStateLoaded();
    const profiles = { ...(state.animeUniverse.rewardProfiles ?? {}) };
    const existing = profiles[voterId] ?? createEmptyRewardProfile(voterId, displayName);
    profiles[voterId] = {
      ...existing,
      displayName: displayName || undefined,
      updatedAt: new Date().toISOString(),
    };
    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      rewardProfiles: profiles,
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  app.post('/api/anime-universe/sticker-chat/:id/heart', async (req: Request, res: Response) => {
    const voterId = String(req.body?.voterId ?? '').trim().slice(0, 120);
    if (!voterId) {
      res.status(400).json({ error: 'voterId is required' });
      return;
    }

    const state = await ensureStateLoaded();
    const currentMessages = Array.isArray(state.animeUniverse.stickerChatMessages)
      ? state.animeUniverse.stickerChatMessages
      : [];

    const idx = currentMessages.findIndex((m) => m.id === req.params.id);
    if (idx < 0) {
      res.status(404).json({ error: 'Sticker message not found' });
      return;
    }

    const target = currentMessages[idx];
    const heartedSet = new Set(Array.isArray(target.heartedBy) ? target.heartedBy : []);
    if (heartedSet.has(voterId)) {
      heartedSet.delete(voterId);
    } else {
      heartedSet.add(voterId);
    }
    const nextHeartedBy = Array.from(heartedSet);

    const nextMessages = [...currentMessages];
    nextMessages[idx] = {
      ...target,
      heartedBy: nextHeartedBy,
      hearts: nextHeartedBy.length,
    };

    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      stickerChatMessages: nextMessages,
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  app.delete('/api/anime-universe/sticker-chat/:id', async (req: Request, res: Response) => {
    const state = await ensureStateLoaded();
    const currentMessages = Array.isArray(state.animeUniverse.stickerChatMessages)
      ? state.animeUniverse.stickerChatMessages
      : [];
    const nextMessages = currentMessages.filter((m) => m.id !== req.params.id);
    if (nextMessages.length === currentMessages.length) {
      res.status(404).json({ error: 'Sticker message not found' });
      return;
    }
    const nextUniverse: AnimeUniverseState = {
      ...state.animeUniverse,
      stickerChatMessages: nextMessages,
    };
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  app.post('/api/anime-universe/reset', async (_req: Request, res: Response) => {
    const state = await ensureStateLoaded();
    const nextUniverse = structuredClone(DEFAULT_ANIME_UNIVERSE_STATE);
    await persistState({ ...state, animeUniverse: nextUniverse });
    res.json(nextUniverse);
  });

  // Vite middleware in dev, static dist in production
  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`ANIBEATS server running on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ANIBEATS server:', err);
  process.exit(1);
});
