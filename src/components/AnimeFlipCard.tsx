import { useState } from 'react';
import type { CompletedAnimeItem } from '../data/animeUniverseData';
import type { AnimeVoteSummary } from '../utils/communityRankings';
import { AnimeVoteBar } from './AnimeVoteBar';

interface AnimeFlipCardProps {
  item: CompletedAnimeItem;
  isFeaturedCol?: boolean;
  voteSummary?: AnimeVoteSummary;
  commentCount?: number;
  onOpenComments?: () => void;
  onVote: (animeId: string, next: { upvoted: boolean; stars: number }) => void;
}

export function AnimeFlipCard({
  item,
  voteSummary,
  commentCount,
  onOpenComments,
  onVote,
}: AnimeFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);

  const rankLabel = String(item.rank).padStart(2, '0');
  const isRankOne = item.rank === 1;

  return (
    <article className="flex flex-col justify-start h-full bg-transparent">
      {/* Compact equal-size 2:3 poster card (max height 320px), 1px titanium hairline, 16px radius */}
      <div className="w-full max-w-[213px]">
        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          aria-pressed={isFlipped}
          aria-label={
            isFlipped
              ? `${item.title}, rank ${item.rank}. Showing life lesson. Activate to flip back to poster.`
              : `${item.title}, rank ${item.rank}. Activate to flip poster for life lesson.`
          }
          className="relative block w-full aspect-[2/3] max-h-[320px] rounded-[16px] text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#A8E84A]"
        >
          <div className="relative w-full h-full [perspective:1200px]">
            <div
              className="relative w-full h-full rounded-[16px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d]"
              style={{
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* FRONT: 2:3 cover poster, 1px cool titanium hairline, 16px radius */}
              <div className="absolute inset-0 overflow-hidden rounded-[16px] border border-[#D5DBE4] bg-[#ECEEF2] [backface-visibility:hidden] transition-colors hover:border-[#A8E84A]">
                {!imgError && item.posterUrl ? (
                  <img
                    src={item.posterUrl}
                    alt={`${item.title} anime poster`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#ECEEF2] px-4 text-center">
                    <span className="font-data text-xl font-semibold text-[#121417]">
                      {rankLabel}
                    </span>
                    <span className="mt-1 text-xs font-medium text-[#121417]">
                      {item.title}
                    </span>
                  </div>
                )}
              </div>

              {/* BACK: Crisp porcelain white surface with 1px hairline showing short Life Lesson */}
              <div
                className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[16px] border border-[#D5DBE4] bg-white p-4 [backface-visibility:hidden]"
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div className="flex items-center justify-between gap-2 text-xs text-[#121417]">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full font-data text-[11px] font-bold ${
                      isRankOne
                        ? 'bg-[#EA843D] text-[#121417]'
                        : 'border border-[#D5DBE4] bg-[#F1F3F7] text-[#121417]'
                    }`}
                  >
                    #{rankLabel}
                  </span>
                  <span className="font-medium text-[#4B5563] text-[11px]">{item.demographic}</span>
                </div>

                <div className="my-auto py-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                    Life Lesson
                  </p>
                  <blockquote className="mt-1.5 text-[13px] font-semibold leading-[1.42] text-[#121417]">
                    “{item.lifeLesson}”
                  </blockquote>
                </div>

                <div className="flex items-center justify-between gap-2 text-[10.5px] font-medium text-[#4B5563]">
                  <span className="truncate">{item.title}</span>
                  <span className="shrink-0 text-[#121417] font-semibold underline decoration-[#A8E84A] underline-offset-2">Flip back</span>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Text directly below poster — zero overlap, crisp Apple-grade ink hierarchy */}
      <div className="pt-3 flex flex-col flex-1 bg-transparent">
        <div className="flex items-center gap-2 text-[12px] leading-[1.35] text-[#121417] tabular-nums">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-data text-[11px] font-bold tracking-tight ${
              isRankOne
                ? 'bg-[#EA843D] text-[#121417]'
                : 'border border-[#D5DBE4] bg-white/85 text-[#121417]'
            }`}
          >
            #{rankLabel}
          </span>
          <span aria-hidden="true" className="text-[#9CA3AF]">
            ·
          </span>
          <span className="text-[#121417] font-semibold">{item.demographic}</span>
        </div>

        <p className="mt-1.5 text-[12px] leading-[1.4] text-[#4B5563] font-medium">
          {item.genres.join(' · ')}
        </p>

        <h3 className="mt-1.5 text-[14px] font-bold tracking-[-0.015em] text-[#121417] leading-snug">
          {item.title}
        </h3>

        <p className="mt-1 text-[12.5px] leading-[1.45] text-[#4B5563]">
          {item.frontNote}
        </p>

        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          className="mt-auto pt-2 self-start text-[11.5px] font-medium text-[#4B5563] hover:text-[#121417] underline decoration-[#A8E84A] underline-offset-2 cursor-pointer outline-none transition-colors"
        >
          {isFlipped ? 'Show poster' : 'Tap poster for life lesson'}
        </button>

        <AnimeVoteBar
          animeId={item.id}
          animeTitle={item.title}
          summary={voteSummary}
          commentCount={commentCount}
          onOpenComments={onOpenComments}
          onVote={onVote}
        />
      </div>
    </article>
  );
}
