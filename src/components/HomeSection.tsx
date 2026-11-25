import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, SlidersHorizontal, ExternalLink, Box, Youtube } from 'lucide-react';
import {
  MOOD_OPTIONS,
  type AnimeEntry,
  type CarEntry,
  type MoodKey,
  type PlaylistEntry,
  type SongOfTheWeek,
  type TravelDestination,
} from '../data/anibeatsData';
import type { WeeklyMustItem } from '../utils/youtube';
import { HeroSculpture3D } from './three/HeroSculpture3D';

interface HomeSectionProps {
  selectedMood: MoodKey;
  onSelectMood: (mood: MoodKey) => void;
  animeWall: AnimeEntry[];
  songOfTheWeek: SongOfTheWeek;
  playlists: PlaylistEntry[];
  cars: CarEntry[];
  travelTrips: TravelDestination[];
  visitedTravelCount: number;
  moodMatchCount: number;
  currentWeeklyMust: WeeklyMustItem | null;
  onNavigateWeeklyMust: () => void;
  onOpenAdmin: () => void;
}

type StageTab = '3d' | 'anime' | 'playlists' | 'cars' | 'travel';

const STAGE_TABS: {
  key: StageTab;
  label: string;
  activeClass: string;
}[] = [
  { key: '3d', label: '3D Stage', activeClass: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { key: 'anime', label: '01. Anime', activeClass: 'text-rose-700 bg-rose-50 border-rose-200' },
  { key: 'playlists', label: '02. Spotify', activeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { key: 'cars', label: '03. Cars', activeClass: 'text-blue-700 bg-blue-50 border-blue-200' },
  { key: 'travel', label: '04. Travel', activeClass: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
];

const MOOD_ACCENTS: Record<MoodKey, string> = {
  all: 'text-zinc-950 bg-white border-zinc-200',
  hype: 'text-rose-700 bg-rose-50 border-rose-200',
  chill: 'text-cyan-700 bg-cyan-50 border-cyan-200',
  'late-night': 'text-indigo-700 bg-indigo-50 border-indigo-200',
  sad: 'text-violet-700 bg-violet-50 border-violet-200',
  workout: 'text-emerald-700 bg-emerald-50 border-emerald-200',
};

export function HomeSection({
  selectedMood,
  onSelectMood,
  animeWall,
  songOfTheWeek,
  playlists,
  cars,
  travelTrips,
  visitedTravelCount,
  moodMatchCount,
  currentWeeklyMust,
  onNavigateWeeklyMust,
  onOpenAdmin,
}: HomeSectionProps) {
  const [stageTab, setStageTab] = useState<StageTab>('3d');
  const activeMoodObj = MOOD_OPTIONS.find((m) => m.key === selectedMood) ?? MOOD_OPTIONS[0];

  const featuredAnime = animeWall[0];
  const featuredPlaylist = playlists[0];
  const featuredCar = cars[0];
  const featuredTrip = travelTrips[0];
  const activeWorld = stageTab === '3d' ? 'anime' : stageTab;

  const weeklyThumb = currentWeeklyMust?.youtubeVideoId
    ? `https://img.youtube.com/vi/${currentWeeklyMust.youtubeVideoId}/hqdefault.jpg`
    : null;
  const weeklyTitle = currentWeeklyMust?.youtubeVideoId
    ? currentWeeklyMust.title
    : 'To be filled — Weekly MUST coming soon';

  return (
    <section id="home" className="studio-wash-hero pt-12 pb-20 md:pt-20 md:pb-24">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Split-Screen Editorial Hero with Interactive 3D Spatial Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600 mb-5">
              Baboucarr · Personal Archive &amp; Living World
            </p>

            <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-[-0.04em] leading-[0.98] text-zinc-950 mb-5">
              ANIBEATS{' '}
              <span className="relative inline-block">
                v2.
                <span
                  aria-hidden="true"
                  className="absolute left-0 right-0 bottom-1 h-2 bg-gradient-to-r from-indigo-600 via-rose-500 to-cyan-500 rounded-full"
                />
              </span>
            </h1>

            <p className="text-xl sm:text-2xl font-medium text-zinc-700 leading-snug tracking-tight mb-5">
              <span className="text-rose-600 font-semibold">Anime.</span>{' '}
              <span className="text-emerald-600 font-semibold">Rap.</span>{' '}
              <span className="text-violet-600 font-semibold">Beats.</span>{' '}
              <span className="text-blue-600 font-semibold">Cars.</span>{' '}
              <span className="text-cyan-600 font-semibold">Travel.</span>{' '}
              My World.
            </p>

            <p className="text-[15px] leading-relaxed text-zinc-600 max-w-lg mb-8">
              Started as a class assignment and turned into a place I genuinely love opening every day.
              Built piece by piece like an album — not a quick mixtape.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <motion.a
                whileTap={{ scale: 0.97 }}
                href="#anime"
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-zinc-950 to-indigo-950 hover:from-indigo-600 hover:to-violet-600 whitespace-nowrap shrink-0 transition-all shadow-sm"
              >
                <span>Explore My Picks</span>
                <ArrowRight className="w-4 h-4" />
              </motion.a>

              <motion.a
                whileTap={{ scale: 0.97 }}
                href="#story"
                className="inline-flex items-center justify-center min-h-[46px] px-6 py-2.5 rounded-xl text-sm font-semibold text-zinc-900 bg-white border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/40 whitespace-nowrap shrink-0 transition-colors"
              >
                Read My Story
              </motion.a>

              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 min-h-[46px] px-3 text-sm font-medium text-zinc-600 hover:text-indigo-600 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Edit in Admin</span>
              </button>
            </div>
          </div>

          {/* Right Column: Interactive 3D & Studio Preview Window */}
          <div className="lg:col-span-6">
            <div className="surface-card rounded-2xl overflow-hidden h-full flex flex-col">
              {/* Top Window Header Bar */}
              <div className="px-5 py-3.5 border-b border-zinc-200 bg-zinc-50/80 flex items-center justify-between gap-4">
                <span className="font-data text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  BABOUCARR / ANIBEATS · SPATIAL STAGE
                </span>
                <span className="font-data text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-gradient-to-r from-indigo-600 to-cyan-600 text-white">
                  3D LIVE
                </span>
              </div>

              {/* Segmented Tab Bar */}
              <div className="px-5 pt-3.5 pb-3 border-b border-zinc-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {STAGE_TABS.map((tab) => {
                  const active = stageTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setStageTab(tab.key)}
                      className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer border transition-colors ${
                        active
                          ? tab.activeClass
                          : 'text-zinc-500 border-transparent hover:text-zinc-900 hover:bg-zinc-50'
                      }`}
                    >
                      {tab.key === '3d' && <Box className="w-3 h-3 inline mr-1.5 -mt-0.5" />}
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Interactive Stage Content */}
              <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                {stageTab === '3d' && (
                  <div className="flex flex-col gap-3">
                    <div className="h-[260px] sm:h-[280px] rounded-xl overflow-hidden border border-zinc-200/80 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/50">
                      <HeroSculpture3D selectedMood={selectedMood} activeWorld={activeWorld} />
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs text-zinc-500 px-1">
                      <span>Drag to orbit 360° · Orbit rings spin to your mood</span>
                      <span className="font-data text-[11px] font-semibold text-indigo-600 uppercase">
                        Mood: {activeMoodObj.label}
                      </span>
                    </div>
                  </div>
                )}

                {stageTab === 'anime' && (
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    <div className="w-28 sm:w-32 aspect-[3/4] rounded-xl overflow-hidden border border-rose-200 bg-zinc-100 shrink-0 shadow-sm">
                      <img
                        src={featuredAnime?.posterUrl || '/assets/anime/aot.jpg'}
                        alt={featuredAnime?.title || 'Official Anime Poster'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-data text-[11px] font-semibold text-rose-600 uppercase">
                        Wall Slot #01 · {featuredAnime?.year || '2013'}
                      </p>
                      <h2 className="text-lg font-bold text-zinc-950 mt-1">
                        {featuredAnime?.title || 'Attack on Titan'}
                      </h2>
                      <p className="text-xs text-zinc-500 mt-1">{featuredAnime?.genreLabel}</p>
                      <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                        {featuredAnime?.why}
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <a
                          href="#anime"
                          className="text-xs font-semibold text-rose-600 hover:underline inline-flex items-center gap-1"
                        >
                          See all {animeWall.length} official posters <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {stageTab === 'playlists' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-data text-[11px] font-semibold text-emerald-600 uppercase">
                          Spotify Rotation · {featuredPlaylist?.moodLabel}
                        </p>
                        <h2 className="text-base font-bold text-zinc-950 mt-0.5">
                          {featuredPlaylist?.title}
                        </h2>
                      </div>
                      <a
                        href={featuredPlaylist?.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-emerald-700 hover:underline inline-flex items-center gap-1"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-xs text-zinc-500">{featuredPlaylist?.description}</p>
                    <div className="rounded-xl overflow-hidden border border-emerald-200 bg-zinc-50">
                      <iframe
                        title={featuredPlaylist?.title || 'Spotify Playlist'}
                        src={`https://open.spotify.com/embed/playlist/${
                          featuredPlaylist?.spotifyUrl.split('/playlist/')[1]?.split('?')[0] ||
                          '37i9dQZF1DX0XUsuxWHRQd'
                        }?utm_source=generator&theme=0`}
                        width="100%"
                        height="152"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="block border-0"
                      />
                    </div>
                  </div>
                )}

                {stageTab === 'cars' && (
                  <div className="space-y-4">
                    <div className="h-44 rounded-xl overflow-hidden border border-blue-200 bg-zinc-100">
                      <img
                        src={featuredCar?.imageUrl || '/assets/cars/skyline_gtr.jpg'}
                        alt={featuredCar?.name || 'Nissan Skyline GT-R'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-data text-[11px] font-semibold text-blue-600 uppercase">
                        Garage #01 · {featuredCar?.categoryLabel}
                      </p>
                      <h2 className="text-lg font-bold text-zinc-950 mt-0.5">
                        {featuredCar?.name}
                      </h2>
                      <p className="text-sm text-zinc-600 mt-1.5">{featuredCar?.why}</p>
                    </div>
                  </div>
                )}

                {stageTab === 'travel' && (
                  <div className="space-y-4">
                    <div className="h-44 rounded-xl overflow-hidden border border-cyan-200 bg-zinc-100 relative">
                      <img
                        src="/src/assets/images/anibeats_travel_visual_1795278851717.jpg"
                        alt="Tokyo skyline and Mount Fuji at dawn"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="font-data text-[11px] font-semibold text-cyan-700 uppercase">
                          Dream Trip #01 · {featuredTrip?.whyLabel}
                        </p>
                        <h2 className="text-lg font-bold text-zinc-950 mt-0.5">
                          {featuredTrip?.city}, {featuredTrip?.country}
                        </h2>
                        <p className="text-sm text-zinc-600 mt-1">{featuredTrip?.whyText}</p>
                      </div>
                      <span className="font-data text-sm font-bold text-cyan-700 tabular-nums shrink-0">
                        {visitedTravelCount}/80
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom Poster Thumbnail Strip */}
                <div className="mt-4 pt-3.5 border-t border-zinc-100 flex items-center justify-between gap-3">
                  <div className="flex items-center -space-x-2">
                    {animeWall.slice(0, 5).map((item) => (
                      <img
                        key={item.id}
                        src={item.posterUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                    ))}
                  </div>
                  <p className="font-data text-[11px] text-zinc-500">
                    {animeWall.length} anime · {playlists.length} playlists · {cars.length} cars
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 5-Column Color-Coded World KPI Spec Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-10">
          <a href="#anime" className="surface-card rounded-xl p-4 block hover:border-rose-300">
            <p className="font-data text-xs font-semibold text-rose-600">01 / ANIME</p>
            <p className="text-xl font-bold text-zinc-950 mt-1 tabular-nums">Top {animeWall.length}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Official flyers loaded</p>
          </a>

          <a href="#music" className="surface-card rounded-xl p-4 block hover:border-emerald-300">
            <p className="font-data text-xs font-semibold text-emerald-600">02 / MUSIC</p>
            <p className="text-xl font-bold text-zinc-950 mt-1">Rap + OST</p>
            <p className="text-xs text-zinc-500 mt-0.5">Live Spotify track</p>
          </a>

          <a href="#playlists" className="surface-card rounded-xl p-4 block hover:border-violet-300">
            <p className="font-data text-xs font-semibold text-violet-600">03 / PLAYLISTS</p>
            <p className="text-xl font-bold text-zinc-950 mt-1 tabular-nums">{playlists.length} Active</p>
            <p className="text-xs text-zinc-500 mt-0.5">Editable in Admin</p>
          </a>

          <a href="#cars" className="surface-card rounded-xl p-4 block hover:border-blue-300">
            <p className="font-data text-xs font-semibold text-blue-600">04 / GARAGE</p>
            <p className="text-xl font-bold text-zinc-950 mt-1 tabular-nums">{cars.length} Cars</p>
            <p className="text-xs text-zinc-500 mt-0.5">JDM &amp; dream builds</p>
          </a>

          <a href="#travel" className="col-span-2 sm:col-span-1 surface-card rounded-xl p-4 block hover:border-cyan-300">
            <p className="font-data text-xs font-semibold text-cyan-600">05 / TRAVEL</p>
            <p className="text-xl font-bold text-zinc-950 mt-1 font-data tabular-nums">
              {visitedTravelCount} / 80
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">3D Globe + Checklist</p>
          </a>
        </div>

        {/* Featured Row: 1 Anime, 1 Song, 1 Car, 1 Destination, + Weekly MUST */}
        <div className="mt-10">
          <div className="flex items-baseline justify-between gap-2 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 font-data">
              Featured Right Now
            </h2>
            <span className="text-xs text-zinc-500">1 pick from each world</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. Featured Anime */}
            <a href="#anime" className="surface-card rounded-xl overflow-hidden flex flex-col hover:border-rose-300">
              <div className="aspect-video bg-zinc-100 overflow-hidden">
                <img
                  src={featuredAnime?.posterUrl || '/assets/anime/aot.jpg'}
                  alt={featuredAnime?.title || 'Featured Anime'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-data text-[11px] font-semibold text-rose-600 uppercase">Anime</p>
                  <p className="text-sm font-bold text-zinc-950 mt-0.5 line-clamp-1">
                    {featuredAnime?.title || 'Attack on Titan'}
                  </p>
                </div>
                <span className="text-xs font-semibold text-zinc-700 mt-2 inline-flex items-center gap-1">
                  Explore Anime →
                </span>
              </div>
            </a>

            {/* 2. Featured Song */}
            <a href="#music" className="surface-card rounded-xl overflow-hidden flex flex-col hover:border-emerald-300">
              <div className="aspect-video bg-zinc-100 overflow-hidden">
                <img
                  src="/src/assets/images/anibeats_music_visual_1795278850957.jpg"
                  alt={songOfTheWeek.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-data text-[11px] font-semibold text-emerald-600 uppercase">Song</p>
                  <p className="text-sm font-bold text-zinc-950 mt-0.5 line-clamp-1">
                    {songOfTheWeek.title}
                  </p>
                </div>
                <span className="text-xs font-semibold text-zinc-700 mt-2 inline-flex items-center gap-1">
                  Listen Now →
                </span>
              </div>
            </a>

            {/* 3. Featured Car */}
            <a href="#cars" className="surface-card rounded-xl overflow-hidden flex flex-col hover:border-blue-300">
              <div className="aspect-video bg-zinc-100 overflow-hidden">
                <img
                  src={featuredCar?.imageUrl || '/assets/cars/skyline_gtr.jpg'}
                  alt={featuredCar?.name || 'Featured Car'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-data text-[11px] font-semibold text-blue-600 uppercase">Car</p>
                  <p className="text-sm font-bold text-zinc-950 mt-0.5 line-clamp-1">
                    {featuredCar?.name || 'Nissan Skyline GT-R'}
                  </p>
                </div>
                <span className="text-xs font-semibold text-zinc-700 mt-2 inline-flex items-center gap-1">
                  Open Garage →
                </span>
              </div>
            </a>

            {/* 4. Featured Destination */}
            <a href="#travel" className="surface-card rounded-xl overflow-hidden flex flex-col hover:border-cyan-300">
              <div className="aspect-video bg-zinc-100 overflow-hidden">
                <img
                  src="/src/assets/images/anibeats_travel_visual_1795278851717.jpg"
                  alt={featuredTrip?.country || 'Featured Destination'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-data text-[11px] font-semibold text-cyan-700 uppercase">Destination</p>
                  <p className="text-sm font-bold text-zinc-950 mt-0.5 line-clamp-1">
                    {featuredTrip ? `${featuredTrip.city}, ${featuredTrip.country}` : 'Tokyo, Japan'}
                  </p>
                </div>
                <span className="text-xs font-semibold text-zinc-700 mt-2 inline-flex items-center gap-1">
                  Explore 80 →
                </span>
              </div>
            </a>

            {/* 5. Weekly MUST Featured Card */}
            <a
              href="/weekly-must"
              onClick={(e) => {
                e.preventDefault();
                onNavigateWeeklyMust();
              }}
              className="surface-card rounded-xl overflow-hidden flex flex-col hover:border-violet-300 shadow-[0_12px_28px_-16px_rgba(124,58,237,0.22)]"
            >
              <div className="aspect-video bg-zinc-100 overflow-hidden">
                {weeklyThumb ? (
                  <img
                    src={weeklyThumb}
                    alt={weeklyTitle}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-50 via-white to-cyan-50 flex items-center justify-center">
                    <Youtube className="w-7 h-7 text-violet-600" />
                  </div>
                )}
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <p className="font-data text-[11px] font-semibold text-violet-600 uppercase">
                    Weekly MUST
                  </p>
                  <p className="text-sm font-bold text-zinc-950 mt-0.5 line-clamp-1">
                    {weeklyTitle}
                  </p>
                </div>
                <span className="text-xs font-semibold text-violet-700 mt-2 inline-flex items-center gap-1">
                  Watch This Week →
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* Interactive Mood Selector */}
        <div className="mt-14 pt-10 border-t border-zinc-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-bold text-zinc-950">Filter by Mood</h2>
              <p className="text-sm text-zinc-600 mt-1">{activeMoodObj.message}</p>
            </div>
            <p className="font-data text-xs font-semibold text-indigo-600 tabular-nums shrink-0">
              {selectedMood === 'all' ? 'ALL VIBES ACTIVE' : `${moodMatchCount} MATCHING PICKS`}
            </p>
          </div>

          <div
            className="inline-flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-zinc-100/90 border border-zinc-200/80"
            role="group"
            aria-label="Mood selector"
          >
            {MOOD_OPTIONS.map((mood) => {
              const isActive = selectedMood === mood.key;
              return (
                <button
                  key={mood.key}
                  type="button"
                  onClick={() => onSelectMood(mood.key)}
                  aria-pressed={isActive}
                  className={`min-h-[36px] px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer border transition-all ${
                    isActive
                      ? `${MOOD_ACCENTS[mood.key]} shadow-sm`
                      : 'border-transparent text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {mood.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
