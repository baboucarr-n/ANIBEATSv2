import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useScroll } from 'motion/react';
import { ChevronDown, ExternalLink, Pause, Play, Plus, SlidersHorizontal, X } from 'lucide-react';
import {
  ALL_ANIME_DEMOGRAPHICS,
  ALL_ANIME_GENRES,
  DISCOVERY_CATEGORIES,
  type AnimeDemographic,
  type AnimeGenreName,
  type AnimeUniverseState,
  type CurrentlyWatchingItem,
} from '../data/animeUniverseData';
import type {
  CommunityVotePayload,
  SubmitSuggestionPayload,
} from '../services/animeUniverseApi';
import { getAnimeVoteSummaryMap } from '../utils/communityRankings';
import { LivingWallZone, type LivingPanelSpec } from './LivingWall3D';
import { AnimeFlipCard } from './AnimeFlipCard';
import { AnimeVoteBar } from './AnimeVoteBar';
import { CommunityRankingsBlock } from './CommunityRankingsBlock';
import { StickerChatSection } from './StickerChatSection';
import { SuggestAnimeModal } from './SuggestAnimeModal';
import { AnimeRewardsBlock } from './AnimeRewardsBlock';
import { AnimeCommentsModal, type CommentTargetAnime } from './AnimeCommentsModal';
import { DailyQuestsBlock } from './DailyQuestsBlock';
import { getLocalDayKey, getMaxCommunityVoteCount } from '../utils/rewardSystem';

type SubNavKey =
  | 'overview'
  | 'collection'
  | 'watching'
  | 'discovery'
  | 'rankings'
  | 'chat'
  | 'rewards';

interface AnimeUniverseSectionProps {
  state: AnimeUniverseState;
  busy: boolean;
  onOpenAdmin: () => void;
  onIncrementWatchingEp: (item: CurrentlyWatchingItem) => Promise<void>;
  onSubmitSuggestion: (payload: SubmitSuggestionPayload) => Promise<void>;
  onVoteAnime: (payload: CommunityVotePayload) => Promise<void>;
  onSendStickerMessage: (payload: {
    text?: string;
    stickerId?: string;
    senderName?: string;
    voterId?: string;
    dayKey?: string;
  }) => Promise<void>;
  onToggleStickerHeart: (messageId: string, voterId: string) => Promise<void>;
  onRefreshStickerMessages: () => Promise<void>;
  onAddAnimeComment: (payload: {
    animeId: string;
    voterId: string;
    authorName?: string;
    text: string;
  }) => Promise<void>;
  onUpdateRewardProfile: (payload: {
    voterId: string;
    displayName?: string;
  }) => Promise<void>;
}

const SUB_NAV_ITEMS: { key: SubNavKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'collection', label: 'My Collection' },
  { key: 'watching', label: 'Currently Watching' },
  { key: 'discovery', label: 'Discovery' },
  { key: 'rankings', label: 'Community Rankings' },
  { key: 'chat', label: 'Chat' },
  { key: 'rewards', label: 'Rewards' },
];

const VOTER_ID_KEY = 'anibeats_voter_id';
const VOTER_NAME_KEY = 'anibeats_voter_name';

