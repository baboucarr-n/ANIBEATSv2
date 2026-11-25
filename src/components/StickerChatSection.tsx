import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDown,
  Clock,
  Heart,
  Search,
  Send,
  User,
  X,
} from 'lucide-react';
import type {
  RewardUserProfile,
  StickerChatMessage,
} from '../data/animeUniverseData';
import {
  STICKER_CATEGORIES,
  STICKER_MAP,
  STICKER_PACK,
  type StickerCategory,
  type StickerSpec,
} from '../data/stickerPack';
import { getMaxCommunityVoteCount } from '../utils/rewardSystem';
import { StickerArt } from './StickerArt';
import { UserRoleIdentity } from './UserRoleIdentity';

interface StickerChatSectionProps {
  messages: StickerChatMessage[];
  rewardProfiles?: Record<string, RewardUserProfile>;
  busy: boolean;
  voterId: string;
  voterName: string;
  onVoterNameChange: (name: string) => void;
  onSendMessage: (payload: {
    text?: string;
    stickerId?: string;
    senderName?: string;
    voterId?: string;
    dayKey?: string;
  }) => Promise<void>;
  onToggleHeart: (messageId: string) => Promise<void>;
  onRefreshMessages: () => Promise<void>;
}

type PickerTab = 'Recent' | 'All' | StickerCategory;

const RECENT_STICKERS_KEY = 'anibeats_recent_stickers_v1';
const MAX_RECENT_STICKERS = 24;

function loadRecentStickerIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_STICKERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string' && Boolean(STICKER_MAP[id]));
  } catch {
    return [];
  }
}

function saveRecentStickerIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RECENT_STICKERS_KEY, JSON.stringify(ids));
  } catch {
    // ignore storage limits
  }
}

