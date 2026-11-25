import { useState } from 'react';
import { ArrowUp, MessageCircle, Star } from 'lucide-react';
import type { AnimeVoteSummary } from '../utils/communityRankings';

interface AnimeVoteBarProps {
  animeId: string;
  animeTitle: string;
  summary?: AnimeVoteSummary;
  commentCount?: number;
  onOpenComments?: () => void;
  onVote: (animeId: string, next: { upvoted: boolean; stars: number }) => void;
}

export function AnimeVoteBar({
  animeId,
  animeTitle,
  summary,
  commentCount = 0,
  onOpenComments,
  onVote,
}: AnimeVoteBarProps) {
  const [hoverStar, setHoverStar] = useState<number>(0);

  const votesCount = summary?.votesCount ?? 0;
  const avgStars = summary?.avgStars ?? 0;
  const userUpvoted = summary?.userUpvoted ?? false;
  const userStars = summary?.userStars ?? 0;
  const displayStars = hoverStar || userStars;

  return (
    <div
      className="mt-2.5 pt-2.5 border-t border-[#DDE2EA] flex flex-wrap items-center justify-between gap-1.5"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1.5">
        {/* 1-tap Vote Up button */}
        <button
          type="button"
          onClick={() =>
            onVote(animeId, {
              upvoted: !userUpvoted,
              stars: userStars,
            })
          }
          aria-pressed={userUpvoted}
          aria-label={
            userUpvoted
              ? `Remove vote up for ${animeTitle}`
              : `Vote up ${animeTitle}`
          }
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold tabular-nums cursor-pointer transition-colors ${
            userUpvoted
              ? 'bg-[#121417] text-white border border-[#A8E84A]'
              : 'bg-white/85 border border-[#D5DBE4] text-[#121417] hover:border-[#A8E84A]'
          }`}
        >
          <ArrowUp
            className={`w-3 h-3 ${userUpvoted ? 'text-[#A8E84A]' : 'text-[#121417]'}`}
            strokeWidth={2.5}
          />
          <span>{votesCount > 0 ? votesCount : 'Vote'}</span>
        </button>

        {/* Comments button (+10 XP) */}
        {onOpenComments && (
          <button
            type="button"
            onClick={onOpenComments}
            aria-label={`Comments for ${animeTitle} (${commentCount})`}
            title={`Comments (${commentCount}) · +10 XP`}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold tabular-nums bg-white/85 border border-[#D5DBE4] text-[#121417] hover:border-[#A8E84A] cursor-pointer transition-colors"
          >
            <MessageCircle className="w-3 h-3 text-[#4B5563]" />
            {commentCount > 0 && <span>{commentCount}</span>}
          </button>
        )}
      </div>

      {/* 1–5 Star rank selector */}
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHoverStar(0)}
        role="group"
        aria-label={`Rate ${animeTitle} from 1 to 5 stars`}
      >
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((starVal) => {
            const active = starVal <= displayStars;
            return (
              <button
                key={starVal}
                type="button"
                onMouseEnter={() => setHoverStar(starVal)}
                onClick={() =>
                  onVote(animeId, {
                    upvoted: userUpvoted,
                    stars: userStars === starVal ? 0 : starVal,
                  })
                }
                aria-label={`Rate ${animeTitle} ${starVal} out of 5 stars`}
                aria-pressed={userStars === starVal}
                className="p-0.5 cursor-pointer transition-transform hover:scale-110 outline-none focus-visible:ring-1 focus-visible:ring-[#A8E84A] rounded"
              >
                <Star
                  className={`w-3 h-3 transition-colors ${
                    active
                      ? 'fill-[#EA843D] text-[#EA843D]'
                      : 'text-[#B8C0CC] hover:text-[#121417]'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {avgStars > 0 && (
          <span className="font-data text-[10.5px] font-semibold text-[#4B5563] tabular-nums ml-0.5">
            {avgStars.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}
