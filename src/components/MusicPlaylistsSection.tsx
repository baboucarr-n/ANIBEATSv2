import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { SlidersHorizontal, ExternalLink, ArrowRight } from 'lucide-react';
import {
  OST_VS_RAP_BATTLES,
  type MoodKey,
  type PlaylistEntry,
  type SongOfTheWeek,
} from '../data/anibeatsData';
import { parseSpotifyUrl } from '../utils/spotify';

export interface CommunityPlaylistPick {
  id: string;
  name: string;
  link: string;
  why: string;
}

interface MusicPlaylistsSectionProps {
  selectedMood: MoodKey;
  songOfTheWeek: SongOfTheWeek;
  playlists: PlaylistEntry[];
  communityPlaylists: CommunityPlaylistPick[];
  onAddCommunityPlaylist: (pick: CommunityPlaylistPick) => void;
  onOpenAdminMusic: () => void;
}

export function MusicPlaylistsSection({
  selectedMood,
  songOfTheWeek,
  playlists,
  communityPlaylists,
  onAddCommunityPlaylist,
  onOpenAdminMusic,
}: MusicPlaylistsSectionProps) {
  const [battleVotes, setBattleVotes] = useState<Record<string, 'ost' | 'rap'>>({});

  // Quiz state
  const [quizMood, setQuizMood] = useState<'chill' | 'hype'>('chill');
  const [quizSource, setQuizSource] = useState<'rap' | 'anime'>('rap');
  const [quizSetting, setQuizSetting] = useState<'headphones' | 'drive'>('headphones');
  const [quizMatch, setQuizMatch] = useState<{ title: string; reason: string } | null>(null);

  // Recommend form state
  const [recName, setRecName] = useState('');
  const [recLink, setRecLink] = useState('');
  const [recWhy, setRecWhy] = useState('');
  const [recFeedback, setRecFeedback] = useState('');

  const parsedSong = parseSpotifyUrl(songOfTheWeek.spotifyUrl);

  const handleQuizSubmit = (e: FormEvent) => {
    e.preventDefault();
    let title = playlists[0]?.title || 'My Rap Rotation';
    let reason = 'High-energy rotation for daily listening.';

    if (quizSetting === 'drive') {
      title = playlists[3]?.title || 'Night Drive';
      reason = 'Built for open roads, streetlights, and the Music ↔ Cars bridge.';
    } else if (quizSource === 'anime') {
      title = playlists[1]?.title || 'Anime OSTs That Hit Different';
      reason = 'Unforgettable openings and soundtracks that give instant chills.';
    } else if (quizMood === 'chill') {
      title = playlists[2]?.title || 'Late Night Beats';
      reason = 'Smooth, laid-back tracks for late hours and headphones.';
    }

    setQuizMatch({ title, reason });
  };

  const handleRecommendSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = recName.trim();
    const cleanLink = recLink.trim();
    const cleanWhy = recWhy.trim();
    if (!cleanName || !cleanLink || !cleanWhy) return;

    onAddCommunityPlaylist({
      id: `pl-pick-${Date.now()}`,
      name: cleanName,
      link: cleanLink,
      why: cleanWhy,
    });

    setRecFeedback(
      `Thank you, ${cleanName}! Saved to Community Picks below.`
    );
    setRecName('');
    setRecLink('');
    setRecWhy('');
  };

  return (
    <>
      {/* 03. MUSIC / RAP SECTION */}
      <section id="music" className="studio-wash-music py-20 md:py-24 border-t border-zinc-200">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <p className="font-data text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-3">
                03 · Music &amp; Rap
              </p>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 mb-4">
                Rap, Beats &amp; Anime OSTs
              </h2>
              <p className="text-base text-zinc-600 leading-relaxed">
                From bars that stick in my head all week to anime openings that give instant chills. Live Spotify embed powered by your Admin Panel.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenAdminMusic}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 whitespace-nowrap shrink-0 cursor-pointer self-start md:self-auto transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Edit Spotify Links</span>
            </button>
          </div>

          {/* Song of the Week + Night Drive Bridge */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <article className="surface-card rounded-2xl p-7 hover:border-emerald-200">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="font-data text-xs font-semibold text-emerald-600 uppercase">
                  Song of the Week
                </p>
                {parsedSong.canonicalUrl && (
                  <a
                    href={parsedSong.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-emerald-700 hover:underline inline-flex items-center gap-1"
                  >
                    Open on Spotify <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <h3 className="text-2xl font-bold text-zinc-950">{songOfTheWeek.title}</h3>
              <p className="text-sm font-medium text-zinc-500 mt-0.5">{songOfTheWeek.artist}</p>
              <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                <span className="font-semibold text-zinc-900">Why it’s on repeat:</span>{' '}
                {songOfTheWeek.why}
              </p>

              <div className="mt-5 rounded-xl overflow-hidden border border-emerald-200/80 bg-zinc-50">
                {parsedSong.valid && parsedSong.embedUrl ? (
                  <iframe
                    title={`Spotify Embed: ${songOfTheWeek.title}`}
                    src={`${parsedSong.embedUrl}&theme=0`}
                    width="100%"
                    height="152"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="block border-0"
                  />
                ) : (
                  <div className="p-4 text-xs text-zinc-500">
                    No Spotify track linked yet — paste any Spotify track or playlist link in the Admin Panel.
                  </div>
                )}
              </div>
            </article>

            <article className="surface-card rounded-2xl p-7 flex flex-col justify-between hover:border-violet-200">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                <div className="sm:col-span-5 h-44 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
                  <img
                    src="/src/assets/images/anibeats_music_visual_1795278850957.jpg"
                    alt="Minimalist frosted turntable and white headphones"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="sm:col-span-7">
                  <p className="font-data text-xs font-semibold text-violet-600 uppercase">
                    Music ↔ Cars Bridge
                  </p>
                  <h3 className="text-2xl font-bold text-zinc-950 mt-1.5">Night Drive Playlist</h3>
                  <p className="text-sm text-zinc-600 mt-2.5 leading-relaxed">
                    The bridge between my love for beats and my love for cars. Streetlights, empty road, windows cracked, bass low.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 mt-6 pt-5 border-t border-zinc-100">
                <a
                  href="#playlists"
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 whitespace-nowrap shrink-0 transition-colors"
                >
                  Open Night Drive Playlist
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="#cars"
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 whitespace-nowrap shrink-0 transition-colors"
                >
                  Go To Cars Section
                </a>
              </div>
            </article>
          </div>

          {/* My Rap List + Anime OSTs That Hit Different */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="surface-card rounded-2xl p-7">
              <p className="font-data text-xs font-semibold text-emerald-600 uppercase">
                My Rap List · To be filled by me
              </p>
              <h3 className="text-xl font-bold text-zinc-950 mt-1.5">Tracks In My Rotation</h3>

              <ul className="divide-y divide-zinc-100 mt-5">
                {[1, 2, 3].map((num) => (
                  <li key={num} className="py-3.5 first:pt-0 last:pb-0">
                    <p className="text-sm font-bold text-zinc-950">
                      Artist — Song #{num}{' '}
                      <span className="font-normal text-zinc-500">· Vibe: To be filled by me</span>
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">Why it hits: To be filled by me</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="surface-card rounded-2xl p-7">
              <p className="font-data text-xs font-semibold text-rose-600 uppercase">
                Anime OSTs · To be filled by me
              </p>
              <h3 className="text-xl font-bold text-zinc-950 mt-1.5">OSTs That Hit Different</h3>

              <ul className="divide-y divide-zinc-100 mt-5">
                {[1, 2, 3].map((num) => (
                  <li key={num} className="py-3.5 first:pt-0 last:pb-0">
                    <p className="text-sm font-bold text-zinc-950">Anime OST #{num}</p>
                    <p className="text-xs text-zinc-600 mt-1">Why it hits: To be filled by me</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* OST vs Rap Battle */}
          <div className="mt-12">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
              <h3 className="text-xl font-bold text-zinc-950">OST vs Rap Battle</h3>
              <span className="font-data text-xs text-violet-600 font-semibold">Same Energy Pairings</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {OST_VS_RAP_BATTLES.map((battle) => {
                const chosen = battleVotes[battle.id];
                const matchesMood =
                  selectedMood === 'all' || battle.moods.includes(selectedMood);

                return (
                  <div
                    key={battle.id}
                    className={`surface-card rounded-2xl p-6 transition-opacity ${
                      matchesMood ? 'opacity-100' : 'opacity-45'
                    }`}
                  >
                    <p className="font-data text-xs font-semibold text-violet-600">
                      {battle.label} · To be filled by me
                    </p>
                    <h4 className="text-lg font-bold text-zinc-950 mt-1.5">{battle.title}</h4>
                    <p className="text-sm text-zinc-600 mt-2">
                      <span className="font-semibold text-zinc-900">Shared Energy:</span>{' '}
                      {battle.sharedEnergy}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-5">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => setBattleVotes((p) => ({ ...p, [battle.id]: 'ost' }))}
                        className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                          chosen === 'ost'
                            ? 'bg-rose-600 text-white'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {battle.ostLabel}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => setBattleVotes((p) => ({ ...p, [battle.id]: 'rap' }))}
                        className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                          chosen === 'rap'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {battle.rapLabel}
                      </motion.button>
                    </div>

                    <p className="text-xs text-zinc-500 mt-3">
                      {chosen === 'ost'
                        ? 'You picked the Anime OP / OST side for this matchup.'
                        : chosen === 'rap'
                        ? 'You picked the Rap Track side for this matchup.'
                        : 'Pick which one hits harder.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lyrics That Hit Me */}
          <div className="mt-12">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
              <h3 className="text-xl font-bold text-zinc-950">Lyrics That Hit Me</h3>
              <span className="font-data text-xs text-zinc-500">To be filled by me</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <blockquote className="surface-card rounded-2xl p-7 hover:border-emerald-200">
                <p className="font-editorial italic text-xl sm:text-2xl text-zinc-950 leading-snug">
                  “1-line rap lyric that stays in my head — to be filled by me.”
                </p>
                <footer className="font-data text-xs text-emerald-600 font-semibold mt-4">
                  Artist &amp; Song · To be filled by me
                </footer>
              </blockquote>

              <blockquote className="surface-card rounded-2xl p-7 hover:border-rose-200">
                <p className="font-editorial italic text-xl sm:text-2xl text-zinc-950 leading-snug">
                  “1-line anime quote that hit hard — to be filled by me.”
                </p>
                <footer className="font-data text-xs text-rose-600 font-semibold mt-4">
                  Character &amp; Anime · To be filled by me
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* 04. PLAYLISTS SECTION — LIVE SPOTIFY EMBEDS */}
      <section id="playlists" className="py-20 md:py-24 border-t border-zinc-200">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <p className="font-data text-xs font-semibold uppercase tracking-wider text-violet-600 mb-3">
                04 · Playlists
              </p>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 mb-4">
                Live Spotify Rotation
              </h2>
              <p className="text-base text-zinc-600 leading-relaxed">
                Pre-loaded with verified editorial Spotify playlists for testing. Add or replace any Spotify playlist link directly from the Admin Panel.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenAdminMusic}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 whitespace-nowrap shrink-0 cursor-pointer self-start md:self-auto transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Add Spotify Link</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {playlists.map((pl, idx) => {
              const matchesMood = selectedMood === 'all' || pl.moods.includes(selectedMood);
              const parsed = parseSpotifyUrl(pl.spotifyUrl);

              return (
                <article
                  key={pl.id}
                  className={`surface-card rounded-2xl p-6 transition-opacity hover:border-violet-300 ${
                    matchesMood ? 'opacity-100' : 'opacity-45'
                  } ${selectedMood !== 'all' && matchesMood ? 'ring-2 ring-violet-600' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-data text-xs font-semibold text-violet-600">
                        Playlist {String(idx + 1).padStart(2, '0')} · {pl.moodLabel}
                      </p>
                      <h3 className="text-lg font-bold text-zinc-950 mt-1">{pl.title}</h3>
                    </div>
                    {parsed.canonicalUrl && (
                      <a
                        href={parsed.canonicalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-emerald-700 hover:underline inline-flex items-center gap-1 shrink-0"
                      >
                        Spotify <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <p className="text-sm text-zinc-600 mt-1.5 mb-4">{pl.description}</p>

                  <div className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
                    {parsed.valid && parsed.embedUrl ? (
                      <iframe
                        title={`Spotify Playlist: ${pl.title}`}
                        src={`${parsed.embedUrl}&theme=0`}
                        width="100%"
                        height="352"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="block border-0"
                      />
                    ) : (
                      <div className="p-5 text-xs text-zinc-500">
                        Invalid or empty Spotify URL — edit this playlist in the Admin Panel.
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Playlist Match Quiz + Recommend A Playlist To Me */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
            <div className="surface-card rounded-2xl p-7">
              <p className="font-data text-xs font-semibold text-violet-600 uppercase">
                3-Question Quiz
              </p>
              <h3 className="text-xl font-bold text-zinc-950 mt-1.5">Playlist Match Quiz</h3>
              <p className="text-sm text-zinc-600 mt-1.5">
                Answer 3 quick questions and I’ll match you with one of the playlists above.
              </p>

              <form onSubmit={handleQuizSubmit} className="space-y-4 mt-5">
                <div>
                  <label htmlFor="quizMood" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    1. What’s your mood right now?
                  </label>
                  <select
                    id="quizMood"
                    value={quizMood}
                    onChange={(e) => setQuizMood(e.target.value as 'chill' | 'hype')}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-white border border-zinc-200 text-sm text-zinc-950 focus:outline-none focus:border-violet-600"
                  >
                    <option value="chill">Chill</option>
                    <option value="hype">Hype</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="quizSource" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    2. Anime or Rap?
                  </label>
                  <select
                    id="quizSource"
                    value={quizSource}
                    onChange={(e) => setQuizSource(e.target.value as 'rap' | 'anime')}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-white border border-zinc-200 text-sm text-zinc-950 focus:outline-none focus:border-violet-600"
                  >
                    <option value="rap">Rap</option>
                    <option value="anime">Anime</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="quizSetting" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    3. Where are you listening?
                  </label>
                  <select
                    id="quizSetting"
                    value={quizSetting}
                    onChange={(e) => setQuizSetting(e.target.value as 'headphones' | 'drive')}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-white border border-zinc-200 text-sm text-zinc-950 focus:outline-none focus:border-violet-600"
                  >
                    <option value="headphones">Room / Headphones</option>
                    <option value="drive">On the road / Night Drive</option>
                  </select>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="inline-flex items-center justify-center min-h-[42px] px-5 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 cursor-pointer"
                >
                  Find My Playlist
                </motion.button>

                {quizMatch && (
                  <div
                    aria-live="polite"
                    className="rounded-xl bg-violet-50 border border-violet-200 px-4 py-3 text-sm text-zinc-900"
                  >
                    Your match: <span className="font-bold text-violet-800">{quizMatch.title}</span> — {quizMatch.reason}
                  </div>
                )}
              </form>
            </div>

            <div className="surface-card rounded-2xl p-7">
              <p className="font-data text-xs font-semibold text-emerald-600 uppercase">Put Me On</p>
              <h3 className="text-xl font-bold text-zinc-950 mt-1.5">Recommend A Playlist To Me</h3>
              <p className="text-sm text-zinc-600 mt-1.5">
                Got a playlist you think I’d love? Drop it below. Best recommendations get featured in Community Picks with full credit.
              </p>

              <form onSubmit={handleRecommendSubmit} className="space-y-4 mt-5">
                <div>
                  <label htmlFor="recName" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Your Name
                  </label>
                  <input
                    id="recName"
                    type="text"
                    required
                    value={recName}
                    onChange={(e) => setRecName(e.target.value)}
                    placeholder="Your name or handle"
                    className="w-full min-h-[42px] px-3 rounded-xl bg-white border border-zinc-200 text-sm text-zinc-950 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label htmlFor="recLink" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Spotify Link
                  </label>
                  <input
                    id="recLink"
                    type="url"
                    required
                    value={recLink}
                    onChange={(e) => setRecLink(e.target.value)}
                    placeholder="https://open.spotify.com/playlist/..."
                    className="w-full min-h-[42px] px-3 rounded-xl bg-white border border-zinc-200 text-sm text-zinc-950 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label htmlFor="recWhy" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Why should I listen?
                  </label>
                  <textarea
                    id="recWhy"
                    required
                    value={recWhy}
                    onChange={(e) => setRecWhy(e.target.value)}
                    rows={3}
                    placeholder="Tell me the vibe or best track on it..."
                    className="w-full p-3 rounded-xl bg-white border border-zinc-200 text-sm text-zinc-950 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="inline-flex items-center justify-center min-h-[42px] px-5 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                >
                  Send Playlist
                </motion.button>

                {recFeedback && (
                  <div
                    aria-live="polite"
                    className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-zinc-900"
                  >
                    {recFeedback}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Community Picks */}
          <div className="mt-8 surface-card rounded-2xl p-6">
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <h3 className="text-lg font-bold text-zinc-950">Community Picks</h3>
              <span className="font-data text-xs text-emerald-600 font-semibold">
                {communityPlaylists.length === 0
                  ? 'To be filled by me'
                  : `${communityPlaylists.length} added`}
              </span>
            </div>

            {communityPlaylists.length === 0 ? (
              <p className="text-sm text-zinc-600">
                Best playlists sent by friends and visitors will live right here — always with credit to the recommender.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100 mt-3">
                {communityPlaylists.map((item) => (
                  <li
                    key={item.id}
                    className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-sm font-bold text-zinc-950">Suggested by {item.name}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">{item.why}</p>
                    </div>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-emerald-700 hover:underline whitespace-nowrap shrink-0"
                    >
                      Open Link →
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
