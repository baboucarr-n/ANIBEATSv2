import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Disc3, ExternalLink, Headphones, Search, X } from 'lucide-react';
import {
  MODERN_RNB_ARTISTS,
  MODERN_RNB_COPY,
  MODERN_RNB_DIRECTIONS,
  MODERN_RNB_PLAYLISTS,
  type ArtistVoiceTier,
  type ModernRnbArtist,
  type ModernRnbDirection,
  type ModernRnbPlaylist,
} from '../data/beatsRoomsData';
import { parseSpotifyUrl } from '../utils/spotify';

const STUDIO_HERO_ART = '/src/assets/images/modern_rnb_hero_studio_1795517065659.jpg';
const VINYL_STILL_ART = '/src/assets/images/modern_rnb_vinyl_mood_1795517065907.jpg';

interface ModernRnbSubsectionProps {
  activeSonicTrackId?: string;
  onPlayPlaylistInOrb?: (playlist: ModernRnbPlaylist) => void;
}

export function ModernRnbSubsection({
  activeSonicTrackId,
  onPlayPlaylistInOrb,
}: ModernRnbSubsectionProps) {
  const [selectedDirection, setSelectedDirection] = useState<'all' | ModernRnbDirection>('all');
  const [voiceFilter, setVoiceFilter] = useState<'all' | ArtistVoiceTier>('all');
  const [artistQuery, setArtistQuery] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState<string>(MODERN_RNB_ARTISTS[0].id);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(MODERN_RNB_PLAYLISTS[3].id); // Default to verified Fresh Finds R&B PDF link
  const [heroImageError, setHeroImageError] = useState(false);
  const [vinylImageError, setVinylImageError] = useState(false);

  const filteredArtists = useMemo(() => {
    const q = artistQuery.trim().toLowerCase();
    return MODERN_RNB_ARTISTS.filter((artist) => {
      const matchesDirection =
        selectedDirection === 'all' || artist.directions.includes(selectedDirection);
      const matchesTier = voiceFilter === 'all' || artist.tier === voiceFilter;
      const matchesQuery =
        !q ||
        artist.name.toLowerCase().includes(q) ||
        artist.soundProfile.toLowerCase().includes(q) ||
        artist.tierLabel.toLowerCase().includes(q);
      return matchesDirection && matchesTier && matchesQuery;
    });
  }, [artistQuery, selectedDirection, voiceFilter]);

  const activeArtist: ModernRnbArtist = useMemo(() => {
    return (
      MODERN_RNB_ARTISTS.find((a) => a.id === selectedArtistId) ??
      filteredArtists[0] ??
      MODERN_RNB_ARTISTS[0]
    );
  }, [filteredArtists, selectedArtistId]);

  const activePlaylist: ModernRnbPlaylist = useMemo(() => {
    const syncedFromOrb = MODERN_RNB_PLAYLISTS.find(
      (p) => `modern-rnb-${p.id}` === activeSonicTrackId
    );
    return (
      syncedFromOrb ??
      MODERN_RNB_PLAYLISTS.find((p) => p.id === selectedPlaylistId) ??
      MODERN_RNB_PLAYLISTS[0]
    );
  }, [activeSonicTrackId, selectedPlaylistId]);

  const parsedEmbed = useMemo(() => {
    if (!activePlaylist.spotifyEmbedUrl) return null;
    return parseSpotifyUrl(activePlaylist.spotifyEmbedUrl);
  }, [activePlaylist.spotifyEmbedUrl]);

  const isOrbSyncedToActivePlaylist =
    activeSonicTrackId === `modern-rnb-${activePlaylist.id}`;

  const establishedCount = useMemo(
    () => MODERN_RNB_ARTISTS.filter((a) => a.tier === 'established').length,
    []
  );
  const newerCount = useMemo(
    () => MODERN_RNB_ARTISTS.filter((a) => a.tier === 'newer').length,
    []
  );

  return (
    <div
      id="modern-rnb"
      className="relative rounded-3xl overflow-hidden bg-[#0B0D12] text-[#F4F1EC] border border-white/10 shadow-[0_32px_90px_-36px_rgba(9,9,11,0.75)]"
    >
      {/* Subtle Ambient Soft Lighting — warm amber ember & twilight slate */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(640px 420px at 84% 14%, rgba(226, 168, 107, 0.14), transparent 72%),
            radial-gradient(560px 380px at 12% 76%, rgba(148, 163, 184, 0.08), transparent 72%)
          `,
        }}
      />

      {/* Full-Width Artist & Studio Artwork Banner */}
      <div className="relative min-h-[340px] sm:min-h-[410px] flex flex-col justify-end border-b border-white/10">
        <div className="absolute inset-0 overflow-hidden">
          {heroImageError ? (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background:
                  'radial-gradient(circle at 70% 30%, rgba(226, 168, 107, 0.24), #0B0D12 68%)',
              }}
            >
              <Disc3 className="w-16 h-16 text-white/15" />
            </div>
          ) : (
            <img
              src={STUDIO_HERO_ART}
              alt="Softly lit nocturnal analog recording studio representing Modern R&B"
              referrerPolicy="no-referrer"
              onError={() => setHeroImageError(true)}
              className="w-full h-full object-cover object-center scale-[1.01] select-none"
            />
          )}
          {/* Measured dark scrims guaranteeing WCAG AA text legibility across the full width */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/68 to-[#0B0D12]/25"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#0B0D12]/90 via-[#0B0D12]/45 to-transparent"
          />
        </div>

        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-12 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium tracking-[0.12em] uppercase text-[#E2A86B]">
            <span>R&amp;B Room · Collection</span>
            <span aria-hidden="true">/</span>
            <span>Contemporary &amp; Alternative</span>
          </div>

          <h3 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white mt-3">
            {MODERN_RNB_COPY.collectionName}
          </h3>

          <p className="text-[15px] sm:text-base text-zinc-200 leading-relaxed mt-4 max-w-2xl tracking-[0.01em]">
            {MODERN_RNB_COPY.description}
          </p>

          <p className="text-xs text-zinc-400 mt-4 leading-relaxed max-w-xl">
            {MODERN_RNB_COPY.separationRule}
          </p>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 space-y-12">
        {/* Musical Direction Explorer */}
        <section aria-labelledby="modern-rnb-direction-heading">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-medium tracking-wider uppercase text-[#E2A86B]">
                Musical Direction
              </p>
              <h4
                id="modern-rnb-direction-heading"
                className="text-xl sm:text-2xl font-semibold text-white mt-1"
              >
                Ten threads shaping the sound right now
              </h4>
            </div>
            {selectedDirection !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedDirection('all')}
                className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/10 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear direction filter</span>
              </button>
            )}
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter Modern R&B by musical direction"
          >
            <button
              type="button"
              onClick={() => setSelectedDirection('all')}
              className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                selectedDirection === 'all'
                  ? 'bg-[#E2A86B] text-[#0B0D12] font-semibold'
                  : 'bg-[#141822] text-zinc-300 hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              All Directions
            </button>
            {MODERN_RNB_DIRECTIONS.map((dir) => {
              const active = selectedDirection === dir;
              return (
                <button
                  key={dir}
                  type="button"
                  onClick={() => setSelectedDirection(active ? 'all' : dir)}
                  className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    active
                      ? 'bg-[#E2A86B] text-[#0B0D12] font-semibold'
                      : 'bg-[#141822] text-zinc-300 hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  {dir}
                </button>
              );
            })}
          </div>
        </section>

        <div className="border-t border-white/10" />

        {/* Artists to Feature and Explore (All 25) */}
        <section aria-labelledby="modern-rnb-artists-heading">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6">
            <div className="max-w-2xl">
              <p className="text-xs font-medium tracking-wider uppercase text-[#E2A86B]">
                Artists to Feature and Explore
              </p>
              <h4
                id="modern-rnb-artists-heading"
                className="font-editorial text-2xl sm:text-3xl font-semibold text-white mt-1"
              >
                25 Contemporary &amp; Newer Voices
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
                A curated balance of established modern architects and newer R&amp;B voices — filtered honestly without mislabeling seasoned artists as emerging.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Interactive Voice Distinction Controls */}
              <div
                className="inline-flex items-center p-1 rounded-lg bg-[#141822] border border-white/10 self-start"
                role="tablist"
                aria-label="Filter artists by career stage"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={voiceFilter === 'all'}
                  onClick={() => setVoiceFilter('all')}
                  className={`px-3 py-1.5 min-h-[34px] rounded-md text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    voiceFilter === 'all'
                      ? 'bg-white text-[#0B0D12] font-semibold'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  All ({MODERN_RNB_ARTISTS.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={voiceFilter === 'established'}
                  onClick={() => setVoiceFilter('established')}
                  className={`px-3 py-1.5 min-h-[34px] rounded-md text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    voiceFilter === 'established'
                      ? 'bg-white text-[#0B0D12] font-semibold'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  Established ({establishedCount})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={voiceFilter === 'newer'}
                  onClick={() => setVoiceFilter('newer')}
                  className={`px-3 py-1.5 min-h-[34px] rounded-md text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    voiceFilter === 'newer'
                      ? 'bg-white text-[#0B0D12] font-semibold'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  Newer Voices ({newerCount})
                </button>
              </div>

              {/* Search */}
              <div className="relative min-w-[210px]">
                <Search
                  aria-hidden="true"
                  className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  type="search"
                  value={artistQuery}
                  onChange={(e) => setArtistQuery(e.target.value)}
                  placeholder="Search 25 artists..."
                  aria-label="Search Modern R&B artists"
                  className="w-full min-h-[40px] pl-9 pr-3 py-2 rounded-lg bg-[#141822] border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#E2A86B]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 7 columns: Interactive 25-Artist Index Grid */}
            <div className="lg:col-span-7">
              {filteredArtists.length === 0 ? (
                <div className="rounded-2xl bg-[#13161E] border border-white/10 p-8 text-center">
                  <p className="text-sm text-zinc-300">
                    No artists match the current filter combination.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDirection('all');
                      setVoiceFilter('all');
                      setArtistQuery('');
                    }}
                    className="mt-4 min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 text-white cursor-pointer transition-colors"
                  >
                    Reset artist filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredArtists.map((artist) => {
                    const isSelected = artist.id === activeArtist.id;
                    return (
                      <button
                        key={artist.id}
                        type="button"
                        onClick={() => setSelectedArtistId(artist.id)}
                        className={`text-left rounded-xl p-3.5 border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#1B1F2B] border-[#E2A86B]/70'
                            : 'bg-[#13161E] border-white/8 hover:border-white/20 hover:bg-[#161A24]'
                        }`}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex items-baseline gap-2.5 min-w-0">
                            <span className="font-data text-[11px] text-zinc-500 tabular-nums shrink-0">
                              {String(artist.index).padStart(2, '0')}
                            </span>
                            <span className="text-sm font-semibold text-white truncate">
                              {artist.name}
                            </span>
                          </div>
                          <span
                            className={`text-[11px] whitespace-nowrap shrink-0 ${
                              artist.tier === 'newer' ? 'text-[#E2A86B]' : 'text-zinc-400'
                            }`}
                          >
                            {artist.tier === 'newer' ? 'Newer Voice' : 'Established'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1.5 line-clamp-1">
                          {artist.directions.join(' · ')}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right 5 columns: Artist Spotlight Monograph Panel */}
            <div className="lg:col-span-5">
              <AnimatePresence mode="wait">
                <motion.aside
                  key={activeArtist.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-2xl bg-[#13161E] border border-white/10 p-6 sm:p-7 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 text-xs text-zinc-400">
                      <span className="font-data tabular-nums">
                        Artist {String(activeArtist.index).padStart(2, '0')} / 25
                      </span>
                      <span
                        className={
                          activeArtist.tier === 'newer' ? 'text-[#E2A86B] font-medium' : 'text-zinc-300'
                        }
                      >
                        {activeArtist.tierLabel}
                      </span>
                    </div>

                    <h5 className="font-editorial text-3xl font-semibold text-white mt-3">
                      {activeArtist.name}
                    </h5>

                    <p className="text-xs text-zinc-400 mt-2">
                      {activeArtist.directions.join(' · ')}
                    </p>

                    <div className="mt-5 pt-5 border-t border-white/10 space-y-4">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                          Sonic Texture
                        </p>
                        <p className="text-sm text-zinc-200 mt-1 leading-relaxed">
                          {activeArtist.soundProfile}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                          Why Explore
                        </p>
                        <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                          {activeArtist.editorialNote}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-zinc-400 inline-flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5 text-[#E2A86B]" />
                      Explore catalog
                    </span>
                    <a
                      href={activeArtist.spotifySearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg text-xs font-semibold bg-[#E2A86B] text-[#0B0D12] hover:bg-[#eab984] whitespace-nowrap shrink-0 transition-colors"
                    >
                      <span>Open on Spotify</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.aside>
              </AnimatePresence>
            </div>
          </div>
        </section>

        <div className="border-t border-white/10" />

        {/* Immersive Playlist Presentation — All 7 Preserved PDF Playlists */}
        <section aria-labelledby="modern-rnb-playlists-heading">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div className="max-w-2xl">
              <p className="text-xs font-medium tracking-wider uppercase text-[#E2A86B]">
                Modern R&amp;B Playlist Research — Links Preserved
              </p>
              <h4
                id="modern-rnb-playlists-heading"
                className="font-editorial text-2xl sm:text-3xl font-semibold text-white mt-1"
              >
                Seven Curated Modern R&amp;B Destinations
              </h4>
            </div>
            <p className="text-xs text-zinc-400 whitespace-nowrap">
              Select a playlist to preview · 7 preserved links
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 7 columns: Preserved 7 Playlist List with Explicit Open Link */}
            <div className="lg:col-span-7 space-y-2.5">
              {MODERN_RNB_PLAYLISTS.map((playlist) => {
                const isSelected = playlist.id === activePlaylist.id;
                return (
                  <div
                    key={playlist.id}
                    className={`rounded-xl p-4 border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#1B1F2B] border-[#E2A86B]/70'
                        : 'bg-[#13161E] border-white/8 hover:border-white/20'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlaylistId(playlist.id);
                        onPlayPlaylistInOrb?.(playlist);
                      }}
                      className="text-left flex-1 min-w-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E2A86B] rounded-md"
                    >
                      <div className="flex items-center gap-2.5 text-xs text-zinc-400">
                        <span className="font-data tabular-nums text-[#E2A86B]">
                          {playlist.index}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{playlist.platform}</span>
                        {activeSonicTrackId === `modern-rnb-${playlist.id}` && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-data text-[10px] uppercase tracking-wider text-[#38BDF8]">
                              In Sonic Orb
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-base font-semibold text-white mt-0.5 truncate">
                        {playlist.title}
                      </p>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 leading-snug">
                        {playlist.subtitle}
                      </p>
                    </button>

                    <a
                      href={playlist.openLinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/8 hover:bg-[#E2A86B] hover:text-[#0B0D12] border border-white/12 whitespace-nowrap shrink-0 transition-colors self-start sm:self-center"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>

            {/* Right 5 columns: Companion Spotlight Card Linked to the Unified 3D Sonic Orb Player */}
            <div className="lg:col-span-5 flex flex-col rounded-2xl bg-[#13161E] border border-white/10 overflow-hidden">
              <div className="relative h-56 overflow-hidden border-b border-white/10">
                {vinylImageError ? (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background:
                        'radial-gradient(circle at 60% 40%, rgba(255, 107, 26, 0.22), #13161E 75%)',
                    }}
                  >
                    <Disc3 className="w-10 h-10 text-white/20" />
                  </div>
                ) : (
                  <img
                    src={VINYL_STILL_ART}
                    alt="Dark vinyl record illuminated by soft amber lighting"
                    referrerPolicy="no-referrer"
                    onError={() => setVinylImageError(true)}
                    className="w-full h-full object-cover object-center"
                  />
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#13161E] via-[#13161E]/55 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-[#E2A86B]">
                    Selected Destination · {activePlaylist.platform}
                  </p>
                  <h5 className="font-editorial text-2xl font-semibold text-white mt-0.5">
                    {activePlaylist.title}
                  </h5>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <p className="text-sm text-zinc-200 leading-relaxed">
                    {activePlaylist.subtitle}
                  </p>
                  {activePlaylist.previewNote && (
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {activePlaylist.previewNote}
                    </p>
                  )}

                  <div className="pt-3 border-t border-white/10">
                    <p className="font-data text-[10px] uppercase tracking-wider text-zinc-500">
                      Directions in Rotation
                    </p>
                    <p className="text-xs text-zinc-300 mt-1">
                      {activePlaylist.directions.join(' · ')}
                    </p>
                  </div>

                  {parsedEmbed?.canonicalUrl && (
                    <p className="text-[11px] text-zinc-400">
                      Plays directly inside the unified BEATS 3D Sonic Orb player above without leaving this room.
                    </p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onPlayPlaylistInOrb?.(activePlaylist);
                      const stage = document.getElementById('beats-sonic-stage');
                      stage?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`inline-flex items-center justify-center gap-2 w-full min-h-[42px] px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      isOrbSyncedToActivePlaylist
                        ? 'bg-[#0EA5FF] text-[#07090E] hover:bg-[#38BDF8]'
                        : 'bg-[#FF6B1A] text-[#07090E] hover:bg-[#ff7f38]'
                    }`}
                  >
                    <Headphones className="w-4 h-4" />
                    <span>
                      {isOrbSyncedToActivePlaylist
                        ? 'Loaded in Sonic Orb Stage'
                        : 'Send to Sonic Orb Player'}
                    </span>
                  </button>

                  <a
                    href={activePlaylist.openLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full min-h-[42px] px-4 py-2 rounded-lg text-xs font-semibold bg-white/8 text-white hover:bg-[#E2A86B] hover:text-[#0B0D12] border border-white/12 transition-colors"
                  >
                    <span>Open {activePlaylist.title} Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Verbatim Editorial Research Note from PDF Page 2 */}
          <div className="mt-6 rounded-xl bg-[#13161E] border border-white/10 p-4 sm:p-5">
            <p className="text-xs font-medium text-zinc-300 leading-relaxed">
              <span className="text-[#E2A86B] font-semibold">Editorial Research Note:</span>{' '}
              {MODERN_RNB_COPY.editorialResearchNote}
            </p>
          </div>
        </section>

        {/* Closing Statement (PDF Page 14) */}
        <footer className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400">
          <p className="font-medium text-zinc-200">{MODERN_RNB_COPY.tagline}</p>
          <span className="font-data tabular-nums text-zinc-500">
            25 Artists · 7 Playlists · 10 Directions
          </span>
        </footer>
      </div>
    </div>
  );
}
