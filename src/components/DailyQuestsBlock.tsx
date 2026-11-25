import { ArrowRight, ArrowUp, Check, MessageSquare, Smile } from 'lucide-react';
import type { RewardUserProfile } from '../data/animeUniverseData';
import {
  getDailyQuestsProgress,
  type SingleDailyQuestStatus,
} from '../utils/rewardSystem';

interface DailyQuestsBlockProps {
  profile?: RewardUserProfile;
  onJumpToChat?: () => void;
  onJumpToRankings?: () => void;
}

function QuestIcon({ id, completed }: { id: SingleDailyQuestStatus['id']; completed: boolean }) {
  if (completed) {
    return <Check className="w-4 h-4" strokeWidth={2.5} />;
  }
  switch (id) {
    case 'chat':
      return <MessageSquare className="w-4 h-4" />;
    case 'sticker':
      return <Smile className="w-4 h-4" />;
    case 'vote':
      return <ArrowUp className="w-4 h-4" strokeWidth={2.5} />;
  }
}

export function DailyQuestsBlock({
  profile,
  onJumpToChat,
  onJumpToRankings,
}: DailyQuestsBlockProps) {
  const summary = getDailyQuestsProgress(profile);
  const allDone = summary.completedCount === summary.totalCount;

  return (
    <div id="daily-quests" className="mt-20 pt-14 border-t border-[#DDE2EA]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B7280]">
            3 Quests Per Day · Auto-Resets Each Day
          </p>
          <h3 className="mt-1 inline-block text-2xl sm:text-3xl font-bold tracking-tight text-[#121417] border-b border-[#A8E84A] pb-1">
            Daily Quests
          </h3>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1 rounded-full font-data text-xs font-bold tabular-nums border ${
            allDone
              ? 'bg-[#121417] text-[#A8E84A] border-[#A8E84A]'
              : 'bg-white/85 text-[#121417] border-[#D5DBE4]'
          }`}
        >
          {allDone && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
          <span>
            {summary.completedCount} / {summary.totalCount} {allDone ? 'All Done' : 'Completed'}
          </span>
        </span>
      </div>

      {/* 3 Daily Quest Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summary.quests.map((quest) => {
          const actionHandler =
            quest.id === 'vote' ? onJumpToRankings : onJumpToChat;
          const actionLabel = quest.id === 'vote' ? 'Vote Anime' : 'Go to Chat';
          const unitLabel =
            quest.id === 'chat'
              ? 'chats'
              : quest.id === 'sticker'
                ? 'stickers'
                : 'vote';

          return (
            <div
              key={quest.id}
              className="rounded-[16px] bg-white/88 backdrop-blur-sm border border-[#DDE2EA] p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                        quest.completed
                          ? 'bg-[#121417] text-[#A8E84A] border-[#A8E84A]'
                          : 'bg-[#F6F7F9] text-[#121417] border-[#D5DBE4]'
                      }`}
                    >
                      <QuestIcon id={quest.id} completed={quest.completed} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#121417] truncate">
                        {quest.title}
                      </h4>
                      <span className="font-data text-[11px] font-bold text-[#4B5563]">
                        +{quest.xpReward} XP
                      </span>
                    </div>
                  </div>

                  {quest.completed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#121417] text-[#A8E84A] border border-[#A8E84A] font-data text-[10px] font-bold uppercase tracking-wider shrink-0">
                      DONE
                    </span>
                  ) : actionHandler ? (
                    <button
                      type="button"
                      onClick={actionHandler}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F6F7F9] border border-[#D5DBE4] text-[#121417] hover:border-[#A8E84A] cursor-pointer shrink-0 transition-colors"
                    >
                      <span>{actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : null}
                </div>

                <p className="mt-3 text-xs text-[#4B5563] leading-relaxed">
                  {quest.description}
                </p>
              </div>

              {/* Individual Quest Progress Bar */}
              <div className="pt-3 border-t border-[#E5E9F0]">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-semibold text-[#4B5563]">Progress</span>
                  <span className="font-data font-bold text-[#121417] tabular-nums">
                    {quest.current} / {quest.target} {unitLabel} ({quest.pct}%)
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={quest.current}
                  aria-valuemin={0}
                  aria-valuemax={quest.target}
                  aria-label={`${quest.title} progress: ${quest.current} of ${quest.target}`}
                  className="h-2 w-full rounded-full bg-[#E5E9F0] overflow-hidden"
                >
                  <div
                    className="h-full rounded-full bg-[#A8E84A] transition-all duration-300"
                    style={{ width: `${quest.pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
