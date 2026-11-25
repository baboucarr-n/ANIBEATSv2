import type {
  AnimeUniverseState,
  RewardBadgeId,
  RewardUserProfile,
} from '../data/animeUniverseData';

export type RewardLevelKey =
  | 'newcomer'
  | 'fan'
  | 'superfan'
  | 'legend'
  | 'anibeats_og';

export interface RewardLevelInfo {
  key: RewardLevelKey;
  label: string;
  minXp: number;
  nextMinXp: number | null;
  progressPct: number;
  xpIntoLevel: number;
  xpNeededForNext: number;
  // Discord-vibe role classes (high contrast on light titanium surfaces)
  nameColorClass: string;
  pillClass: string;
  barFillClass: string;
  dotClass: string;
}

export interface RewardBadgeMeta {
  id: RewardBadgeId;
  label: string;
  description: string;
}

export const DAILY_QUEST_CHAT_TARGET = 2;
export const DAILY_QUEST_STICKER_TARGET = 5;
export const DAILY_QUEST_VOTE_TARGET = 1;

export const REWARD_XP_VALUES = {
  chat: 5,
  comment: 10,
  suggest: 20,
  vote: 2,
  streakBonus: 10,
  dailyQuestChat: 50,
  dailyQuestSticker: 30,
  dailyQuestVote: 20,
} as const;

export const REWARD_LEVELS: {
  key: RewardLevelKey;
  label: string;
  minXp: number;
  nameColorClass: string;
  pillClass: string;
  barFillClass: string;
  dotClass: string;
}[] = [
  {
    key: 'newcomer',
    label: 'Newcomer',
    minXp: 0,
    nameColorClass: 'text-[#475569]',
    pillClass: 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]',
    barFillClass: 'bg-[#64748B]',
    dotClass: 'bg-[#64748B]',
  },
  {
    key: 'fan',
    label: 'Fan',
    minXp: 50,
    nameColorClass: 'text-[#059669]',
    pillClass: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    barFillClass: 'bg-[#10B981]',
    dotClass: 'bg-[#10B981]',
  },
  {
    key: 'superfan',
    label: 'Superfan',
    minXp: 150,
    nameColorClass: 'text-[#4F46E5]',
    pillClass: 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]',
    barFillClass: 'bg-[#5865F2]',
    dotClass: 'bg-[#5865F2]',
  },
  {
    key: 'legend',
    label: 'Legend',
    minXp: 350,
    nameColorClass: 'text-[#C2410C]',
    pillClass: 'bg-[#FFF7ED] text-[#C2410C] border-[#FDBA74]',
    barFillClass: 'bg-[#EA843D]',
    dotClass: 'bg-[#EA843D]',
  },
  {
    key: 'anibeats_og',
    label: 'ANIBEATS OG',
    minXp: 700,
    nameColorClass: 'text-[#BE185D]',
    pillClass: 'bg-[#121417] text-[#A8E84A] border-[#A8E84A]',
    barFillClass: 'bg-[#A8E84A]',
    dotClass: 'bg-[#BE185D]',
  },
];

export const REWARD_BADGE_CATALOG: RewardBadgeMeta[] = [
  {
    id: 'first_chat',
    label: 'First Chat',
    description: 'Send your first message or sticker in Anime Chat',
  },
  {
    id: 'first_suggest',
    label: 'First Suggest',
    description: 'Suggest your first anime for Discovery',
  },
  {
    id: 'seven_day_streak',
    label: '7-Day Streak',
    description: 'Chat 7 consecutive days in a row',
  },
  {
    id: 'top_voter',
    label: 'Top Voter',
    description: 'Lead the community in anime card votes',
  },
];

export function getRewardLevelInfo(totalXp: number): RewardLevelInfo {
  const safeXp = Math.max(0, Math.floor(totalXp || 0));
  let idx = 0;
  for (let i = 0; i < REWARD_LEVELS.length; i++) {
    if (safeXp >= REWARD_LEVELS[i].minXp) {
      idx = i;
    }
  }
  const current = REWARD_LEVELS[idx];
  const next = idx + 1 < REWARD_LEVELS.length ? REWARD_LEVELS[idx + 1] : null;

  if (!next) {
    return {
      ...current,
      nextMinXp: null,
      progressPct: 100,
      xpIntoLevel: safeXp - current.minXp,
      xpNeededForNext: 0,
    };
  }

  const span = Math.max(1, next.minXp - current.minXp);
  const into = safeXp - current.minXp;
  const pct = Math.max(0, Math.min(100, Math.round((into / span) * 100)));

  return {
    ...current,
    nextMinXp: next.minXp,
    progressPct: pct,
    xpIntoLevel: into,
    xpNeededForNext: Math.max(0, next.minXp - safeXp),
  };
}

