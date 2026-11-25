import { useState } from 'react';
import { CheckCircle2, Link as LinkIcon, Send, X } from 'lucide-react';
import type { SubmitSuggestionPayload } from '../services/animeUniverseApi';

interface SuggestAnimeModalProps {
  open: boolean;
  busy: boolean;
  defaultName: string;
  onClose: () => void;
  onSubmit: (payload: SubmitSuggestionPayload) => Promise<void>;
}

export function SuggestAnimeModal({
  open,
  busy,
  defaultName,
  onClose,
  onSubmit,
}: SuggestAnimeModalProps) {
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [why, setWhy] = useState('');
  const [submittedBy, setSubmittedBy] = useState(defaultName);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedTitle, setSubmittedTitle] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedTitle = title.trim();
    const trimmedLink = link.trim();
    const trimmedWhy = why.trim();
    const trimmedName = submittedBy.trim();

    if (!trimmedTitle) {
      setFormError('Please enter the anime title.');
      return;
    }

    let validUrl = false;
    try {
      const parsed = new URL(trimmedLink);
      validUrl = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      validUrl = false;
    }

    if (!validUrl) {
      setFormError('Please enter a valid http:// or https:// streaming link (YouTube, Crunchyroll, etc.).');
      return;
    }

    if (!trimmedWhy) {
      setFormError('Please share why you love this anime.');
      return;
    }

    try {
      await onSubmit({
        title: trimmedTitle,
        link: trimmedLink,
        why: trimmedWhy,
        submittedBy: trimmedName || 'Community Member',
      });
      setSubmittedTitle(trimmedTitle);
      setTitle('');
      setLink('');
      setWhy('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not send suggestion.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121417]/35 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="suggest-anime-heading"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[16px] bg-[#F6F7F9] border border-[#DDE2EA] text-[#121417] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-white/90 border-b border-[#DDE2EA] flex items-center justify-between gap-3">
          <div>
            <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B7280]">
              Community Discovery Queue
            </p>
            <h3
              id="suggest-anime-heading"
              className="mt-0.5 text-lg font-bold tracking-tight text-[#121417]"
            >
              Suggest an Anime
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close suggest anime form"
            className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-white border border-[#D5DBE4] text-[#121417] hover:border-[#A8E84A] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {submittedTitle ? (
            <div className="rounded-[16px] bg-white border border-[#A8E84A] p-5 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#121417] text-[#A8E84A] inline-flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#121417]">
                “{submittedTitle}” sent to Pending
              </h4>
              <p className="text-xs text-[#4B5563] leading-relaxed max-w-sm mx-auto">
                Your suggestion is queued for Admin review. Once approved, it moves straight into the Discovery list.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setSubmittedTitle(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-[#D5DBE4] text-[#121417] hover:border-[#A8E84A] cursor-pointer transition-colors"
                >
                  Suggest Another
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-[#121417] text-white cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="px-3.5 py-2.5 rounded-xl bg-white/85 border border-[#DDE2EA] text-xs text-[#4B5563]">
                Submissions stay <span className="font-semibold text-[#121417]">Pending</span> until approved in Admin. Approved picks go live in Discovery.
              </div>

              {formError && (
                <div className="px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                  {formError}
                </div>
              )}

              <div>
                <label
                  htmlFor="suggest-anime-title"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[#4B5563] mb-1.5"
                >
                  Anime Title <span className="text-[#EA843D]">*</span>
                </label>
                <input
                  id="suggest-anime-title"
                  type="text"
                  required
                  maxLength={140}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mob Psycho 100"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5DBE4] text-sm text-[#121417] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#A8E84A]"
                />
              </div>

              <div>
                <label
                  htmlFor="suggest-anime-link"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[#4B5563] mb-1.5"
                >
                  YouTube / Crunchyroll / Streaming Link <span className="text-[#EA843D]">*</span>
                </label>
                <div className="relative">
                  <LinkIcon className="w-3.5 h-3.5 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="suggest-anime-link"
                    type="url"
                    required
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://www.crunchyroll.com/... or https://youtube.com/..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-[#D5DBE4] text-sm text-[#121417] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#A8E84A]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="suggest-anime-why"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[#4B5563] mb-1.5"
                >
                  Why You Love It <span className="text-[#EA843D]">*</span>
                </label>
                <textarea
                  id="suggest-anime-why"
                  required
                  rows={3}
                  maxLength={500}
                  value={why}
                  onChange={(e) => setWhy(e.target.value)}
                  placeholder="What moment, character, or life lesson makes this unmissable?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5DBE4] text-sm text-[#121417] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#A8E84A]"
                />
              </div>

              <div>
                <label
                  htmlFor="suggest-anime-name"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[#4B5563] mb-1.5"
                >
                  Your Name
                </label>
                <input
                  id="suggest-anime-name"
                  type="text"
                  maxLength={80}
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  placeholder="Optional — defaults to Community Member"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5DBE4] text-sm text-[#121417] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#A8E84A]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-[#D5DBE4] text-[#4B5563] hover:text-[#121417] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-[#121417] text-white border border-[#A8E84A] hover:opacity-90 disabled:opacity-45 cursor-pointer transition-opacity"
                >
                  <Send className="w-3.5 h-3.5 text-[#A8E84A]" />
                  <span>{busy ? 'Sending...' : 'Submit for Review'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
