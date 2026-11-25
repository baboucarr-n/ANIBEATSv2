import { useEffect, useState } from 'react';
import { MessageCircle, Send, User, X } from 'lucide-react';
import type {
  AnimeCommentItem,
  RewardUserProfile,
} from '../data/animeUniverseData';
import { UserRoleIdentity } from './UserRoleIdentity';

export interface CommentTargetAnime {
  id: string;
  title: string;
  posterUrl: string;
  tag?: string;
}

interface AnimeCommentsModalProps {
  anime: CommentTargetAnime | null;
  comments: AnimeCommentItem[];
  rewardProfiles?: Record<string, RewardUserProfile>;
  maxCommunityVotes: number;
  voterName: string;
  onVoterNameChange: (name: string) => void;
  busy: boolean;
  onClose: () => void;
  onAddComment: (payload: {
    animeId: string;
    authorName?: string;
    text: string;
  }) => Promise<void>;
}

function formatCommentTime(iso: string): string {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return '';
  return new Date(ts).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function AnimeCommentsModal({
  anime,
  comments,
  rewardProfiles,
  maxCommunityVotes,
  voterName,
  onVoterNameChange,
  busy,
  onClose,
  onAddComment,
}: AnimeCommentsModalProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!anime) return;
    setText('');
    setError(null);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [anime, onClose]);

  if (!anime) return null;

  const animeComments = [...comments]
    .filter((c) => c.animeId === anime.id)
    .sort((a, b) => (Date.parse(a.createdAt) || 0) - (Date.parse(b.createdAt) || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Write a comment before posting.');
      return;
    }
    setError(null);
    try {
      await onAddComment({
        animeId: anime.id,
        authorName: voterName.trim() || undefined,
        text: trimmed,
      });
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to post comment.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121417]/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Comments for ${anime.title}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[20px] bg-white border border-[#DDE2EA] text-[#121417] overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E9F0] bg-[#F6F7F9] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={anime.posterUrl}
              alt={`${anime.title} poster`}
              referrerPolicy="no-referrer"
              className="w-10 h-14 rounded-lg object-cover border border-[#D5DBE4] shrink-0 bg-[#ECEEF2]"
            />
            <div className="min-w-0">
              <p className="font-data text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#6B7280]">
                {anime.tag || 'Anime Comments'} · +10 XP
              </p>
              <h3 className="text-base font-bold text-[#121417] truncate">
                {anime.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close comments modal"
            className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-white border border-[#D5DBE4] text-[#4B5563] hover:text-[#121417] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-[220px]">
          {animeComments.length === 0 ? (
            <div className="py-10 text-center">
              <MessageCircle className="w-7 h-7 mx-auto text-[#9CA3AF]" />
              <p className="mt-2 text-sm font-bold text-[#121417]">
                No comments yet
              </p>
              <p className="mt-1 text-xs text-[#6B7280]">
                Share your thoughts on {anime.title} and earn +10 XP.
              </p>
            </div>
          ) : (
            animeComments.map((cmt) => (
              <div
                key={cmt.id}
                className="p-3.5 rounded-2xl bg-[#F6F7F9] border border-[#E5E9F0] space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <UserRoleIdentity
                    voterId={cmt.voterId}
                    displayName={cmt.authorName}
                    rewardProfiles={rewardProfiles}
                    maxCommunityVotes={maxCommunityVotes}
                    showXpBar
                    showBadges
                    compact
                  />
                  <time
                    dateTime={cmt.createdAt}
                    className="font-data text-[10.5px] text-[#6B7280] tabular-nums shrink-0"
                  >
                    {formatCommentTime(cmt.createdAt)}
                  </time>
                </div>

                <p className="text-xs sm:text-sm text-[#121417] leading-relaxed whitespace-pre-wrap break-words">
                  {cmt.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <form
          onSubmit={handleSubmit}
          className="px-5 py-4 border-t border-[#DDE2EA] bg-[#F6F7F9] space-y-3"
        >
          {error && (
            <p className="text-xs font-medium text-rose-600">{error}</p>
          )}

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#D5DBE4]">
            <User className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
            <input
              type="text"
              maxLength={32}
              value={voterName}
              onChange={(e) => onVoterNameChange(e.target.value)}
              placeholder="Your name (optional)"
              aria-label="Optional display name for anime comment"
              className="w-44 bg-transparent text-xs font-medium text-[#121417] placeholder:text-[#9CA3AF] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="text"
              maxLength={500}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment (+10 XP)..."
              aria-label={`Comment on ${anime.title}`}
              className="flex-1 min-h-[42px] px-4 py-2 rounded-full bg-white border border-[#D5DBE4] text-xs sm:text-sm text-[#121417] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#A8E84A]"
            />
            <button
              type="submit"
              disabled={busy || !text.trim()}
              className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 rounded-full text-xs font-semibold bg-[#121417] text-white border border-[#A8E84A] hover:opacity-90 disabled:opacity-40 cursor-pointer shrink-0 transition-opacity"
            >
              <Send className="w-3.5 h-3.5 text-[#A8E84A]" />
              <span>{busy ? 'Posting...' : 'Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
