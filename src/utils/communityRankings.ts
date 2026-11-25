import type {
  AnimeUniverseState,
  CommunityRankSnapshots,
  CommunityVoteRecord,
  RankingPeriod,
} from '../data/animeUniverseData';

export interface AnimeCatalogEntry {
  id: string;
  title: string;
  posterUrl: string;
  source: 'Collection' | 'Watching' | 'Discovery';
  metaLabel: string;
}

export interface AnimeVoteSummary {
  animeId: string;
  votesCount: number;
  upvotesCount: number;
  ratedCount: number;
  avgStars: number;
  userUpvoted: boolean;
  userStars: number;
}

export type RankMovement = 'up' | 'down' | 'new' | 'same';

export interface CommunityRankingRow {
  rank: number;
  anime: AnimeCatalogEntry;
  votesCount: number;
  upvotesCount: number;
  ratedCount: number;
  avgStars: number;
  movement: RankMovement;
  delta: number;
}

export const RANKING_PERIODS: { key: RankingPeriod; label: string; windowLabel: string }[] = [
  { key: 'week', label: 'This Week', windowLabel: 'Past 7 days' },
  { key: 'month', label: 'This Month', windowLabel: 'Past 30 days' },
  { key: 'year', label: 'This Year', windowLabel: 'Past 12 months' },
  { key: 'all_time', label: 'Greatest of All Time', windowLabel: 'All community votes' },
];

const PERIOD_WINDOW_MS: Record<Exclude<RankingPeriod, 'all_time'>, number> = {
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
};

export function createEmptyRankSnapshots(): CommunityRankSnapshots {
  return {
    week: {},
    month: {},
    year: {},
    all_time: {},
  };
}

export function buildAnimeCatalog(state: AnimeUniverseState): AnimeCatalogEntry[] {
  const collectionEntries: AnimeCatalogEntry[] = state.collection.map((item) => ({
    id: item.id,
    title: item.title,
    posterUrl: item.posterUrl,
    source: 'Collection',
    metaLabel: `Rank #${String(item.rank).padStart(2, '0')} · ${item.demographic}`,
  }));

  const watchingEntries: AnimeCatalogEntry[] = state.watching.map((item) => ({
    id: item.id,
    title: item.title,
    posterUrl: item.posterUrl,
    source: 'Watching',
    metaLabel: `Watching · Ep ${item.currentEp}/${item.totalEp}`,
  }));

  const discoveryEntries: AnimeCatalogEntry[] = state.discovery.map((item) => ({
    id: item.id,
    title: item.title,
    posterUrl: item.posterUrl,
    source: 'Discovery',
    metaLabel: `Discovery · ${item.category}`,
  }));

  return [...collectionEntries, ...watchingEntries, ...discoveryEntries];
}

export function filterVotesByPeriod(
  votes: CommunityVoteRecord[],
  period: RankingPeriod,
  nowMs: number = Date.now()
): CommunityVoteRecord[] {
  if (period === 'all_time') return votes;
  const maxAge = PERIOD_WINDOW_MS[period];
  return votes.filter((vote) => {
    const ts = Date.parse(vote.updatedAt);
    if (!Number.isFinite(ts)) return false;
    return nowMs - ts <= maxAge;
  });
}

export function getAnimeVoteSummaryMap(
  votes: CommunityVoteRecord[] | undefined,
  voterId: string
): Record<string, AnimeVoteSummary> {
  const safeVotes = Array.isArray(votes) ? votes : [];
  const grouped = new Map<
    string,
    {
      voters: Set<string>;
      upvotes: number;
      starSum: number;
      ratedCount: number;
      userUpvoted: boolean;
      userStars: number;
    }
  >();

  for (const vote of safeVotes) {
    if (!vote.upvoted && (!vote.stars || vote.stars <= 0)) continue;
    let bucket = grouped.get(vote.animeId);
    if (!bucket) {
      bucket = {
        voters: new Set<string>(),
        upvotes: 0,
        starSum: 0,
        ratedCount: 0,
        userUpvoted: false,
        userStars: 0,
      };
      grouped.set(vote.animeId, bucket);
    }
    bucket.voters.add(vote.voterId);
    if (vote.upvoted) bucket.upvotes += 1;
    if (vote.stars >= 1 && vote.stars <= 5) {
      bucket.starSum += vote.stars;
      bucket.ratedCount += 1;
    }
    if (vote.voterId === voterId) {
      bucket.userUpvoted = Boolean(vote.upvoted);
      bucket.userStars = vote.stars >= 1 && vote.stars <= 5 ? vote.stars : 0;
    }
  }

  const result: Record<string, AnimeVoteSummary> = {};
  for (const [animeId, b] of grouped.entries()) {
    result[animeId] = {
      animeId,
      votesCount: b.voters.size,
      upvotesCount: b.upvotes,
      ratedCount: b.ratedCount,
      avgStars: b.ratedCount > 0 ? Number((b.starSum / b.ratedCount).toFixed(1)) : 0,
      userUpvoted: b.userUpvoted,
      userStars: b.userStars,
    };
  }
  return result;
}