function formatMessageTime(iso: string): string {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return '';
  const date = new Date(ts);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function StickerChatSection({
  messages,
  rewardProfiles,
  busy,
  voterId,
  voterName,
  onVoterNameChange,
  onSendMessage,
  onToggleHeart,
  onRefreshMessages,
}: StickerChatSectionProps) {
  const [messageText, setMessageText] = useState('');
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [pickerTab, setPickerTab] = useState<PickerTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentIds, setRecentIds] = useState<string[]>(() => loadRecentStickerIds());
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [hasUnseenBelow, setHasUnseenBelow] = useState(false);

  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevCountRef = useRef<number>(messages.length);
  const maxCommunityVotes = useMemo(
    () => getMaxCommunityVoteCount(rewardProfiles),
    [rewardProfiles]
  );

  // Chronological oldest -> newest so newest is always at the bottom
  const chronologicalMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const ta = Date.parse(a.createdAt) || 0;
      const tb = Date.parse(b.createdAt) || 0;
      return ta - tb;
    });
  }, [messages]);

  // Live poll every 4 seconds while tab is visible
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        void onRefreshMessages();
      }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [onRefreshMessages]);

  // Initial scroll to bottom on mount
  useEffect(() => {
    const el = feedRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  // Auto-scroll when new messages arrive and user is near bottom
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    if (messages.length > prevCountRef.current) {
      if (isNearBottom) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        setHasUnseenBelow(false);
      } else {
        setHasUnseenBelow(true);
      }
    }
    prevCountRef.current = messages.length;
  }, [messages.length, isNearBottom]);

  const handleFeedScroll = () => {
    const el = feedRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const near = distanceFromBottom < 80;
    setIsNearBottom(near);
    if (near) setHasUnseenBelow(false);
  };

  const scrollToBottom = () => {
    const el = feedRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    setHasUnseenBelow(false);
    setIsNearBottom(true);
  };

  const recordRecentSticker = (stickerId: string) => {
    setRecentIds((prev) => {
      const next = [stickerId, ...prev.filter((id) => id !== stickerId)].slice(
        0,
        MAX_RECENT_STICKERS
      );
      saveRecentStickerIds(next);
      return next;
    });
  };

  const handleDispatchMessage = async (overrideStickerId?: string) => {
    const trimmedText = messageText.trim();
    const stickerToSend = overrideStickerId ?? selectedStickerId ?? undefined;

    if ((!trimmedText && !stickerToSend) || busy) return;
    if (stickerToSend && !STICKER_MAP[stickerToSend]) return;

    setMessageText('');
    setSelectedStickerId(null);
    if (stickerToSend) {
      recordRecentSticker(stickerToSend);
    }
    setIsNearBottom(true);

    const now = new Date();
    const localDayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    await onSendMessage({
      text: trimmedText || undefined,
      stickerId: stickerToSend,
      senderName: voterName.trim() || undefined,
      voterId,
      dayKey: localDayKey,
    });

    requestAnimationFrame(() => {
      const el = feedRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  };

  const handlePickSticker = (stickerId: string) => {
    // Clicking the already-selected sticker when no text is typed sends immediately;
    // otherwise stages/replaces the single allowed sticker in the composer (max 1).
    if (selectedStickerId === stickerId && !messageText.trim()) {
      void handleDispatchMessage(stickerId);
      return;
    }
    setSelectedStickerId(stickerId);
    inputRef.current?.focus();
  };

  const recentStickers = useMemo(() => {
    return recentIds
      .map((id) => STICKER_MAP[id])
      .filter((s): s is StickerSpec => Boolean(s));
  }, [recentIds]);

  const filteredStickers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let pool: StickerSpec[];

    if (pickerTab === 'Recent') {
      pool = recentStickers;
    } else if (pickerTab === 'All') {
      if (!q && recentStickers.length > 0) {
        const recentSet = new Set(recentStickers.map((s) => s.id));
        pool = [...recentStickers, ...STICKER_PACK.filter((s) => !recentSet.has(s.id))];
      } else {
        pool = STICKER_PACK;
      }
    } else {
      pool = STICKER_PACK.filter((s) => s.category === pickerTab);
    }

    if (!q) return pool;
    return pool.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.keywords.some((kw) => kw.includes(q))
    );
  }, [pickerTab, searchQuery, recentStickers]);

  const selectedSpec = selectedStickerId ? STICKER_MAP[selectedStickerId] : null;
  const canSend = Boolean(messageText.trim() || selectedStickerId) && !busy;

  return (
    <div id="anime-chat" className="mt-20 pt-14 border-t border-[#DDE2EA]">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B7280]">
            Live Feed · Text, Keyboard Emojis & {STICKER_PACK.length}+ Stickers
          </p>
          <h3 className="mt-1 inline-block text-2xl sm:text-3xl font-bold tracking-tight text-[#121417] border-b border-[#A8E84A] pb-1">
            Anime Chat
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 rounded-2xl bg-white/85 border border-[#D5DBE4]">
            <UserRoleIdentity
              voterId={voterId}
              displayName={voterName}
              rewardProfiles={rewardProfiles}
              maxCommunityVotes={maxCommunityVotes}
              showXpBar
              showBadges
              compact
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 border border-[#D5DBE4]">
            <User className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
            <input
              type="text"
              maxLength={32}
              value={voterName}
              onChange={(e) => onVoterNameChange(e.target.value)}
              placeholder="Your name (optional)"
              aria-label="Optional display name for anime chat"
              className="w-36 sm:w-44 bg-transparent text-xs font-medium text-[#121417] placeholder:text-[#9CA3AF] focus:outline-none"
            />
          </div>
          <span className="font-data text-xs font-semibold text-[#4B5563] tabular-nums">
            {chronologicalMessages.length}{' '}
            {chronologicalMessages.length === 1 ? 'message' : 'messages'}
          </span>
        </div>
      </div>

      {/* Main Split Live Chat + Phone Sticker Picker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT: LIVE CHAT FEED + TEXT/EMOJI/1-STICKER COMPOSER */}
        <div className="lg:col-span-7 flex flex-col rounded-[16px] bg-white/88 backdrop-blur-sm border border-[#DDE2EA] overflow-hidden">
          {/* Feed Top Bar */}
          <div className="px-5 py-3 border-b border-[#E5E9F0] flex items-center justify-between gap-3 bg-[#F6F7F9]/75">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#121417]">
              <span>Live Chat</span>
              <span aria-hidden="true" className="text-[#9CA3AF]">
                ·
              </span>
              <span className="text-[#4B5563] font-medium">Newest at bottom</span>
            </div>
            <span className="font-data text-[11px] font-semibold text-[#6B7280]">
              Max 1 sticker / message
            </span>
          </div>

          {/* Scrollable Messages Area */}
          <div className="relative flex-1 min-h-[420px]">
            <div
              ref={feedRef}
              onScroll={handleFeedScroll}
              className="h-[440px] sm:h-[490px] overflow-y-auto px-4 sm:px-6 py-5 space-y-5"
            >
              {chronologicalMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="mb-3 opacity-90">
                    <StickerArt stickerId="stk-cool-01" sizeClass="w-28 h-28" decorative />
                  </div>
                  <p className="text-sm font-bold text-[#121417]">
                    Start the Anime Chat
                  </p>
                  <p className="mt-1 text-xs text-[#4B5563] max-w-xs">
                    Type a message, drop keyboard emojis, or pick a big sticker from the 328+ pack on the right.
                  </p>
                </div>
              ) : (
                chronologicalMessages.map((msg) => {
                  const heartedByMe =
                    Array.isArray(msg.heartedBy) && msg.heartedBy.includes(voterId);
                  const heartsCount =
                    typeof msg.hearts === 'number'
                      ? msg.hearts
                      : Array.isArray(msg.heartedBy)
                        ? msg.heartedBy.length
                        : 0;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, scale: 0.94, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex flex-col items-start gap-1.5"
                    >
                      {/* Discord-vibe Sender Name + Level + XP Bar + Time */}
                      <div className="flex flex-wrap items-start gap-2.5 text-xs text-[#4B5563] px-1">
                        <UserRoleIdentity
                          voterId={msg.voterId}
                          displayName={msg.senderName}
                          rewardProfiles={rewardProfiles}
                          maxCommunityVotes={maxCommunityVotes}
                          showXpBar
                          showBadges
                          compact
                        />
                        <span aria-hidden="true" className="text-[#9CA3AF] pt-0.5">
                          ·
                        </span>
                        <time
                          dateTime={msg.createdAt}
                          className="font-data text-[11px] text-[#6B7280] tabular-nums pt-0.5"
                        >
                          {formatMessageTime(msg.createdAt)}
                        </time>
                      </div>

                      {/* Message Bubble (Text + Keyboard Emojis) & BIG Sticker + Heart Button */}
                      <div className="flex flex-wrap items-end gap-3 max-w-full">
                        <div className="flex flex-col items-start gap-2 max-w-[85%]">
                          {msg.text && (
                            <div className="px-4 py-2.5 rounded-2xl bg-[#F6F7F9] border border-[#E5E9F0] text-sm text-[#121417] leading-relaxed whitespace-pre-wrap break-words">
                              {msg.text}
                            </div>
                          )}

                          {msg.stickerId && STICKER_MAP[msg.stickerId] && (
                            <div className="p-2 rounded-[16px] bg-[#F6F7F9]/90 border border-[#E5E9F0]">
                              <StickerArt
                                stickerId={msg.stickerId}
                                sizeClass="w-28 h-28 sm:w-36 sm:h-36"
                              />
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => void onToggleHeart(msg.id)}
                          aria-pressed={heartedByMe}
                          aria-label={
                            heartedByMe
                              ? `Remove heart (${heartsCount})`
                              : `Heart message (${heartsCount})`
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tabular-nums cursor-pointer transition-colors shrink-0 ${
                            heartedByMe
                              ? 'bg-[#121417] text-white border border-[#EA843D]'
                              : 'bg-white border border-[#D5DBE4] text-[#4B5563] hover:text-[#121417] hover:border-[#A8E84A]'
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              heartedByMe ? 'fill-[#EA843D] text-[#EA843D]' : ''
                            }`}
                          />
                          <span>{heartsCount}</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {hasUnseenBelow && (
              <button
                type="button"
                onClick={scrollToBottom}
                className="absolute bottom-3 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#121417] text-white border border-[#A8E84A] cursor-pointer"
              >
                <ArrowDown className="w-3.5 h-3.5 text-[#A8E84A]" />
                <span>Jump to latest</span>
              </button>
            )}
          </div>

          {/* LIVE COMPOSER BAR: TEXT + KEYBOARD EMOJIS + MAX 1 ATTACHED STICKER */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleDispatchMessage();
            }}
            className="px-4 sm:px-5 py-3.5 border-t border-[#DDE2EA] bg-[#F6F7F9]/90 space-y-2.5"
          >
            {selectedSpec && (
              <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white border border-[#A8E84A]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <StickerArt stickerId={selectedSpec.id} sizeClass="w-12 h-12" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#121417] truncate">
                      {selectedSpec.name}
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      1 / 1 sticker attached · pick another to swap
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStickerId(null)}
                  aria-label="Remove attached sticker"
                  className="w-7 h-7 rounded-full inline-flex items-center justify-center bg-[#F6F7F9] border border-[#D5DBE4] text-[#4B5563] hover:text-[#121417] cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <input
                ref={inputRef}
                type="text"
                maxLength={500}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message or emoji from keyboard..."
                aria-label="Chat message text and emojis"
                className="flex-1 min-h-[46px] px-4 py-2.5 rounded-full bg-white border border-[#D5DBE4] text-sm text-[#121417] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#A8E84A]"
              />

              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex items-center gap-1.5 min-h-[46px] px-5 py-2.5 rounded-full text-xs font-semibold bg-[#121417] text-white border border-[#A8E84A] hover:opacity-90 disabled:opacity-35 whitespace-nowrap shrink-0 cursor-pointer transition-opacity"
              >
                <Send className="w-3.5 h-3.5 text-[#A8E84A]" />
                <span>{busy ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: PHONE-STYLE 328+ STICKER PICKER (CATEGORIES + SEARCH + RECENT FIRST) */}
        <div className="lg:col-span-5 flex flex-col rounded-[16px] bg-white/88 backdrop-blur-sm border border-[#DDE2EA] overflow-hidden">
          <div className="p-4 border-b border-[#E5E9F0] space-y-3 bg-[#F6F7F9]/75">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#121417]">
                Sticker Pack
              </span>
              <span className="font-data text-[11px] font-semibold text-[#6B7280] tabular-nums">
                {filteredStickers.length} / {STICKER_PACK.length} stickers
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${STICKER_PACK.length} stickers (hype, cat, ramen, cry...)`}
                aria-label="Search stickers"
                className="w-full pl-8 pr-8 py-2 rounded-xl bg-white border border-[#D5DBE4] text-xs text-[#121417] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#A8E84A]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear sticker search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#121417] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div
              role="tablist"
              aria-label="Sticker categories"
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={pickerTab === 'Recent'}
                onClick={() => setPickerTab('Recent')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  pickerTab === 'Recent'
                    ? 'bg-[#121417] text-white border border-[#A8E84A]'
                    : 'bg-white border border-[#D5DBE4] text-[#121417] hover:border-[#A8E84A]'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Recent</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={pickerTab === 'All'}
                onClick={() => setPickerTab('All')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  pickerTab === 'All'
                    ? 'bg-[#121417] text-white border border-[#A8E84A]'
                    : 'bg-white border border-[#D5DBE4] text-[#121417] hover:border-[#A8E84A]'
                }`}
              >
                All ({STICKER_PACK.length})
              </button>

              {STICKER_CATEGORIES.map((cat) => {
                const active = pickerTab === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setPickerTab(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      active
                        ? 'bg-[#121417] text-white border border-[#A8E84A]'
                        : 'bg-white border border-[#D5DBE4] text-[#121417] hover:border-[#A8E84A]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sticker Grid */}
          <div className="h-[420px] sm:h-[440px] overflow-y-auto p-3.5">
            {filteredStickers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <p className="text-xs font-bold text-[#121417]">
                  {pickerTab === 'Recent' && !searchQuery
                    ? 'No recent stickers yet'
                    : 'No matching stickers found'}
                </p>
                <p className="mt-1 text-[11px] text-[#6B7280]">
                  {pickerTab === 'Recent' && !searchQuery
                    ? 'Send a sticker and it will appear first here.'
                    : 'Try another keyword like hype, ramen, cat, cry, or headphones.'}
                </p>
                {pickerTab === 'Recent' && !searchQuery && (
                  <button
                    type="button"
                    onClick={() => setPickerTab('All')}
                    className="mt-3 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#121417] text-white cursor-pointer"
                  >
                    Browse All {STICKER_PACK.length} Stickers
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {pickerTab === 'All' && !searchQuery && recentStickers.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-2 px-1">
                      Recent First
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {recentStickers.slice(0, 10).map((spec) => {
                        const selected = selectedStickerId === spec.id;
                        return (
                          <button
                            key={`recent-${spec.id}`}
                            type="button"
                            title={`${spec.name} (tap to attach, tap again to quick-send)`}
                            aria-label={`Select sticker: ${spec.name}`}
                            aria-pressed={selected}
                            onClick={() => handlePickSticker(spec.id)}
                            className={`aspect-square rounded-xl p-1.5 flex items-center justify-center cursor-pointer transition-transform duration-150 hover:scale-105 ${
                              selected
                                ? 'bg-[#F6F7F9] border border-[#A8E84A] ring-2 ring-[#A8E84A]/50'
                                : 'bg-[#F6F7F9]/65 border border-transparent hover:border-[#D5DBE4]'
                            }`}
                          >
                            <StickerArt stickerId={spec.id} sizeClass="w-full h-full" />
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E5E9F0]">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-2 px-1">
                        Full Pack
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {(pickerTab === 'All' && !searchQuery && recentStickers.length > 0
                    ? STICKER_PACK
                    : filteredStickers
                  ).map((spec) => {
                    const selected = selectedStickerId === spec.id;
                    return (
                      <button
                        key={spec.id}
                        type="button"
                        title={`${spec.name} (tap to attach, tap again to quick-send)`}
                        aria-label={`Select sticker: ${spec.name}`}
                        aria-pressed={selected}
                        onClick={() => handlePickSticker(spec.id)}
                        className={`aspect-square rounded-xl p-1.5 flex items-center justify-center cursor-pointer transition-transform duration-150 hover:scale-105 ${
                          selected
                            ? 'bg-[#F6F7F9] border border-[#A8E84A] ring-2 ring-[#A8E84A]/50'
                            : 'bg-[#F6F7F9]/65 border border-transparent hover:border-[#D5DBE4]'
                        }`}
                      >
                        <StickerArt stickerId={spec.id} sizeClass="w-full h-full" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-[#E5E9F0] bg-[#F6F7F9]/75 flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>Tap to attach · Tap again to quick-send</span>
            <span className="font-data font-semibold text-[#121417]">1 max</span>
          </div>
        </div>
      </div>
    </div>
  );
}
