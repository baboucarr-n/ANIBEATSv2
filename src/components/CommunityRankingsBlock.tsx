import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Crown,
  Minus,
  Plus,
  Sparkles,
  Star,
  User,
} from 'lucide-react';
import type { AnimeUniverseState, RankingPeriod } from '../data/animeUniverseData';
import {
  computePeriodRankings,
  RANKING_PERIODS,
  type AnimeVoteSummary,
} from '../utils/communityRankings';

interface CommunityRankingsBlockProps {
  state: AnimeUniverseState;
  voterName: string;
  onVoterNameChange: (name: string) => void;
  voteSummaries: Record<string, AnimeVoteSummary>;
  onVote: (animeId: string, next: { upvoted: boolean; stars: number }) => void;
  onOpenSuggest: () => void;
}

export function CommunityRankingsBlock({
  state,
  voterName,
  onVoterNameChange,
  voteSummaries,
  onVote,
  onOpenSuggest,
}: CommunityRankingsBlockProps) {
  const [activePeriod, setActivePeriod] = useState<RankingPeriod>('week');

  const rankings = useMemo(
    () => computePeriodRankings(state, activePeriod),
    [state, activePeriod]
  );

  const quickStartPicks = useMemo(() => {
    const topCol = [...state.collection]
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        title: item.title,
        posterUrl: item.posterUrl,
        tag: `Collection #${String(item.rank).padStart(2, '0')}`,
      }));
    const watchPick = state.watching.slice(0, 1).map((item) => ({
      id: item.id,
      title: item.title,
      posterUrl: item.posterUrl,
      tag: 'Watching',
    }));
    const discPick = state.discovery.slice(0, 1).map((item) => ({
      id: item.id,
      title: item.title,
      posterUrl: item.posterUrl,
      tag: 'Discovery',
    }));
    return [...topCol, ...watchPick, ...discPick];
  }, [state.collection, state.watching, state.discovery]);

  const activePeriodMeta =
    RANKING_PERIODS.find((p) => p.key === activePeriod) ?? RANKING_PERIODS[0];

  return (
    <div id="community-rankings" className="mt-20 pt-14 border-t border-[#DDE2EA]">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B7280]">
            Live Leaderboard · No Login Needed · 1 Vote Per Person
          </p>
          <h3 className="mt-1 inline-block text-2xl sm:text-3xl font-bold tracking-tight text-[#121417] border-b border-[#A8E84A] pb-1">
            Community Rankings
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 border border-[#D5DBE4]">
            <User className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
            <input
              type="text"
              maxLength={80}
              value={voterName}
              onChange={(e) => onVoterNameChange(e.target.value)}
              placeholder="Your name (optional)"
              aria-label="Optional display name for community voting"
              className="w-36 sm:w-44 bg-transparent text-xs font-medium text-[#121417] placeholder:text-[#9CA3AF] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={onOpenSuggest}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#121417] text-white border border-[#A8E84A] hover:opacity-90 cursor-pointer transition-opacity"
          >
            <Plus className="w-3.5 h-3.5 text-[#A8E84A]" />
            <span>Suggest an Anime</span>
          </button>
        </div>
      </div>

      {/* 4 Timeframe Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div
          role="tablist"
          aria-label="Community ranking timeframes"
          className="flex flex-wrap items-center gap-2"
        >
          {RANKING_PERIODS.map((period) => {
            const active = activePeriod === period.key;
            return (
              <button
                key={period.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActivePeriod(period.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                  active
                    ? 'bg-[#121417] text-white border border-[#A8E84A]'
                    : 'bg-white/80 border border-[#D5DBE4] text-[#121417] hover:border-[#A8E84A]'
                }`}
              >
                {period.label}
              </button>
            );
          })}
        </div>

        <span className="font-data text-[11px] font-semibold text-[#6B7280]">
          Top 10 · {activePeriodMeta.windowLabel}
        </span>
      </div>

      {/* Top 10 Board */}
      {rankings.length === 0 ? (
        <div className="rounded-[16px] bg-white/80 backdrop-blur-sm border border-[#DDE2EA] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E2E6ED]">
            <div>
              <h4 className="text-sm font-bold text-[#121417]">
                Be the first to shape {activePeriodMeta.label} Top 10
              </h4>
              <p className="text-xs text-[#4B5563] mt-0.5">
                Tap Vote Up or give 1–5 stars on any anime card below — or cast a quick vote right here.
              </p>
            </div>
            <span className="font-data text-[11px] font-semibold text-[#6B7280] shrink-0">
              0 votes yet
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickStartPicks.map((pick) => {
              const summary = voteSummaries[pick.id];
              const upvoted = summary?.userUpvoted ?? false;
              const userStars = summary?.userStars ?? 0;

              return (
                <div
                  key={pick.id}
                  className="p-3 rounded-xl bg-[#F6F7F9]/90 border border-[#DDE2EA] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={pick.posterUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-9 h-12 rounded-lg object-cover border border-[#D5DBE4] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#121417] truncate">
                        {pick.title}
                      </p>
                      <p className="text-[11px] text-[#6B7280] truncate">{pick.tag}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onVote(pick.id, {
                        upvoted: !upvoted,
                        stars: userStars || 5,
                      })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white border border-[#D5DBE4] text-[#121417] hover:bg-[#121417] hover:text-white hover:border-[#A8E84A] shrink-0 cursor-pointer transition-colors"
                  >
                    <ArrowUp className="w-3 h-3" />
                    <span>Vote</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-[16px] bg-white/85 backdrop-blur-sm border border-[#DDE2EA] divide-y divide-[#E5E9F0] overflow-hidden">
          {rankings.map((row) => {
            const isTop = row.rank === 1;
            const summary = voteSummaries[row.anime.id];
            const userUpvoted = summary?.userUpvoted ?? false;
            const userStars = summary?.userStars ?? 0;

            return (
              <div
                key={row.anime.id}
                className={`px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isTop ? 'bg-[#FBF9F6]' : 'hover:bg-[#F6F7F9]/70'
                }`}
              >
                {/* Left: Rank + Crown #1 + Poster + Title */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-16 shrink-0 flex items-center gap-1.5">
                    {isTop ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EA843D] text-[#121417] font-data text-[11px] font-bold">
                        <Crown className="w-3 h-3 fill-[#121417]" />
                        <span>#01</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#D5DBE4] bg-white text-[#121417] font-data text-[11px] font-bold tabular-nums">
                        #{String(row.rank).padStart(2, '0')}
                      </span>
                    )}
                  </div>

                  {/* Movement Indicator */}
                  <div className="w-14 shrink-0 flex items-center">
                    {row.movement === 'up' && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#121417] text-[#A8E84A] font-data text-[10.5px] font-bold tabular-nums">
                        <ArrowUp className="w-3 h-3" strokeWidth={2.5} />
                        <span>{row.delta}</span>
                      </span>
                    )}
                    {row.movement === 'down' && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#F1F3F7] border border-[#D5DBE4] text-[#4B5563] font-data text-[10.5px] font-bold tabular-nums">
                        <ArrowDown className="w-3 h-3 text-[#EA843D]" strokeWidth={2.5} />
                        <span>{row.delta}</span>
                      </span>
                    )}
                    {row.movement === 'new' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#A8E84A] bg-white text-[#121417] font-data text-[10px] font-bold uppercase tracking-wider">
                        <Sparkles className="w-2.5 h-2.5 text-[#121417]" />
                        <span>New</span>
                      </span>
                    )}
                    {row.movement === 'same' && (
                      <span
                        className="inline-flex items-center justify-center w-8 text-[#9CA3AF]"
                        aria-label="No rank change"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <img
                    src={row.anime.posterUrl}
                    alt={`${row.anime.title} poster`}
                    referrerPolicy="no-referrer"
                    className="w-10 h-14 rounded-lg object-cover border border-[#D5DBE4] shrink-0 bg-[#ECEEF2]"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#121417] truncate">
                        {row.anime.title}
                      </h4>
                      {isTop && (
                        <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full border border-[#A8E84A] bg-white text-[10px] font-bold uppercase tracking-wider text-[#121417]">
                          Top Pick
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#4B5563] truncate mt-0.5">
                      {row.anime.metaLabel}
                    </p>
                  </div>
                </div>

                {/* Right: Votes Count + Average Stars + Quick 1-Tap Vote */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pl-[76px] sm:pl-0 shrink-0">
                  <div className="flex items-center gap-3 text-xs tabular-nums">
                    <span className="font-data font-bold text-[#121417]">
                      {row.votesCount} {row.votesCount === 1 ? 'vote' : 'votes'}
                    </span>
                    {row.avgStars > 0 && (
                      <span className="inline-flex items-center gap-1 font-data font-semibold text-[#4B5563]">
                        <Star className="w-3.5 h-3.5 fill-[#EA843D] text-[#EA843D]" />
                        <span>{row.avgStars.toFixed(1)}</span>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onVote(row.anime.id, {
                        upvoted: !userUpvoted,
                        stars: userStars,
                      })
                    }
                    aria-pressed={userUpvoted}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                      userUpvoted
                        ? 'bg-[#121417] text-white border border-[#A8E84A]'
                        : 'bg-white border border-[#D5DBE4] text-[#121417] hover:border-[#A8E84A]'
                    }`}
                  >
                    <ArrowUp
                      className={`w-3 h-3 ${userUpvoted ? 'text-[#A8E84A]' : 'text-[#121417]'}`}
                      strokeWidth={2.5}
                    />
                    <span>{userUpvoted ? 'Voted' : 'Vote Up'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
