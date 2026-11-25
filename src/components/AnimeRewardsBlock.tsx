import { useMemo } from 'react';
import {
  Award,
  Check,
  Crown,
  Flame,
  MessageSquare,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react';
import type {
  AnimeUniverseState,
  RewardBadgeId,
} from '../data/animeUniverseData';
import {
  computeWeeklyXpLeaderboard,
  createEmptyRewardProfile,
  getEffectiveBadges,
  getMaxCommunityVoteCount,
  getRewardLevelInfo,
  getWeeklyXp,
  REWARD_BADGE_CATALOG,
  REWARD_LEVELS,
  REWARD_XP_VALUES,
} from '../utils/rewardSystem';
import { UserRoleIdentity } from './UserRoleIdentity';

interface AnimeRewardsBlockProps {
  state: AnimeUniverseState;
  voterId: string;
  voterName: string;
  onVoterNameChange: (name: string) => void;
  onSaveProfileName: (name: string) => Promise<void>;
}

function BadgeCardIcon({
  id,
  unlocked,
}: {
  id: RewardBadgeId;
  unlocked: boolean;
}) {
  const cls = `w-4 h-4 ${unlocked ? 'text-[#121417]' : 'text-[#9CA3AF]'}`;
  switch (id) {
    case 'first_chat':
      return <MessageSquare className={cls} />;
    case 'first_suggest':
      return <Sparkles className={cls} />;
    case 'seven_day_streak':
      return <Flame className={cls} />;
    case 'top_voter':
      return <Award className={cls} />;
  }
}

export function AnimeRewardsBlock({
  state,
  voterId,
  voterName,
  onVoterNameChange,
  onSaveProfileName,
}: AnimeRewardsBlockProps) {
  const profilesMap = state.rewardProfiles ?? {};
  const maxCommunityVotes = useMemo(
    () => getMaxCommunityVoteCount(profilesMap),
    [profilesMap]
  );

  const myProfile = useMemo(
    () =>
      profilesMap[voterId] ??
      createEmptyRewardProfile(voterId, voterName.trim() || undefined),
    [profilesMap, voterId, voterName]
  );

  const myLevel = useMemo(
    () => getRewardLevelInfo(myProfile.totalXp),
    [myProfile.totalXp]
  );

  const myWeeklyXp = useMemo(() => getWeeklyXp(myProfile), [myProfile]);

  const myBadges = useMemo(
    () => new Set(getEffectiveBadges(myProfile, maxCommunityVotes)),
    [myProfile, maxCommunityVotes]
  );

  const leaderboard = useMemo(
    () => computeWeeklyXpLeaderboard(state),
    [state]
  );

  return (
    <div id="anime-rewards" className="mt-20 pt-14 border-t border-[#DDE2EA]">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B7280]">
            XP · Discord Role Colors · Daily Streaks · Badges
          </p>
          <h3 className="mt-1 inline-block text-2xl sm:text-3xl font-bold tracking-tight text-[#121417] border-b border-[#A8E84A] pb-1">
            Anime Rewards
          </h3>
        </div>

        {/* XP Rules Summary */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-data font-semibold text-[#121417]">
          <span className="px-2.5 py-1 rounded-full bg-white/85 border border-[#D5DBE4]">
            Chat +{REWARD_XP_VALUES.chat}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/85 border border-[#D5DBE4]">
            Comment +{REWARD_XP_VALUES.comment}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/85 border border-[#D5DBE4]">
            Suggest +{REWARD_XP_VALUES.suggest}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/85 border border-[#D5DBE4]">
            Vote +{REWARD_XP_VALUES.vote}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#121417] text-white border border-[#A8E84A]">
            2-Day Streak +{REWARD_XP_VALUES.streakBonus}
          </span>
        </div>
      </div>

      {/* Main Split: Left Profile/Levels/Badges, Right Top 10 Weekly Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: YOUR REWARD PROFILE */}
        <div className="lg:col-span-5 rounded-[16px] bg-white/88 backdrop-blur-sm border border-[#DDE2EA] p-5 sm:p-6 space-y-5">
          {/* Identity & Discord Role Color */}
          <div className="flex flex-col gap-3 pb-4 border-b border-[#E5E9F0]">
            <div className="flex items-start justify-between gap-3">
              <UserRoleIdentity
                voterId={voterId}
                displayName={voterName}
                rewardProfiles={profilesMap}
                maxCommunityVotes={maxCommunityVotes}
                showXpBar
                showBadges
                compact={false}
              />

              <div className="text-right shrink-0">
                <p className="font-data text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                  This Week
                </p>
                <p className="font-data text-base font-bold text-[#121417] tabular-nums">
                  +{myWeeklyXp} XP
                </p>
              </div>
            </div>

            {myLevel.nextMinXp !== null ? (
              <p className="text-[11px] font-medium text-[#4B5563]">
                <span className="font-data font-bold text-[#121417] tabular-nums">
                  {myLevel.xpNeededForNext} XP
                </span>{' '}
                to unlock next role tier ({myLevel.nextMinXp} XP)
              </p>
            ) : (
              <p className="text-[11px] font-semibold text-[#121417]">
                Max rank achieved: <span className="text-[#BE185D]">ANIBEATS OG</span>
              </p>
            )}

            {/* Editable Name Field */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F6F7F9] border border-[#D5DBE4]">
                <User className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                <input
                  type="text"
                  maxLength={32}
                  value={voterName}
                  onChange={(e) => onVoterNameChange(e.target.value)}
                  onBlur={() => void onSaveProfileName(voterName)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  placeholder="Set display name for leaderboard"
                  aria-label="Your display name for Anime Rewards leaderboard"
                  className="w-full bg-transparent text-xs font-medium text-[#121417] placeholder:text-[#9CA3AF] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => void onSaveProfileName(voterName)}
                className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-[#121417] text-white border border-[#A8E84A] hover:opacity-90 cursor-pointer shrink-0"
              >
                Save Name
              </button>
            </div>
          </div>

          {/* Daily Streak + Activity Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#F6F7F9] border border-[#E5E9F0]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                Streak
              </p>
              <p className="mt-1 inline-flex items-center gap-1 font-data text-sm font-bold text-[#121417] tabular-nums">
                <Flame
                  className={`w-3.5 h-3.5 ${
                    myProfile.currentStreak >= 2 ? 'text-[#EA843D]' : 'text-[#9CA3AF]'
                  }`}
                />
                <span>{myProfile.currentStreak}d</span>
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F6F7F9] border border-[#E5E9F0]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                Chats
              </p>
              <p className="mt-1 font-data text-sm font-bold text-[#121417] tabular-nums">
                {myProfile.chatCount}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F6F7F9] border border-[#E5E9F0]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                Comments
              </p>
              <p className="mt-1 font-data text-sm font-bold text-[#121417] tabular-nums">
                {myProfile.commentCount}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F6F7F9] border border-[#E5E9F0]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                Votes
              </p>
              <p className="mt-1 font-data text-sm font-bold text-[#121417] tabular-nums">
                {myProfile.voteCount}
              </p>
            </div>
          </div>

          {/* Discord Role Levels Ladder */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
              Discord Role Tiers
            </p>
            <div className="flex flex-wrap gap-1.5">
              {REWARD_LEVELS.map((tier) => {
                const isCurrent = tier.key === myLevel.key;
                return (
                  <span
                    key={tier.key}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10.5px] font-semibold ${
                      isCurrent
                        ? `${tier.pillClass} ring-1 ring-[#A8E84A]`
                        : 'bg-[#F6F7F9] border-[#E5E9F0] text-[#4B5563]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${tier.dotClass}`} />
                    <span>{tier.label}</span>
                    <span className="font-data text-[9.5px] opacity-75">
                      {tier.minXp}+
                    </span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* 4 Community Badges */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                Badges
              </p>
              <span className="font-data text-[11px] font-semibold text-[#121417] tabular-nums">
                {myBadges.size} / {REWARD_BADGE_CATALOG.length} unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {REWARD_BADGE_CATALOG.map((badge) => {
                const unlocked = myBadges.has(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-xl border transition-colors ${
                      unlocked
                        ? 'bg-white border-[#A8E84A]'
                        : 'bg-[#F6F7F9]/80 border-[#E5E9F0] opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1.5 min-w-0">
                        <BadgeCardIcon id={badge.id} unlocked={unlocked} />
                        <span className="text-xs font-bold text-[#121417] truncate">
                          {badge.label}
                        </span>
                      </div>
                      {unlocked && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#A8E84A] text-[#121417] shrink-0">
                          <Check className="w-2.5 h-2.5" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-[#4B5563] leading-snug">
                      {badge.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TOP 10 USERS BY XP THIS WEEK */}
        <div className="lg:col-span-7 rounded-[16px] bg-white/88 backdrop-blur-sm border border-[#DDE2EA] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E5E9F0] bg-[#F6F7F9]/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#121417]" />
              <h4 className="text-sm font-bold text-[#121417]">
                Weekly XP Leaderboard
              </h4>
            </div>
            <span className="font-data text-[11px] font-semibold text-[#6B7280]">
              Top 10 users by XP this week
            </span>
          </div>

          {leaderboard.length === 0 ? (
            <div className="py-14 px-6 text-center">
              <Trophy className="w-8 h-8 mx-auto text-[#9CA3AF]" />
              <p className="mt-2.5 text-sm font-bold text-[#121417]">
                No weekly XP logged yet
              </p>
              <p className="mt-1 text-xs text-[#4B5563] max-w-sm mx-auto">
                Chat (+5 XP), comment on any anime card (+10 XP), suggest an anime (+20 XP), or vote (+2 XP) to take the #01 spot this week.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E9F0]">
              {leaderboard.map((row) => {
                const isTop = row.rank === 1;
                const isMe = row.profile.voterId === voterId;

                return (
                  <div
                    key={row.profile.voterId}
                    className={`px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 ${
                      isTop
                        ? 'bg-[#FBF9F6]'
                        : isMe
                          ? 'bg-[#F6F7F9]'
                          : 'bg-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 shrink-0">
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

                      <div className="min-w-0">
                        <UserRoleIdentity
                          voterId={row.profile.voterId}
                          displayName={row.profile.displayName}
                          rewardProfiles={profilesMap}
                          maxCommunityVotes={maxCommunityVotes}
                          showXpBar
                          showBadges
                          compact
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {row.profile.currentStreak >= 2 && (
                        <span
                          title={`${row.profile.currentStreak}-day chat streak`}
                          className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#D5DBE4] text-[10.5px] font-data font-bold text-[#121417] tabular-nums"
                        >
                          <Flame className="w-3 h-3 text-[#EA843D]" />
                          <span>{row.profile.currentStreak}d</span>
                        </span>
                      )}

                      <div className="text-right">
                        <p className="font-data text-xs sm:text-sm font-bold text-[#121417] tabular-nums">
                          +{row.weeklyXp} XP
                        </p>
                        <p className="font-data text-[10px] text-[#6B7280] tabular-nums">
                          this week
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