export function computePeriodRankings(
  state: AnimeUniverseState,
  period: RankingPeriod,
  nowMs: number = Date.now()
): CommunityRankingRow[] {
  const catalog = buildAnimeCatalog(state);
  const catalogMap = new Map(catalog.map((c) => [c.id, c]));
  const periodVotes = filterVotesByPeriod(
    Array.isArray(state.communityVotes) ? state.communityVotes : [],
    period,
    nowMs
  );

  const buckets = new Map<
    string,
    {
      voters: Set<string>;
      upvotes: number;
      starSum: number;
      ratedCount: number;
      latestTs: number;
    }
  >();

  for (const vote of periodVotes) {
    if (!catalogMap.has(vote.animeId)) continue;
    if (!vote.upvoted && (!vote.stars || vote.stars <= 0)) continue;
    let b = buckets.get(vote.animeId);
    if (!b) {
      b = { voters: new Set<string>(), upvotes: 0, starSum: 0, ratedCount: 0, latestTs: 0 };
      buckets.set(vote.animeId, b);
    }
    b.voters.add(vote.voterId);
    if (vote.upvoted) b.upvotes += 1;
    if (vote.stars >= 1 && vote.stars <= 5) {
      b.starSum += vote.stars;
      b.ratedCount += 1;
    }
    const ts = Date.parse(vote.updatedAt);
    if (Number.isFinite(ts) && ts > b.latestTs) b.latestTs = ts;
  }

  const scored = Array.from(buckets.entries())
    .map(([animeId, b]) => {
      const anime = catalogMap.get(animeId)!;
      const votesCount = b.voters.size;
      const avgStars = b.ratedCount > 0 ? Number((b.starSum / b.ratedCount).toFixed(1)) : 0;
      return {
        anime,
        votesCount,
        upvotesCount: b.upvotes,
        ratedCount: b.ratedCount,
        avgStars,
        latestTs: b.latestTs,
      };
    })
    .sort((a, b) => {
      if (b.votesCount !== a.votesCount) return b.votesCount - a.votesCount;
      if (b.avgStars !== a.avgStars) return b.avgStars - a.avgStars;
      if (b.upvotesCount !== a.upvotesCount) return b.upvotesCount - a.upvotesCount;
      if (b.latestTs !== a.latestTs) return b.latestTs - a.latestTs;
      return a.anime.title.localeCompare(b.anime.title);
    })
    .slice(0, 10);

  const prevSnapshot = state.communityRankSnapshots?.[period] ?? {};

  return scored.map((entry, idx) => {
    const rank = idx + 1;
    const prevRank = prevSnapshot[entry.anime.id];
    let movement: RankMovement = 'same';
    let delta = 0;

    if (typeof prevRank !== 'number') {
      movement = 'new';
    } else if (prevRank > rank) {
      movement = 'up';
      delta = prevRank - rank;
    } else if (prevRank < rank) {
      movement = 'down';
      delta = rank - prevRank;
    }

    return {
      rank,
      anime: entry.anime,
      votesCount: entry.votesCount,
      upvotesCount: entry.upvotesCount,
      ratedCount: entry.ratedCount,
      avgStars: entry.avgStars,
      movement,
      delta,
    };
  });
}

export function extractPeriodRankMap(
  state: AnimeUniverseState,
  period: RankingPeriod,
  nowMs: number = Date.now()
): Record<string, number> {
  const rows = computePeriodRankings(state, period, nowMs);
  const map: Record<string, number> = {};
  for (const row of rows) {
    map[row.anime.id] = row.rank;
  }
  return map;
}
