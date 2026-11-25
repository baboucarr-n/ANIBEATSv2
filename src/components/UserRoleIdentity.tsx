import { Award, Flame, MessageSquare, Sparkles } from 'lucide-react';
import type { RewardBadgeId, RewardUserProfile } from '../data/animeUniverseData';
import {
  getEffectiveBadges,
  getRewardLevelInfo,
  REWARD_BADGE_CATALOG,
} from '../utils/rewardSystem';

interface UserRoleIdentityProps {
  voterId?: string;
  displayName?: string;
  rewardProfiles?: Record<string, RewardUserProfile>;
  maxCommunityVotes?: number;
  showXpBar?: boolean;
  showBadges?: boolean;
  compact?: boolean;
}

const BADGE_LABEL_MAP: Record<RewardBadgeId, string> = REWARD_BADGE_CATALOG.reduce(
  (acc, item) => {
    acc[item.id] = item.label;
    return acc;
  },
  {} as Record<RewardBadgeId, string>
);

function BadgeGlyph({ id }: { id: RewardBadgeId }) {
  switch (id) {
    case 'first_chat':
      return <MessageSquare className="w-2.5 h-2.5" />;
    case 'first_suggest':
      return <Sparkles className="w-2.5 h-2.5" />;
    case 'seven_day_streak':
      return <Flame className="w-2.5 h-2.5" />;
    case 'top_voter':
      return <Award className="w-2.5 h-2.5" />;
  }
}

export function UserRoleIdentity({
  voterId,
  displayName,
  rewardProfiles,
  maxCommunityVotes = 0,
  showXpBar = true,
  showBadges = true,
  compact = true,
}: UserRoleIdentityProps) {
  const profile = voterId && rewardProfiles ? rewardProfiles[voterId] : undefined;
  const totalXp = profile?.totalXp ?? 0;
  const level = getRewardLevelInfo(totalXp);
  const resolvedName =
    displayName?.trim() || profile?.displayName?.trim() || 'Anonymous';
  const badges = profile
    ? getEffectiveBadges(profile, maxCommunityVotes)
    : [];

  return (
    <div className="inline-flex flex-col items-start min-w-0">
      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
        {/* Discord-style role color dot + colored username */}
        <span className="inline-flex items-center gap-1.5 min-w-0">
          <span
            aria-hidden="true"
            className={`w-2 h-2 rounded-full shrink-0 ${level.dotClass}`}
          />
          <span
            className={`font-bold truncate ${
              compact ? 'text-xs' : 'text-base sm:text-lg'
            } ${level.nameColorClass}`}
          >
            {resolvedName}
          </span>
        </span>

        {/* Level Role Pill */}
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full border font-data font-bold uppercase tracking-wider leading-none shrink-0 ${
            compact ? 'text-[9.5px]' : 'text-[10.5px]'
          } ${level.pillClass}`}
        >
          {level.label}
        </span>

        {/* Earned Badges (inline compact chips or icons) */}
        {showBadges && badges.length > 0 && (
          <div className="inline-flex items-center gap-1 shrink-0">
            {badges.map((badgeId) => (
              <span
                key={badgeId}
                title={BADGE_LABEL_MAP[badgeId]}
                aria-label={BADGE_LABEL_MAP[badgeId]}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white border border-[#DDE2EA] text-[#121417] text-[9.5px] font-semibold leading-none"
              >
                <BadgeGlyph id={badgeId} />
                {!compact && <span>{BADGE_LABEL_MAP[badgeId]}</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Inline XP Bar on Name */}
      {showXpBar && (
        <div
          className={`flex items-center gap-1.5 mt-1 ${
            compact ? 'w-32 sm:w-36' : 'w-full max-w-xs'
          }`}
          title={
            level.nextMinXp !== null
              ? `${totalXp} XP · ${level.xpNeededForNext} XP to ${level.progressPct}%`
              : `${totalXp} XP · Max Level`
          }
        >
          <div className="flex-1 h-[4px] rounded-full bg-[#E5E9F0] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${level.barFillClass}`}
              style={{ width: `${Math.max(totalXp > 0 ? 6 : 0, level.progressPct)}%` }}
            />
          </div>
          <span className="font-data text-[10px] font-semibold text-[#6B7280] tabular-nums shrink-0">
            {totalXp} XP
          </span>
        </div>
      )}
    </div>
  );
}