export function createEmptyRewardProfile(
  voterId: string,
  displayName?: string
): RewardUserProfile {
  return {
    voterId,
    displayName: displayName?.trim() || undefined,
    totalXp: 0,
    chatCount: 0,
    commentCount: 0,
    suggestCount: 0,
    voteCount: 0,
    votedAnimeIds: [],
    chatDays: [],
    currentStreak: 0,
    longestStreak: 0,
    badges: [],
    xpEvents: [],
    updatedAt: new Date().toISOString(),
  };
}

export function getUtcDayKey(nowMs: number = Date.now()): string {
  return new Date(nowMs).toISOString().slice(0, 10);
}

export function getLocalDayKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

export function normalizeDayKey(raw: unknown, nowMs: number = Date.now()): string {
  const str = String(raw ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  return getUtcDayKey(nowMs);
}

export interface SingleDailyQuestStatus {
  id: 'chat' | 'sticker' | 'vote';
  title: string;
  description: string;
  xpReward: number;
  current: number;
  target: number;
  pct: number;
  completed: boolean;
}

export interface DailyQuestsSummary {
  dayKey: string;
  quests: SingleDailyQuestStatus[];
  completedCount: number;
  totalCount: number;
}

export function getDailyQuestChatProgress(
  profile: RewardUserProfile | undefined,
  dayKey: string = getLocalDayKey()
): {
  dayKey: string;
  current: number;
  target: number;
  pct: number;
  completed: boolean;
} {
  const dq = profile?.dailyQuestProgress;
  const activeToday = dq && dq.dayKey === dayKey;
  const rawCount = activeToday ? Math.max(0, dq.chatCount || 0) : 0;
  const completed = Boolean(activeToday && (dq.completed || rawCount >= DAILY_QUEST_CHAT_TARGET));
  const current = Math.min(DAILY_QUEST_CHAT_TARGET, rawCount);
  const pct = Math.min(100, Math.round((current / DAILY_QUEST_CHAT_TARGET) * 100));
  return {
    dayKey,
    current,
    target: DAILY_QUEST_CHAT_TARGET,
    pct,
    completed,
  };
}

export function getDailyQuestsProgress(
  profile: RewardUserProfile | undefined,
  dayKey: string = getLocalDayKey()
): DailyQuestsSummary {
  const dq = profile?.dailyQuestProgress;
  const activeToday = Boolean(dq && dq.dayKey === dayKey);

  const rawChat = activeToday ? Math.max(0, dq?.chatCount || 0) : 0;
  const chatDone = Boolean(activeToday && (dq?.completed || rawChat >= DAILY_QUEST_CHAT_TARGET));
  const chatCurrent = Math.min(DAILY_QUEST_CHAT_TARGET, rawChat);
  const chatPct = Math.min(100, Math.round((chatCurrent / DAILY_QUEST_CHAT_TARGET) * 100));

  const rawSticker = activeToday ? Math.max(0, dq?.stickerCount || 0) : 0;
  const stickerDone = Boolean(
    activeToday && (dq?.stickerCompleted || rawSticker >= DAILY_QUEST_STICKER_TARGET)
  );
  const stickerCurrent = Math.min(DAILY_QUEST_STICKER_TARGET, rawSticker);
  const stickerPct = Math.min(100, Math.round((stickerCurrent / DAILY_QUEST_STICKER_TARGET) * 100));

  const rawVote = activeToday ? Math.max(0, dq?.voteCount || 0) : 0;
  const voteDone = Boolean(
    activeToday && (dq?.voteCompleted || rawVote >= DAILY_QUEST_VOTE_TARGET)
  );
  const voteCurrent = Math.min(DAILY_QUEST_VOTE_TARGET, rawVote);
  const votePct = Math.min(100, Math.round((voteCurrent / DAILY_QUEST_VOTE_TARGET) * 100));

  const quests: SingleDailyQuestStatus[] = [
    {
      id: 'chat',
      title: 'Chat 2 times',
      description: 'Send 2 messages or stickers in Anime Chat today.',
      xpReward: REWARD_XP_VALUES.dailyQuestChat,
      current: chatCurrent,
      target: DAILY_QUEST_CHAT_TARGET,
      pct: chatPct,
      completed: chatDone,
    },
    {
      id: 'sticker',
      title: 'Send 5 stickers',
      description: 'Drop 5 stickers from the pack in Anime Chat today.',
      xpReward: REWARD_XP_VALUES.dailyQuestSticker,
      current: stickerCurrent,
      target: DAILY_QUEST_STICKER_TARGET,
      pct: stickerPct,
      completed: stickerDone,
    },
    {
      id: 'vote',
      title: 'Vote 1 Anime',
      description: 'Vote up or rate any anime card today.',
      xpReward: REWARD_XP_VALUES.dailyQuestVote,
      current: voteCurrent,
      target: DAILY_QUEST_VOTE_TARGET,
      pct: votePct,
      completed: voteDone,
    },
  ];

  const completedCount = quests.filter((q) => q.completed).length;

  return {
    dayKey,
    quests,
    completedCount,
    totalCount: quests.length,
  };
}

function previousDayKey(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}

export function calculateStreakEndingAt(days: string[], endDayKey: string): number {
  const daySet = new Set(days);
  if (!daySet.has(endDayKey)) return 0;
  let streak = 0;
  let cursor = endDayKey;
  while (daySet.has(cursor)) {
    streak += 1;
    cursor = previousDayKey(cursor);
  }
  return streak;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function getWeeklyXp(profile: RewardUserProfile, nowMs: number = Date.now()): number {
  const events = Array.isArray(profile.xpEvents) ? profile.xpEvents : [];
  let sum = 0;
  for (const ev of events) {
    const ts = Date.parse(ev.at);
    if (Number.isFinite(ts) && nowMs - ts <= WEEK_MS) {
      sum += ev.amount;
    }
  }
  return sum;
}

export function getMaxCommunityVoteCount(
  profiles: Record<string, RewardUserProfile> | undefined
): number {
  if (!profiles) return 0;
  let max = 0;
  for (const p of Object.values(profiles)) {
    if ((p.voteCount || 0) > max) max = p.voteCount;
  }
  return max;
}

export function getEffectiveBadges(
  profile: RewardUserProfile,
  maxCommunityVotes: number
): RewardBadgeId[] {
  const set = new Set<RewardBadgeId>(Array.isArray(profile.badges) ? profile.badges : []);
  if (profile.chatCount >= 1) set.add('first_chat');
  if (profile.suggestCount >= 1) set.add('first_suggest');
  if (profile.longestStreak >= 7 || profile.currentStreak >= 7) {
    set.add('seven_day_streak');
  }
  if (maxCommunityVotes > 0 && profile.voteCount >= maxCommunityVotes) {
    set.add('top_voter');
  }
  return Array.from(set);
}

export interface WeeklyXpLeaderboardRow {
  rank: number;
  profile: RewardUserProfile;
  weeklyXp: number;
  level: RewardLevelInfo;
  badges: RewardBadgeId[];
}

export function computeWeeklyXpLeaderboard(
  state: AnimeUniverseState,
  nowMs: number = Date.now()
): WeeklyXpLeaderboardRow[] {
  const profilesMap = state.rewardProfiles ?? {};
  const maxVotes = getMaxCommunityVoteCount(profilesMap);

  const rows = Object.values(profilesMap)
    .map((profile) => {
      const weeklyXp = getWeeklyXp(profile, nowMs);
      return {
        profile,
        weeklyXp,
        level: getRewardLevelInfo(profile.totalXp),
        badges: getEffectiveBadges(profile, maxVotes),
      };
    })
    .filter((entry) => entry.weeklyXp > 0 || entry.profile.totalXp > 0)
    .sort((a, b) => {
      if (b.weeklyXp !== a.weeklyXp) return b.weeklyXp - a.weeklyXp;
      if (b.profile.totalXp !== a.profile.totalXp) {
        return b.profile.totalXp - a.profile.totalXp;
      }
      if (b.profile.longestStreak !== a.profile.longestStreak) {
        return b.profile.longestStreak - a.profile.longestStreak;
      }
      return (a.profile.displayName || 'Anonymous').localeCompare(
        b.profile.displayName || 'Anonymous'
      );
    })
    .slice(0, 10);

  return rows.map((entry, idx) => ({
    rank: idx + 1,
    ...entry,
  }));
}
