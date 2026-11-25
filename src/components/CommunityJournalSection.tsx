import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { SlidersHorizontal } from 'lucide-react';
import { POLL_OPTIONS, type JournalEntry } from '../data/anibeatsData';

export interface FanSuggestion {
  id: string;
  category: string;
  title: string;
  link?: string;
  why: string;
}

interface CommunityJournalSectionProps {
  pollState: { votes: number[]; userChoice: number | null };
  onVotePoll: (index: number) => void;
  suggestions: FanSuggestion[];
  onAddSuggestion: (item: FanSuggestion) => void;
  journalEntries: JournalEntry[];
  onOpenAdminJournal: () => void;
}

export function CommunityJournalSection({
  pollState,
  onVotePoll,
  suggestions,
  onAddSuggestion,
  journalEntries,
  onOpenAdminJournal,
}: CommunityJournalSectionProps) {
  const [sugCategory, setSugCategory] = useState('Anime');
  const [sugName, setSugName] = useState('');
  const [sugLink, setSugLink] = useState('');
  const [sugWhy, setSugWhy] = useState('');
  const [sugFeedback, setSugFeedback] = useState('');

  const totalVotes = pollState.votes.reduce((sum, n) => sum + n, 0);

  const handleSuggestSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanTitle = sugName.trim();
    const cleanWhy = sugWhy.trim();
    if (!cleanTitle || !cleanWhy) return;

    onAddSuggestion({
      id: `sug-${Date.now()}`,
      category: sugCategory,
      title: cleanTitle,
      link: sugLink.trim() || undefined,
      why: cleanWhy,
    });

    setSugFeedback(
      `Thank you! Your ${sugCategory} suggestion (“${cleanTitle}”) was saved to the Fan Wall below.`
    );
    setSugName('');
    setSugLink('');
    setSugWhy('');
  };

  return (
    <>
      {/* 08. COMMUNITY SECTION */}
      <section id="community" className="py-20 md:py-24 border-t border-zinc-200">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <p className="font-data text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-3">
              08 · Community
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 mb-4">
              Put Me On &amp; Vote
            </h2>
            <p className="text-base text-zinc-600 leading-relaxed">
              If you share the taste, send me something to watch, listen to, drive, or visit. Rules here are simple: be kind, credit people, no spam.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Suggest Form */}
            <div className="surface-card rounded-2xl p-7">
              <p className="font-data text-xs font-semibold text-indigo-600 uppercase">
                Suggest Something
              </p>
              <h3 className="text-xl font-bold text-zinc-950 mt-1.5">
                Suggest Anime / Song / Playlist / Car / Destination
              </h3>

              <form onSubmit={handleSuggestSubmit} className="space-y-4 mt-5">
                <div>
                  <label htmlFor="sugCategory" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Category
                  </label>
                  <select
                    id="sugCategory"
                    value={sugCategory}
                    onChange={(e) => setSugCategory(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-white border border-zinc-200 text-sm text-zinc-950 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Anime">Anime</option>
                    <option value="Song">Song</option>
                    <option value="Playlist">Playlist</option>
                    <option value="Car">Car</option>
                    <option value="Destination">Destination</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="sugName" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Title / Name (and your name so I can credit you)
                  </label>
                  <input
                    id="sugName"
                    type="text"
                    required
                    value={sugName}
                    onChange={(e) => setSugName(e.target.value)}
                    placeholder="e.g., Samurai Champloo — suggested by Alex"
                    className="w-full min-h-[42px] px-3 rounded-xl bg-white border border-zinc-200 text-sm text-zinc-950 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label htmlFor="sugLink" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Link (optional)
                  </label>
                  <input
                    id="sugLink"
                    type="url"
                    value={sugLink}
                    onChange={(e) => setSugLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full min-h-[42px] px-3 rounded-xl bg-white border border-zinc-200 text-sm text-zinc-950 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label htmlFor="sugWhy" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Why should I check it out?
                  </label>
                  <textarea
                    id="sugWhy"
                    required
                    rows={3}
                    value={sugWhy}
                    onChange={(e) => setSugWhy(e.target.value)}
                    placeholder="Tell me why it hits..."
                    className="w-full p-3 rounded-xl bg-white border border-zinc-200 text-sm text-zinc-950 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="inline-flex items-center justify-center min-h-[42px] px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                >
                  Send Suggestion
                </motion.button>

                {sugFeedback && (
                  <div
                    aria-live="polite"
                    className="rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3 text-sm text-zinc-900"
                  >
                    {sugFeedback}
                  </div>
                )}
              </form>
            </div>

            {/* Poll of the Week */}
            <div className="surface-card rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <p className="font-data text-xs font-semibold text-violet-600 uppercase">
                  Poll of the Week
                </p>
                <h3 className="text-xl font-bold text-zinc-950 mt-1.5">
                  Best Anime Opening Era / Vibe?
                </h3>
                <p className="text-sm text-zinc-600 mt-1.5">
                  Vote below to see live % results persisted via the backend API.
                </p>

                <div className="space-y-4 mt-6">
                  {POLL_OPTIONS.map((label, idx) => {
                    const count = pollState.votes[idx] ?? 0;
                    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const isSelected = pollState.userChoice === idx;

                    return (
                      <div key={label}>
                        <motion.button
                          whileTap={{ scale: 0.99 }}
                          type="button"
                          onClick={() => onVotePoll(idx)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-zinc-200 text-zinc-800 hover:border-indigo-300'
                          }`}
                        >
                          {label}
                        </motion.button>

                        <div className="w-full h-1.5 rounded-full bg-indigo-100 overflow-hidden mt-2">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <p className="font-data text-xs text-zinc-500 tabular-nums mt-1">
                          {pct}% ({count} {count === 1 ? 'vote' : 'votes'})
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="font-data text-xs text-zinc-500 mt-6 tabular-nums">
                {pollState.userChoice !== null
                  ? `Thanks for voting · ${totalVotes} total ${
                      totalVotes === 1 ? 'vote' : 'votes'
                    } recorded.`
                  : 'Click any option to cast your vote.'}
              </p>
            </div>
          </div>

          {/* Fan Wall / Shoutouts & Guest Picks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="surface-card rounded-2xl p-6">
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <p className="font-data text-xs font-semibold text-indigo-600 uppercase">
                  Fan Wall / Shoutouts
                </p>
                <span className="font-data text-xs text-zinc-500">
                  {suggestions.length === 0 ? 'To be filled by me' : `${suggestions.length} added`}
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-950">Best Suggestions Featured</h3>

              {suggestions.length === 0 ? (
                <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                  Whenever someone puts me on a great anime, song, car, or destination, I’ll feature it right here with their name.
                </p>
              ) : (
                <ul className="divide-y divide-zinc-100 mt-4">
                  {suggestions.map((item) => (
                    <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                      <p className="font-data text-[11px] font-semibold text-indigo-600 uppercase">
                        {item.category}
                      </p>
                      <p className="text-sm font-bold text-zinc-950 mt-0.5">{item.title}</p>
                      <p className="text-xs text-zinc-600 mt-1">{item.why}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="surface-card rounded-2xl p-6">
              <p className="font-data text-xs font-semibold text-cyan-700 uppercase">
                Guest Picks · To be filled by me
              </p>
              <h3 className="text-lg font-bold text-zinc-950 mt-1.5">
                Monthly Friend / Follower Top 5
              </h3>
              <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                Once a month, a friend or visitor gets the spotlight to share their personal Top 5 picks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 09. JOURNAL / BEHIND THE BUILD */}
      <section id="journal" className="py-20 md:py-24 border-t border-zinc-200">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <p className="font-data text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-3">
                09 · Journal · Behind The Build
              </p>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 mb-4">
                Dev Diary
              </h2>
              <p className="text-base text-zinc-600 leading-relaxed">
                Building in public, slowly, without rushing. What I added, why I added it, and how ANIBEATS keeps growing.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenAdminJournal}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 whitespace-nowrap shrink-0 cursor-pointer self-start md:self-auto transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Write Diary Entry</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {journalEntries.map((entry) => (
              <article key={entry.id} className="surface-card rounded-2xl p-7">
                <p className="font-data text-xs font-semibold text-indigo-600">{entry.dateLabel}</p>
                <h3 className="text-lg font-bold text-zinc-950 mt-2 leading-snug">
                  {entry.title}
                </h3>
                <div className="space-y-2 mt-4 text-sm text-zinc-600 leading-relaxed">
                  <p>
                    <span className="font-semibold text-zinc-900">What I added:</span> {entry.added}
                  </p>
                  <p>
                    <span className="font-semibold text-zinc-900">Why:</span> {entry.why}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
