import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Play, SlidersHorizontal, Youtube, RotateCcw } from 'lucide-react';
import { Tilt3DCard } from './Tilt3DCard';
import { formatTagLabel, parseYouTubeUrl, type WeeklyMustItem } from '../utils/youtube';

interface WeeklyMustSectionProps {
  currentMust: WeeklyMustItem | null;
  archiveMusts: WeeklyMustItem[];
  loading: boolean;
  onBackHome: () => void;
  onOpenAdminWeekly: () => void;
}

const TAG_PILL_CLASSES: Record<string, string> = {
  ANIME: 'bg-rose-50 text-rose-700 border-rose-200',
  RAP: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CAR: 'bg-blue-50 text-blue-700 border-blue-200',
  TRAVEL: 'bg-cyan-50 text-cyan-700 border-cyan-200',
};

export function WeeklyMustSection({
  currentMust,
  archiveMusts,
  loading,
  onBackHome,
  onOpenAdminWeekly,
}: WeeklyMustSectionProps) {
  const [selectedArchiveId, setSelectedArchiveId] = useState<number | null>(null);
  const playerTopRef = useRef<HTMLDivElement>(null);

  // If the selected archive item was promoted to Current or deleted, reset selection
  useEffect(() => {
    if (selectedArchiveId !== null) {
      const stillInArchive = archiveMusts.some((item) => item.id === selectedArchiveId);
      if (!stillInArchive) {
        setSelectedArchiveId(null);
      }
    }
  }, [archiveMusts, selectedArchiveId]);

  const activeArchiveItem =
    selectedArchiveId !== null
      ? archiveMusts.find((item) => item.id === selectedArchiveId) ?? null
      : null;

  const displayedMust = activeArchiveItem ?? currentMust;
  const isViewingArchive = Boolean(activeArchiveItem);
  const hasRealVideo = Boolean(displayedMust?.youtubeVideoId?.trim());
  const parsed = displayedMust?.youtubeUrl ? parseYouTubeUrl(displayedMust.youtubeUrl) : null;
  const embedSrc = displayedMust?.youtubeVideoId
    ? `https://www.youtube.com/embed/${displayedMust.youtubeVideoId}`
    : parsed?.embedUrl || '';

  const handleSelectArchive = (id: number) => {
    setSelectedArchiveId(id);
    playerTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="weekly-must"
      className="studio-wash-hero min-h-[75vh] py-14 md:py-20"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Top Action Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-full text-xs font-semibold text-zinc-800 bg-white/85 border border-zinc-200 shadow-xs hover:border-indigo-300 hover:bg-indigo-50/40 cursor-pointer whitespace-nowrap shrink-0 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <button
            type="button"
            onClick={onOpenAdminWeekly}
            className="inline-flex items-center gap-2 min-h-[40px] px-5 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 shadow-sm cursor-pointer whitespace-nowrap shrink-0 transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manage Weekly MUST</span>
          </button>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className="max-w-3xl mb-10"
        >
          <p className="font-data text-xs font-semibold uppercase tracking-wider text-violet-600 mb-3">
            Weekly MUST · Curated Video Drop
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-zinc-950 tracking-[-0.035em] mb-4">
            Weekly{' '}
            <span className="relative inline-block">
              MUST
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 bottom-1 h-2 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full"
              />
            </span>
          </h1>
          <p className="text-base sm:text-xl text-zinc-600 leading-relaxed">
            The one video you HAVE to watch this week.
          </p>
        </motion.div>

        {/* CURRENT MUST — BIG FEATURED CARD */}
        <div ref={playerTopRef} className="scroll-mt-24">
          {loading ? (
            <div className="surface-card rounded-3xl p-8 md:p-10 bg-white/80">
              <div className="aspect-video w-full rounded-2xl bg-zinc-100" />
              <div className="h-6 w-64 bg-zinc-100 rounded mt-6" />
              <div className="h-4 w-96 bg-zinc-100 rounded mt-3" />
            </div>
          ) : !displayedMust || !hasRealVideo ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="surface-card rounded-3xl p-8 md:p-12 bg-white/90 shadow-[0_24px_60px_-24px_rgba(124,58,237,0.18)]"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 aspect-video rounded-2xl border border-zinc-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white grid place-items-center shadow-md mb-4">
                    <Youtube className="w-7 h-7" />
                  </div>
                  <p className="text-lg font-bold text-zinc-950">
                    To be filled — Weekly MUST coming soon
                  </p>
                  <p className="text-sm text-zinc-500 mt-1.5 max-w-md">
                    No video link has been pinned yet. Paste a YouTube link inside the Admin Panel and it will appear right here.
                  </p>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-data text-xs font-semibold text-violet-700">
                      {displayedMust?.weekLabel || 'Week 48 — 2026'}
                    </span>
                    <span className="text-zinc-300" aria-hidden="true">·</span>
                    <span
                      className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border ${
                        TAG_PILL_CLASSES[displayedMust?.tag || 'ANIME'] ||
                        'bg-violet-50 text-violet-700 border-violet-200'
                      }`}
                    >
                      {formatTagLabel(displayedMust?.tag || 'ANIME')}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
                    To be filled — Weekly MUST coming soon
                  </h2>

                  <p className="text-sm text-zinc-600 leading-relaxed">
                    <span className="font-semibold text-zinc-900">Why this one this week:</span>{' '}
                    {displayedMust?.whyThisWeek ||
                      'To be filled by me — my own words on why this is the one video you have to watch this week.'}
                  </p>

                  <button
                    type="button"
                    onClick={onOpenAdminWeekly}
                    className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-zinc-950 hover:bg-violet-600 cursor-pointer transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Set This Week’s Video in Admin</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.article
              key={displayedMust.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="surface-card rounded-3xl overflow-hidden bg-white/95 shadow-[0_24px_64px_-24px_rgba(124,58,237,0.2),0_12px_32px_-16px_rgba(6,182,212,0.16)]"
            >
              {/* Status Strip */}
              <div className="px-6 py-4 border-b border-zinc-200/80 bg-gradient-to-r from-violet-50/70 via-white to-cyan-50/70 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-data text-xs font-bold uppercase tracking-wider text-violet-700">
                    {isViewingArchive ? 'Archive Replay' : 'Current Weekly MUST'}
                  </span>
                  <span className="text-zinc-300" aria-hidden="true">·</span>
                  <span className="font-data text-xs font-semibold text-zinc-700">
                    {displayedMust.weekLabel}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      TAG_PILL_CLASSES[displayedMust.tag] ||
                      'bg-violet-50 text-violet-700 border-violet-200'
                    }`}
                  >
                    {formatTagLabel(displayedMust.tag)}
                  </span>

                  {displayedMust.moodTag && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                      Mood: {displayedMust.moodTag}
                    </span>
                  )}

                  {isViewingArchive && (
                    <button
                      type="button"
                      onClick={() => setSelectedArchiveId(null)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Return to Current MUST</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 16:9 Official YouTube Iframe */}
              <div className="p-5 sm:p-8">
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-950 shadow-sm">
                  <iframe
                    title={`Weekly MUST: ${displayedMust.title}`}
                    src={embedSrc}
                    className="w-full h-full border-0 block"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>

                {/* Video Meta & Baboucarr's Personal Note */}
                <div className="mt-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-5">
                    <p className="font-data text-xs font-semibold text-cyan-700 uppercase">
                      Creator · {displayedMust.creator}
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1.5 leading-tight">
                      {displayedMust.title}
                    </h2>
                  </div>

                  <div className="lg:col-span-7 rounded-2xl bg-slate-50/90 border border-zinc-200/80 p-5 sm:p-6">
                    <p className="font-data text-xs font-semibold text-violet-700 uppercase mb-2">
                      Why this one this week
                    </p>
                    <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">
                      {displayedMust.whyThisWeek || 'To be filled by me.'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>
          )}
        </div>

        {/* ARCHIVE SECTION BELOW */}
        <div className="mt-16 pt-12 border-t border-zinc-200">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-7">
            <div>
              <p className="font-data text-xs font-semibold uppercase tracking-wider text-cyan-700 mb-1.5">
                Archive · One Per Week
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
                Past Weekly MUSTs
              </h2>
            </div>
            <span className="font-data text-xs text-zinc-500 tabular-nums">
              {archiveMusts.length} {archiveMusts.length === 1 ? 'archived pick' : 'archived picks'}
            </span>
          </div>

          {archiveMusts.length === 0 ? (
            <div className="surface-card rounded-2xl p-7 text-sm text-zinc-600">
              No archived Weekly MUSTs yet — whenever you set a new Current MUST in the Admin Panel, the previous one moves here automatically.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {archiveMusts.map((item) => {
                const isSelected = selectedArchiveId === item.id;
                const thumbUrl = item.youtubeVideoId
                  ? `https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`
                  : null;

                return (
                  <Tilt3DCard
                    key={item.id}
                    maxTilt={6}
                    sheenColor="rgba(124, 58, 237, 0.14)"
                    className="rounded-2xl"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectArchive(item.id)}
                      className={`group text-left w-full h-full surface-card rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all ${
                        isSelected
                          ? 'ring-2 ring-violet-600 border-violet-300'
                          : 'hover:border-violet-300'
                      }`}
                    >
                      <div className="relative aspect-video w-full bg-zinc-100 overflow-hidden">
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={`${item.title} thumbnail`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-violet-50 to-cyan-50 flex items-center justify-center">
                            <Youtube className="w-8 h-8 text-violet-500" />
                          </div>
                        )}
                        <span className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-zinc-950/80 text-white grid place-items-center shadow-sm group-hover:bg-violet-600 transition-colors">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </span>
                        <span
                          className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-xs ${
                            TAG_PILL_CLASSES[item.tag] || 'bg-white text-zinc-900 border-zinc-200'
                          }`}
                        >
                          {formatTagLabel(item.tag)}
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                        <div>
                          <p className="font-data text-[11px] font-semibold text-violet-600">
                            {item.weekLabel}
                          </p>
                          <h3 className="text-sm font-bold text-zinc-950 mt-1 line-clamp-2">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">
                          {item.creator}
                        </p>
                      </div>
                    </button>
                  </Tilt3DCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