function getOrCreateVoterId(): string {
  if (typeof window === 'undefined') return 'voter-ssr';
  try {
    const existing = window.localStorage.getItem(VOTER_ID_KEY);
    if (existing) return existing;
    const generated =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `voter-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(VOTER_ID_KEY, generated);
    return generated;
  } catch {
    return `voter-${Date.now()}`;
  }
}

// HERO LIVING WALL PANELS — positioned right/lower clear of Hero titles, 35% opacity + slight blur via LivingWallZone
const HERO_WALL_PANELS: LivingPanelSpec[] = [
  {
    id: 'hero-panel-1',
    src: '/assets/aistudio/onepiece2_4bb89afb.jpg',
    alt: 'Straw Hat Luffy standing at the ship bow looking toward sunlit horizon',
    left: '64%',
    top: '54%',
    sizeClass: 'w-64 sm:w-80 lg:w-[380px]',
    aspectClass: 'aspect-[9/16]',
    tiltX: 4,
    tiltY: -10,
    tiltZ: -2,
    depth: 1.2,
    phase: 0,
  },
  {
    id: 'hero-panel-2',
    src: '/assets/aistudio/onepiece1_21f2efa4.jpg',
    alt: 'Young Luffy smiling under bright sky holding straw hat',
    left: '86%',
    top: '46%',
    sizeClass: 'w-56 sm:w-72 lg:w-[340px]',
    aspectClass: 'aspect-[9/16]',
    tiltX: -3,
    tiltY: -14,
    tiltZ: 3,
    depth: 0.85,
    phase: 1.8,
  },
  {
    id: 'hero-panel-3',
    src: '/assets/aistudio/111piece_6e2e0997.jpg',
    alt: 'Monkey D. Luffy iconic pirate poster artwork',
    left: '74%',
    top: '76%',
    sizeClass: 'w-52 sm:w-64 lg:w-[310px]',
    aspectClass: 'aspect-[9/16]',
    tiltX: 5,
    tiltY: 11,
    tiltZ: -4,
    depth: 0.95,
    phase: 3.1,
  },
];

// MY COLLECTION LIVING WALL PANELS — Uploaded Images 4–6
const COLLECTION_WALL_PANELS: LivingPanelSpec[] = [
  {
    id: 'col-panel-4',
    src: '/assets/aistudio/Tom_0cea8eab.jpg',
    alt: 'Stylized Tom portrait in burgundy jacket with sunglasses',
    left: '16%',
    top: '34%',
    sizeClass: 'w-64 sm:w-80 lg:w-[360px]',
    aspectClass: 'aspect-[9/16]',
    tiltX: 4,
    tiltY: 14,
    tiltZ: -3,
    depth: 0.9,
    phase: 0.4,
  },
  {
    id: 'col-panel-5',
    src: '/assets/aistudio/badman-Tom_8bbeff6b.jpg',
    alt: 'Editorial Tom and Jerry poster collage artwork',
    left: '52%',
    top: '52%',
    sizeClass: 'w-64 sm:w-80 lg:w-[380px]',
    aspectClass: 'aspect-[9/16]',
    tiltX: -4,
    tiltY: -10,
    tiltZ: 2,
    depth: 1.15,
    phase: 1.9,
  },
  {
    id: 'col-panel-6',
    src: '/assets/aistudio/meural-onepiece_701cd09a.jpg',
    alt: 'One Piece Luffy Haki street art mural illustration',
    left: '84%',
    top: '44%',
    sizeClass: 'w-72 sm:w-96 lg:w-[440px]',
    aspectClass: 'aspect-[16/10]',
    tiltX: 3,
    tiltY: -15,
    tiltZ: 3,
    depth: 1.0,
    phase: 3.2,
  },
];

// CURRENTLY WATCHING BIG CINEMATIC PANEL — Uploaded Image 7
const WATCHING_WALL_PANELS: LivingPanelSpec[] = [
  {
    id: 'watch-panel-7',
    src: '/assets/aistudio/thorfen-dad_bb3409b2.jpg',
    alt: 'Thorfinn and Thors standing beneath glowing northern lights',
    left: '52%',
    top: '50%',
    sizeClass: 'w-[92%] sm:w-[78%] lg:w-[70%] max-w-[900px]',
    aspectClass: 'aspect-[16/9]',
    tiltX: 3,
    tiltY: -6,
    tiltZ: 0,
    depth: 1.1,
    phase: 0.7,
  },
];

// DISCOVERY SLOWLY ROTATING PANELS — Uploaded Images 8–10
const DISCOVERY_WALL_PANELS: LivingPanelSpec[] = [
  {
    id: 'disc-panel-8',
    src: '/assets/aistudio/One-piece-drama_7e6d3f3f.jpg',
    alt: 'Classic anime characters gathered peacefully on cliffside overlooking clouds',
    left: '18%',
    top: '42%',
    sizeClass: 'w-60 sm:w-72 lg:w-[360px]',
    aspectClass: 'aspect-[9/16]',
    tiltX: 5,
    tiltY: 16,
    tiltZ: -3,
    depth: 1.05,
    phase: 0.5,
  },
  {
    id: 'disc-panel-9',
    src: '/assets/aistudio/one-piece-fave_77840fc5.jpg',
    alt: 'Monkey D. Luffy silhouette filled with Grand Line island adventures',
    left: '52%',
    top: '48%',
    sizeClass: 'w-64 sm:w-80 lg:w-[380px]',
    aspectClass: 'aspect-[9/16]',
    tiltX: -4,
    tiltY: -8,
    tiltZ: 2,
    depth: 1.2,
    phase: 2.0,
  },
  {
    id: 'disc-panel-10',
    src: '/assets/aistudio/1piece_3a94f9a0.png',
    alt: 'Luffy adjusting his straw hat under shadow — I will be the Pirate King',
    left: '84%',
    top: '46%',
    sizeClass: 'w-60 sm:w-72 lg:w-[360px]',
    aspectClass: 'aspect-[9/16]',
    tiltX: 4,
    tiltY: -15,
    tiltZ: 4,
    depth: 0.95,
    phase: 3.4,
  },
];

export function AnimeUniverseSection({
  state,
  busy,
  onOpenAdmin,
  onIncrementWatchingEp,
  onSubmitSuggestion,
  onVoteAnime,
  onSendStickerMessage,
  onToggleStickerHeart,
  onRefreshStickerMessages,
  onAddAnimeComment,
  onUpdateRewardProfile,
}: AnimeUniverseSectionProps) {
  const [subNav, setSubNav] = useState<SubNavKey>('overview');
  const [selectedGenres, setSelectedGenres] = useState<AnimeGenreName[]>([]);
  const [selectedDemographic, setSelectedDemographic] = useState<AnimeDemographic | 'All'>('All');
  const [genresExpanded, setGenresExpanded] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [commentingAnime, setCommentingAnime] = useState<CommentTargetAnime | null>(null);
  const [voterId] = useState<string>(() => getOrCreateVoterId());
  const [voterName, setVoterName] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      return window.localStorage.getItem(VOTER_NAME_KEY) ?? '';
    } catch {
      return '';
    }
  });

  const sectionRef = useRef<HTMLElement>(null);
  const heroZoneRef = useRef<HTMLDivElement>(null);
  const collectionZoneRef = useRef<HTMLDivElement>(null);
  const watchingZoneRef = useRef<HTMLDivElement>(null);
  const discoveryZoneRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroZoneRef,
    offset: ['start end', 'end start'],
  });
  const { scrollYProgress: collectionScroll } = useScroll({
    target: collectionZoneRef,
    offset: ['start end', 'end start'],
  });
  const { scrollYProgress: watchingScroll } = useScroll({
    target: watchingZoneRef,
    offset: ['start end', 'end start'],
  });
  const { scrollYProgress: discoveryScroll } = useScroll({
    target: discoveryZoneRef,
    offset: ['start end', 'end start'],
  });

  // Smooth damped mouse parallax for background LivingWallZone panels (UNTOUCHED)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || motionPaused) {
      el.style.setProperty('--mx', '0');
      el.style.setProperty('--my', '0');
      return;
    }

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let rafId = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      target.x = Math.max(-1, Math.min(1, nx));
      target.y = Math.max(-1, Math.min(1, ny));
    };

    const onPointerLeave = () => {
      target.x = 0;
      target.y = 0;
    };

    const tick = () => {
      current.x += (target.x - current.x) * 0.065;
      current.y += (target.y - current.y) * 0.065;
      el.style.setProperty('--mx', current.x.toFixed(4));
      el.style.setProperty('--my', current.y.toFixed(4));
      rafId = requestAnimationFrame(tick);
    };

    el.addEventListener('pointermove', onPointerMove, { passive: true });
    el.addEventListener('pointerleave', onPointerLeave, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [motionPaused]);

  const toggleGenre = (genre: AnimeGenreName) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedDemographic('All');
  };

  const hasFilters = selectedGenres.length > 0 || selectedDemographic !== 'All';

  const matchesFilters = useMemo(() => {
    return (genres: AnimeGenreName[], demographic: AnimeDemographic) => {
      if (selectedDemographic !== 'All' && demographic !== selectedDemographic) {
        return false;
      }
      if (selectedGenres.length > 0) {
        return selectedGenres.every((g) => genres.includes(g));
      }
      return true;
    };
  }, [selectedGenres, selectedDemographic]);

  const sortedCollection = useMemo(() => {
    return [...state.collection]
      .sort((a, b) => a.rank - b.rank)
      .filter((item) => matchesFilters(item.genres, item.demographic));
  }, [state.collection, matchesFilters]);

  const filteredWatching = useMemo(() => {
    return state.watching.filter((item) => matchesFilters(item.genres, item.demographic));
  }, [state.watching, matchesFilters]);

  const filteredDiscovery = useMemo(() => {
    return state.discovery.filter((item) => matchesFilters(item.genres, item.demographic));
  }, [state.discovery, matchesFilters]);

  const featuredTopOne = useMemo(() => {
    return [...state.collection].sort((a, b) => a.rank - b.rank)[0];
  }, [state.collection]);

  const handleVoterNameChange = useCallback((nextName: string) => {
    setVoterName(nextName);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(VOTER_NAME_KEY, nextName);
      } catch {
        // ignore storage restrictions
      }
    }
  }, []);

  const handleVote = useCallback(
    (animeId: string, next: { upvoted: boolean; stars: number }) => {
      void onVoteAnime({
        animeId,
        voterId,
        voterName: voterName.trim() || undefined,
        upvoted: next.upvoted,
        stars: next.stars,
        dayKey: getLocalDayKey(),
      });
    },
    [onVoteAnime, voterId, voterName]
  );

  const voteSummaries = useMemo(
    () => getAnimeVoteSummaryMap(state.communityVotes, voterId),
    [state.communityVotes, voterId]
  );

  const commentCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cmt of state.animeComments ?? []) {
      map[cmt.animeId] = (map[cmt.animeId] ?? 0) + 1;
    }
    return map;
  }, [state.animeComments]);

  const maxCommunityVotes = useMemo(
    () => getMaxCommunityVoteCount(state.rewardProfiles),
    [state.rewardProfiles]
  );

  const pendingCount = state.pendingSuggestions?.length ?? 0;

  const showCollectionPart = subNav === 'overview' || subNav === 'collection';
  const showWatchingPart = subNav === 'overview' || subNav === 'watching';
  const showDiscoveryPart = subNav === 'overview' || subNav === 'discovery';
  const showRankingsPart = subNav === 'overview' || subNav === 'rankings';
  const showChatPart = subNav === 'overview' || subNav === 'chat';
  const showQuestsPart = subNav === 'overview' || subNav === 'chat' || subNav === 'rewards';
  const showRewardsPart = subNav === 'overview' || subNav === 'rewards';

  return (
    <section
      ref={sectionRef}
      id="anime-universe"
      aria-labelledby="anime-universe-heading"
      className="relative overflow-hidden bg-[#F6F7F9] text-[#121417] border-t border-[#A8E84A] scroll-mt-0"
    >
      {/* =====================================================================
          HERO ZONE — Cool titanium canvas, flat frosted title surface, zero gradients
         ===================================================================== */}
      <div
        ref={heroZoneRef}
        className="relative min-h-[54vh] sm:min-h-[60vh] w-full flex flex-col justify-between"
      >
        <div className="pointer-events-none absolute inset-x-0 top-16 bottom-0 z-0">
          <LivingWallZone
            panels={HERO_WALL_PANELS}
            scrollYProgress={heroScroll}
            paused={motionPaused}
            parallaxRange={48}
            connectorStyle="hero"
          />
        </div>

        {/* Minimal Top Header Row */}
        <div className="relative z-20 max-w-[1360px] w-full mx-auto px-5 sm:px-8 lg:px-12 pt-8 flex items-center justify-between gap-4">
          <span className="inline-block px-3 py-1 -ml-3 rounded-full bg-[#F6F7F9]/85 backdrop-blur-md text-xs font-bold tracking-[0.16em] uppercase text-[#121417]">
            ANIBEATS · Anime World
          </span>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setSuggestOpen(true)}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-4 py-1.5 rounded-full bg-[#121417] text-white border border-[#A8E84A] hover:opacity-90 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-opacity"
            >
              <Plus className="w-3.5 h-3.5 text-[#A8E84A]" />
              <span>Suggest an Anime</span>
            </button>

            <button
              type="button"
              onClick={() => setMotionPaused((prev) => !prev)}
              aria-pressed={motionPaused}
              className={`inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                motionPaused
                  ? 'bg-[#121417] text-white border border-[#121417]'
                  : 'bg-white/80 border border-[#D5DBE4] text-[#121417] hover:bg-[#121417] hover:text-white hover:border-[#121417]'
              }`}
            >
              {motionPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{motionPaused ? 'Resume Wall' : 'Pause Wall'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-4 py-1.5 rounded-full bg-white/80 border border-[#D5DBE4] hover:bg-[#121417] hover:text-white hover:border-[#121417] text-xs font-semibold text-[#121417] whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Manage Anime</span>
              {pendingCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-[#EA843D] text-[#121417] font-data text-[10px] font-bold leading-none">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Center-Left Editorial Statement — flat frosted surface, 100% readable, zero gradient */}
        <div className="relative z-20 max-w-[1360px] w-full mx-auto px-5 sm:px-8 lg:px-12 my-auto py-14 sm:py-20">
          <div className="max-w-lg -mx-5 -my-3 px-5 py-4 rounded-2xl bg-[#F6F7F9]/88 backdrop-blur-md">
            <h2
              id="anime-universe-heading"
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-[-0.035em] leading-[1.03] text-[#121417]"
            >
              Every story leaves something behind.
            </h2>

            <p className="mt-4 text-sm sm:text-base font-semibold text-[#4B5563] tracking-tight">
              Stories. Characters. Memories. Life Lessons.
            </p>
          </div>
        </div>

        {/* Bottom Architectural Sub-Navigation */}
        <div className="relative z-20 max-w-[1360px] w-full mx-auto px-5 sm:px-8 lg:px-12">
          <div className="border-b border-[#DDE2EA] flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <nav
              aria-label="Anime Universe sections"
              className="flex items-center gap-2 overflow-x-auto no-scrollbar"
            >
              {SUB_NAV_ITEMS.map((navItem) => {
                const active = subNav === navItem.key;
                const count =
                  navItem.key === 'collection'
                    ? state.collection.length
                    : navItem.key === 'watching'
                      ? state.watching.length
                      : navItem.key === 'discovery'
                        ? state.discovery.length
                        : null;

                return (
                  <button
                    key={navItem.key}
                    type="button"
                    onClick={() => setSubNav(navItem.key)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      active
                        ? 'bg-[#121417] text-white'
                        : 'bg-transparent text-[#4B5563] hover:text-[#121417] hover:bg-[#E9EDF4]/70'
                    }`}
                  >
                    <span>{navItem.label}</span>
                    {count !== null && (
                      <span
                        className={`ml-1.5 font-data text-[11px] ${
                          active ? 'text-[#D1D5DB]' : 'text-[#6B7280]'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="inline-flex items-center gap-3 text-xs font-data font-semibold text-[#4B5563] self-start sm:self-auto">
              <span>{state.collection.length} Ranked</span>
              <span aria-hidden="true" className="text-[#CBD5E1]">
                ·
              </span>
              <span>{state.watching.length} Watching</span>
              <span aria-hidden="true" className="text-[#CBD5E1]">
                ·
              </span>
              <span>{state.discovery.length} Discovery</span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          PAGE BODY (STRICT 16PX GAP, COMPACT EQUAL CARDS, COOL TITANIUM PALETTE)
         ===================================================================== */}
      <div className="relative z-10 max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 pt-6 pb-24">
        {/* ONE CLEAN FILTER ROW */}
        <div className="border-b border-[#DDE2EA] pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mr-2">
                Demographic
              </span>
              <button
                type="button"
                onClick={() => setSelectedDemographic('All')}
                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                  selectedDemographic === 'All'
                    ? 'bg-[#121417] text-white border border-[#121417]'
                    : 'bg-white/80 border border-[#D5DBE4] text-[#121417] hover:border-[#A8E84A]'
                }`}
              >
                All
              </button>
              {ALL_ANIME_DEMOGRAPHICS.map((demo) => {
                const active = selectedDemographic === demo;
                return (
                  <button
                    key={demo}
                    type="button"
                    onClick={() => setSelectedDemographic(active ? 'All' : demo)}
                    aria-pressed={active}
                    className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                      active
                        ? 'bg-[#121417] text-white border border-[#121417]'
                        : 'bg-white/80 border border-[#D5DBE4] text-[#121417] hover:border-[#A8E84A]'
                    }`}
                  >
                    {demo}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {selectedGenres.length > 0 && (
                <div className="hidden md:flex items-center gap-1">
                  {selectedGenres.slice(0, 3).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#121417] text-white cursor-pointer"
                    >
                      <span>{g}</span>
                      <X className="w-2.5 h-2.5" />
                    </button>
                  ))}
                  {selectedGenres.length > 3 && (
                    <span className="text-[11px] font-data font-semibold text-[#121417] px-1">
                      +{selectedGenres.length - 3}
                    </span>
                  )}
                </div>
              )}

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/80 border border-[#D5DBE4] text-[#121417] hover:border-[#A8E84A] cursor-pointer transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setGenresExpanded((prev) => !prev)}
                aria-expanded={genresExpanded}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                  genresExpanded || selectedGenres.length > 0
                    ? 'bg-[#121417] text-white border border-[#121417]'
                    : 'bg-white/80 text-[#121417] border border-[#D5DBE4] hover:border-[#A8E84A]'
                }`}
              >
                <span>
                  Genres{selectedGenres.length > 0 ? ` (${selectedGenres.length})` : ''}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    genresExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {genresExpanded && (
            <div className="pt-4 mt-4 border-t border-[#DDE2EA]">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Multi-Genre Filter · Matches All Selected
                </span>
                <button
                  type="button"
                  onClick={() => setGenresExpanded(false)}
                  className="text-xs font-semibold text-[#121417] hover:opacity-75 cursor-pointer"
                >
                  Done
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {ALL_ANIME_GENRES.map((genre) => {
                  const active = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      aria-pressed={active}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                        active
                          ? 'bg-[#121417] text-white border border-[#121417]'
                          : 'bg-white/80 text-[#121417] border border-[#D5DBE4] hover:border-[#A8E84A]'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* OVERVIEW LEAD SUMMARY — Frosted white architectural panels, #01 copper #EA843D pop */}
        {subNav === 'overview' && featuredTopOne && !hasFilters && (
          <div className="mt-10 grid grid-cols-12 gap-4 items-stretch">
            <div className="col-span-12 lg:col-span-6 rounded-[16px] bg-white/80 backdrop-blur-sm border border-[#DDE2EA] p-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EA843D] text-[#121417] font-data text-[11px] font-bold">
                  #01
                </span>
                <p className="font-data text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4B5563]">
                  All-Time Rank · {featuredTopOne.demographic}
                </p>
              </div>
              <h3 className="mt-2.5 text-2xl sm:text-3xl font-bold tracking-tight text-[#121417]">
                {featuredTopOne.title}
              </h3>
              <p className="mt-1 text-xs font-medium text-[#6B7280]">
                {featuredTopOne.genres.join(' · ')}
              </p>
              <p className="mt-4 text-sm sm:text-base text-[#121417] leading-relaxed">
                “{featuredTopOne.frontNote}”
              </p>
              <p className="mt-3 text-sm font-semibold text-[#121417]">
                Life Lesson: “{featuredTopOne.lifeLesson}”
              </p>
            </div>

            <div className="col-span-12 lg:col-span-6 rounded-[16px] bg-white/80 backdrop-blur-sm border border-[#DDE2EA] p-6">
              <div className="flex items-center justify-between gap-2">
                <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-[#4B5563]">
                  Watching Right Now
                </p>
                <span className="text-[11px] font-medium text-[#6B7280]">No final rating</span>
              </div>

              <div className="mt-3 divide-y divide-[#E2E6ED]">
                {state.watching.map((w) => (
                  <div
                    key={w.id}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#121417] truncate">{w.title}</h4>
                      <p className="text-xs text-[#4B5563] truncate mt-0.5">{w.note}</p>
                    </div>
                    <span className="font-data text-xs font-bold text-[#121417] shrink-0">
                      Ep {w.currentEp}/{w.totalEp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            PART 1 — COMPLETED COLLECTION
           =================================================================== */}
        {showCollectionPart && (
          <div className="mt-14 pt-2">
            <div className="relative z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
              <div>
                <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B7280]">
                  Part 1 · Completed Collection
                </p>
                <h3 className="mt-1 inline-block text-2xl sm:text-3xl font-bold tracking-tight text-[#121417] border-b border-[#A8E84A] pb-1">
                  Ranked 01–{String(state.collection.length).padStart(2, '0')}
                </h3>
              </div>
              <p className="text-xs font-medium text-[#4B5563]">
                Tap or click any poster to flip for Life Lesson
              </p>
            </div>

            <div ref={collectionZoneRef} className="relative py-4 overflow-hidden rounded-[16px]">
              <LivingWallZone
                panels={COLLECTION_WALL_PANELS}
                scrollYProgress={collectionScroll}
                paused={motionPaused}
                softBlurBehindCards
                parallaxRange={60}
                connectorStyle="collection"
              />

              <div className="relative z-20">
                {sortedCollection.length === 0 ? (
                  <div className="py-12 text-center rounded-[16px] bg-white/75 border border-[#DDE2EA]">
                    <p className="text-sm font-medium text-[#121417]">
                      No completed anime match the active filters.
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-3 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#121417] text-white cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 items-stretch">
                    {sortedCollection.map((item) => (
                      <AnimeFlipCard
                        key={item.id}
                        item={item}
                        voteSummary={voteSummaries[item.id]}
                        commentCount={commentCounts[item.id] ?? 0}
                        onOpenComments={() =>
                          setCommentingAnime({
                            id: item.id,
                            title: item.title,
                            posterUrl: item.posterUrl,
                            tag: 'Completed Collection',
                          })
                        }
                        onVote={handleVote}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            PART 2 — CURRENTLY WATCHING
           =================================================================== */}
        {showWatchingPart && (
          <div className="mt-20 pt-14 border-t border-[#DDE2EA]">
            <div className="relative z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
              <div>
                <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B7280]">
                  Part 2 · Currently Watching
                </p>
                <h3 className="mt-1 inline-block text-2xl sm:text-3xl font-bold tracking-tight text-[#121417] border-b border-[#A8E84A] pb-1">
                  In Progress · No Final Rating
                </h3>
              </div>
              <p className="text-xs font-medium text-[#4B5563]">
                Separated from Completed Collection
              </p>
            </div>

            <div
              ref={watchingZoneRef}
              className="relative py-4 overflow-hidden min-h-[380px] rounded-[16px]"
            >
              <LivingWallZone
                panels={WATCHING_WALL_PANELS}
                scrollYProgress={watchingScroll}
                paused={motionPaused}
                cinematicSolo
                parallaxRange={45}
                connectorStyle="watching"
              />

              <div className="relative z-20">
                {filteredWatching.length === 0 ? (
                  <div className="py-10 text-center rounded-[16px] bg-white/75 border border-[#DDE2EA]">
                    <p className="text-sm font-medium text-[#121417]">
                      No Currently Watching anime match those filters.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                    {filteredWatching.map((item) => {
                      const pct = Math.min(
                        100,
                        Math.round((item.currentEp / Math.max(1, item.totalEp)) * 100)
                      );
                      return (
                        <article
                          key={item.id}
                          className="flex flex-col justify-between h-full bg-transparent"
                        >
                          <div className="w-full">
                            <div className="w-full max-w-[213px]">
                              <div className="relative w-full aspect-[2/3] max-h-[320px] overflow-hidden rounded-[16px] border border-[#D5DBE4] bg-[#ECEEF2]">
                                <img
                                  src={item.posterUrl}
                                  alt={`${item.title} anime poster`}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover object-center"
                                />
                              </div>
                            </div>

                            <div className="pt-3">
                              <div className="flex flex-wrap items-center gap-2 text-xs text-[#121417]">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#D5DBE4] bg-white/85 text-[#121417] font-data text-[11px] font-bold">
                                  Watching
                                </span>
                                <span className="font-semibold text-[#121417]">{item.statusLabel}</span>
                                <span aria-hidden="true" className="text-[#9CA3AF]">
                                  ·
                                </span>
                                <span className="font-semibold">{item.demographic}</span>
                                <span aria-hidden="true" className="text-[#9CA3AF]">
                                  ·
                                </span>
                                <span className="text-[#4B5563]">{item.genres.join(' · ')}</span>
                              </div>

                              <h4 className="mt-1.5 text-lg font-bold text-[#121417]">
                                {item.title}
                              </h4>
                              <p className="mt-1 text-sm text-[#4B5563] leading-relaxed">
                                {item.note}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 pt-4 border-t border-[#DDE2EA]">
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="text-[#4B5563] font-semibold">Episode Progress</span>
                              <span className="font-data font-bold text-[#121417]">
                                Ep {item.currentEp} / {item.totalEp} ({pct}%)
                              </span>
                            </div>
                            <div className="h-[2px] w-full bg-[#DDE2EA] overflow-hidden">
                              <div
                                className="h-full bg-[#A8E84A] transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="mt-3.5 flex items-center justify-between gap-3">
                              <button
                                type="button"
                                disabled={busy || item.currentEp >= item.totalEp}
                                onClick={() => onIncrementWatchingEp(item)}
                                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/85 border border-[#D5DBE4] text-[#121417] hover:bg-[#121417] hover:text-white hover:border-[#A8E84A] disabled:opacity-40 cursor-pointer transition-colors"
                              >
                                {item.currentEp >= item.totalEp ? 'Season Reached' : 'Continue (+1 Ep)'}
                              </button>
                              <button
                                type="button"
                                onClick={onOpenAdmin}
                                className="text-xs font-semibold text-[#4B5563] hover:text-[#121417] cursor-pointer"
                              >
                                Edit in Admin
                              </button>
                            </div>

                            <AnimeVoteBar
                              animeId={item.id}
                              animeTitle={item.title}
                              summary={voteSummaries[item.id]}
                              commentCount={commentCounts[item.id] ?? 0}
                              onOpenComments={() =>
                                setCommentingAnime({
                                  id: item.id,
                                  title: item.title,
                                  posterUrl: item.posterUrl,
                                  tag: 'Currently Watching',
                                })
                              }
                              onVote={handleVote}
                            />
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            PART 3 — DISCOVERY TOP 20
           =================================================================== */}
        {showDiscoveryPart && (
          <div className="mt-20 pt-14 border-t border-[#DDE2EA]">
            <div className="relative z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
              <div>
                <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B7280]">
                  Part 3 · Discovery Top {state.discovery.length} Watchlist
                </p>
                <h3 className="mt-1 inline-block text-2xl sm:text-3xl font-bold tracking-tight text-[#121417] border-b border-[#A8E84A] pb-1">
                  Candidates Pending Confirmation
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-medium text-[#4B5563]">
                  No life lesson until watched & confirmed
                </p>
                <button
                  type="button"
                  onClick={() => setSuggestOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/85 border border-[#D5DBE4] text-[#121417] hover:border-[#A8E84A] cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Suggest an Anime</span>
                </button>
              </div>
            </div>

            <div
              ref={discoveryZoneRef}
              className="relative py-4 overflow-hidden rounded-[16px]"
            >
              <LivingWallZone
                panels={DISCOVERY_WALL_PANELS}
                scrollYProgress={discoveryScroll}
                paused={motionPaused}
                slowRotate
                parallaxRange={65}
                connectorStyle="discovery"
              />

              <div className="relative z-20">
                {filteredDiscovery.length === 0 ? (
                  <div className="py-12 text-center rounded-[16px] bg-white/75 border border-[#DDE2EA]">
                    <p className="text-sm font-medium text-[#121417]">
                      No Discovery candidates match the active filters.
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-3 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#121417] text-white cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-14">
                    {DISCOVERY_CATEGORIES.map((category, catIdx) => {
                      const items = filteredDiscovery.filter((d) => d.category === category);
                      if (items.length === 0) return null;
                      const letter = String.fromCharCode(65 + catIdx);

                      return (
                        <div key={category}>
                          <div className="flex items-center justify-between gap-3 mb-5 pb-2 border-b border-[#DDE2EA]">
                            <h4 className="inline-block text-base sm:text-lg font-bold text-[#121417] bg-[#F6F7F9]/85 backdrop-blur-sm rounded-lg px-2 py-0.5 -ml-2">
                              <span className="font-data text-sm text-[#4B5563] mr-2">{letter}.</span>
                              {category}
                            </h4>
                            <span className="font-data text-xs font-semibold text-[#4B5563]">
                              {items.length} {items.length === 1 ? 'title' : 'titles'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 items-stretch">
                            {items.map((cand, candIdx) => (
                              <article
                                key={cand.id}
                                className="flex flex-col justify-start h-full bg-transparent"
                              >
                                <div className="w-full max-w-[213px]">
                                  <div className="relative w-full aspect-[2/3] max-h-[320px] overflow-hidden rounded-[16px] border border-[#D5DBE4] bg-[#ECEEF2]">
                                    <img
                                      src={cand.posterUrl}
                                      alt={`${cand.title} anime poster`}
                                      loading="lazy"
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover object-center"
                                    />
                                  </div>
                                </div>

                                <div className="pt-3 flex flex-col flex-1 bg-transparent">
                                  <div className="flex items-center gap-2 text-xs text-[#121417]">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#D5DBE4] bg-white/85 text-[#121417] font-data text-[11px] font-bold">
                                      {letter}
                                      {String(candIdx + 1).padStart(2, '0')}
                                    </span>
                                    <span className="font-semibold text-[#121417]">{cand.demographic}</span>
                                  </div>

                                  <p className="mt-1.5 text-[12px] leading-[1.4] text-[#4B5563] font-medium">
                                    {cand.genres.join(' · ')}
                                  </p>

                                  <h5 className="mt-1.5 text-[14px] font-bold text-[#121417] leading-snug">
                                    {cand.title}
                                  </h5>
                                  <p className="mt-1 text-xs text-[#4B5563] leading-relaxed">
                                    {cand.synopsis}
                                  </p>
                                  <p className="mt-1.5 text-xs text-[#121417] font-semibold leading-snug">
                                    Why: {cand.whyOnList}
                                  </p>

                                  {cand.streamingUrl && (
                                    <a
                                      href={cand.streamingUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-2 inline-flex items-center gap-1 self-start text-[11px] font-semibold text-[#121417] underline decoration-[#A8E84A] underline-offset-2 hover:opacity-80"
                                    >
                                      <span>Streaming Link</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}

                                  <p className="mt-auto pt-2 text-[11px] font-medium text-[#6B7280]">
                                    {cand.watchlistStatus}
                                  </p>

                                  <AnimeVoteBar
                                    animeId={cand.id}
                                    animeTitle={cand.title}
                                    summary={voteSummaries[cand.id]}
                                    commentCount={commentCounts[cand.id] ?? 0}
                                    onOpenComments={() =>
                                      setCommentingAnime({
                                        id: cand.id,
                                        title: cand.title,
                                        posterUrl: cand.posterUrl,
                                        tag: 'Discovery Candidate',
                                      })
                                    }
                                    onVote={handleVote}
                                  />
                                </div>
                              </article>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            COMMUNITY RANKINGS — TOP 10 BY TIMEFRAME
           =================================================================== */}
        {showRankingsPart && (
          <CommunityRankingsBlock
            state={state}
            voterName={voterName}
            onVoterNameChange={handleVoterNameChange}
            voteSummaries={voteSummaries}
            onVote={handleVote}
            onOpenSuggest={() => setSuggestOpen(true)}
          />
        )}

        {/* ===================================================================
            ANIME CHAT — TEXT, KEYBOARD EMOJIS & 328+ BIG STICKERS
           =================================================================== */}
        {showChatPart && (
          <StickerChatSection
            messages={state.stickerChatMessages ?? []}
            rewardProfiles={state.rewardProfiles}
            busy={busy}
            voterId={voterId}
            voterName={voterName}
            onVoterNameChange={handleVoterNameChange}
            onSendMessage={onSendStickerMessage}
            onToggleHeart={(messageId) => onToggleStickerHeart(messageId, voterId)}
            onRefreshMessages={onRefreshStickerMessages}
          />
        )}

        {/* ===================================================================
            DAILY QUESTS — 3 QUESTS PER DAY
           =================================================================== */}
        {showQuestsPart && (
          <DailyQuestsBlock
            profile={state.rewardProfiles?.[voterId]}
            onJumpToChat={() => {
              if (subNav === 'rewards') {
                setSubNav('chat');
              }
              requestAnimationFrame(() => {
                document.getElementById('anime-chat')?.scrollIntoView({ behavior: 'smooth' });
              });
            }}
            onJumpToRankings={() => {
              if (subNav === 'chat' || subNav === 'rewards') {
                setSubNav('rankings');
              }
              requestAnimationFrame(() => {
                document
                  .getElementById('community-rankings')
                  ?.scrollIntoView({ behavior: 'smooth' });
              });
            }}
          />
        )}

        {/* ===================================================================
            REWARD SYSTEM — XP, DISCORD ROLE COLORS, STREAK, BADGES & TOP 10
           =================================================================== */}
        {showRewardsPart && (
          <AnimeRewardsBlock
            state={state}
            voterId={voterId}
            voterName={voterName}
            onVoterNameChange={handleVoterNameChange}
            onSaveProfileName={(name) =>
              onUpdateRewardProfile({
                voterId,
                displayName: name.trim() || undefined,
              })
            }
          />
        )}
      </div>

      <SuggestAnimeModal
        open={suggestOpen}
        busy={busy}
        defaultName={voterName}
        onClose={() => setSuggestOpen(false)}
        onSubmit={async (payload) => {
          if (payload.submittedBy && payload.submittedBy !== 'Community Member') {
            handleVoterNameChange(payload.submittedBy);
          }
          await onSubmitSuggestion({ ...payload, voterId });
        }}
      />

      <AnimeCommentsModal
        anime={commentingAnime}
        comments={state.animeComments ?? []}
        rewardProfiles={state.rewardProfiles}
        maxCommunityVotes={maxCommunityVotes}
        voterName={voterName}
        onVoterNameChange={handleVoterNameChange}
        busy={busy}
        onClose={() => setCommentingAnime(null)}
        onAddComment={async ({ animeId, authorName, text }) => {
          await onAddAnimeComment({
            animeId,
            voterId,
            authorName,
            text,
          });
        }}
      />
    </section>
  );
}
