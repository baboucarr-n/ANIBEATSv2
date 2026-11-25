import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, SlidersHorizontal } from 'lucide-react';
import {
  ANIME_GENRE_OPTIONS,
  WATCH_IF_YOU_LIKED,
  type AnimeEntry,
  type AnimeGenreKey,
  type CurrentlyWatchingState,
  type MoodKey,
} from '../data/anibeatsData';
import { Tilt3DCard } from './Tilt3DCard';

interface AnimeSectionProps {
  selectedMood: MoodKey;
  animeWall: AnimeEntry[];
  currentlyWatching: CurrentlyWatchingState;
  onOpenAdminAnime: () => void;
}

export function AnimeSection({
  selectedMood,
  animeWall,
  currentlyWatching,
  onOpenAdminAnime,
}: AnimeSectionProps) {
  const [genreFilter, setGenreFilter] = useState<AnimeGenreKey>('all');
  const [selectedAnime, setSelectedAnime] = useState<AnimeEntry | null>(null);

  const filteredTop10 = animeWall.filter(
    (item) => genreFilter === 'all' || item.genres.includes(genreFilter)
  );

  const episodePct =
    currentlyWatching.totalEp > 0
      ? Math.min(100, Math.round((currentlyWatching.currentEp / currentlyWatching.totalEp) * 100))
      : 0;

  return (
    <section id="anime" className="studio-wash-anime py-20 md:py-24 border-t border-zinc-200">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="font-data text-xs font-semibold uppercase tracking-wider text-rose-600 mb-3">
              02 · Anime Wall
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 mb-4">
              Official Posters. Personal Rankings.
            </h2>
            <p className="text-base text-zinc-600 leading-relaxed">
              Pre-loaded with real official anime key visual posters for testing. Hover for 3D depth, click any poster to inspect, or customize rankings and notes in the Admin Panel.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAdminAnime}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 whitespace-nowrap shrink-0 cursor-pointer self-start md:self-auto transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Edit Anime Wall</span>
          </button>
        </div>

        {/* Segmented Genre Filters */}
        <div
          className="inline-flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-zinc-100 border border-zinc-200/80 mb-8"
          role="group"
          aria-label="Anime genre filters"
        >
          {ANIME_GENRE_OPTIONS.map((opt) => {
            const isActive = genreFilter === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setGenreFilter(opt.key)}
                aria-pressed={isActive}
                className={`relative min-h-[36px] px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  isActive ? 'text-rose-700' : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="animeGenreTab"
                    transition={{ type: 'spring', stiffness: 540, damping: 36 }}
                    className="absolute inset-0 bg-white rounded-lg shadow-sm border border-rose-200"
                  />
                )}
                <span className="relative z-10">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Official Anime Poster Grid with interactive 3D Tilt Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {filteredTop10.map((anime) => {
            const matchesMood = selectedMood === 'all' || anime.moods.includes(selectedMood);
            return (
              <Tilt3DCard
                key={anime.id}
                sheenColor="rgba(225, 29, 72, 0.14)"
                className={`rounded-2xl transition-opacity ${
                  matchesMood ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedAnime(anime)}
                  className={`group text-left w-full h-full surface-card rounded-2xl overflow-hidden flex flex-col cursor-pointer hover:border-rose-300 ${
                    selectedMood !== 'all' && matchesMood ? 'ring-2 ring-rose-500' : ''
                  }`}
                >
                  <div className="relative aspect-[3/4] w-full bg-zinc-100 overflow-hidden">
                    <img
                      src={anime.posterUrl}
                      alt={`${anime.title} official poster`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 font-data text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-rose-600 text-white tabular-nums shadow-sm">
                      #{String(anime.rank).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                    <div>
                      <p className="font-data text-[11px] text-rose-600 font-medium">
                        {anime.year} · {anime.genreLabel}
                      </p>
                      <h3 className="text-sm font-bold text-zinc-950 mt-1 line-clamp-2">
                        {anime.title}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2.5 line-clamp-2">{anime.why}</p>
                  </div>
                </button>
              </Tilt3DCard>
            );
          })}
        </div>

        {/* Currently Watching Tracker + Hot Take Corner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          <div className="surface-card rounded-2xl p-7">
            <div className="flex items-center justify-between gap-2">
              <p className="font-data text-xs font-semibold text-rose-600 uppercase">
                Currently Watching
              </p>
              <span className="font-data text-xs font-semibold text-zinc-950 tabular-nums">
                Ep {currentlyWatching.currentEp} / {currentlyWatching.totalEp}
              </span>
            </div>
            <h3 className="text-xl font-bold text-zinc-950 mt-2">{currentlyWatching.title}</h3>
            <p className="text-sm text-zinc-600 mt-2">{currentlyWatching.note}</p>

            <div className="w-full h-2.5 rounded-full bg-rose-100 overflow-hidden mt-5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${episodePct}%` }}
              />
            </div>

            <p className="font-data text-xs text-zinc-500 mt-2.5 tabular-nums">
              {episodePct}% complete · Editable in Admin Panel
            </p>
          </div>

          <div className="surface-card rounded-2xl p-7">
            <p className="font-data text-xs font-semibold text-rose-600 uppercase">
              Hot Take Corner · To be filled by me
            </p>
            <h3 className="text-xl font-bold text-zinc-950 mt-2">Unpopular Anime Opinions</h3>
            <div className="space-y-3 mt-4 text-sm text-zinc-600 leading-relaxed">
              <p>
                <span className="font-semibold text-zinc-950">Hot Take #1:</span> To be filled by me
                (tell me in Community if you agree or disagree).
              </p>
              <p>
                <span className="font-semibold text-zinc-950">Hot Take #2:</span> To be filled by me.
              </p>
            </div>
          </div>
        </div>

        {/* Watch This If You Liked */}
        <div className="mt-10">
          <div className="flex items-baseline justify-between gap-2 mb-4">
            <h3 className="text-xl font-bold text-zinc-950">Watch This If You Liked</h3>
            <span className="font-data text-xs text-zinc-500">To be filled by me</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WATCH_IF_YOU_LIKED.map((pair) => (
              <div key={pair.id} className="surface-card rounded-2xl p-5 hover:border-rose-200">
                <p className="font-data text-xs font-semibold text-rose-600">Pair {pair.index}</p>
                <h4 className="text-sm font-bold text-zinc-950 mt-1.5">{pair.prompt}</h4>
                <p className="text-xs text-zinc-600 mt-1.5">
                  <span className="font-semibold text-zinc-800">Reason:</span> {pair.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal on Poster Click */}
      <AnimatePresence>
        {selectedAnime && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAnime(null)}
            className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 480, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-zinc-200 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl grid grid-cols-1 sm:grid-cols-12"
            >
              <div className="sm:col-span-5 bg-zinc-100 aspect-[3/4] sm:aspect-auto">
                <img
                  src={selectedAnime.posterUrl}
                  alt={selectedAnime.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="sm:col-span-7 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-data text-xs font-semibold text-rose-600">
                      RANK #{String(selectedAnime.rank).padStart(2, '0')} · {selectedAnime.year}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedAnime(null)}
                      aria-label="Close modal"
                      className="w-8 h-8 rounded-full border border-zinc-200 grid place-items-center text-zinc-600 hover:text-zinc-950 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-2xl font-extrabold text-zinc-950 mt-2">
                    {selectedAnime.title}
                  </h3>
                  <p className="text-xs font-medium text-zinc-500 mt-1">
                    {selectedAnime.genreLabel} · Rating: {selectedAnime.rating}
                  </p>
                  <p className="text-sm text-zinc-600 mt-4 leading-relaxed">
                    <span className="font-semibold text-zinc-900">Why I Love This:</span>{' '}
                    {selectedAnime.why}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAnime(null);
                      onOpenAdminAnime();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Edit in Admin Panel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAnime(null)}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-950 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
