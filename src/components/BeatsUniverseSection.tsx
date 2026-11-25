import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Disc, ExternalLink, Headphones, Play } from 'lucide-react';
import {
  BEATS_ROOMS,
  CLASSIC_RNB_CRATES,
  OTHER_ROOMS_CONTENT,
  type BeatsRoomKey,
  type ModernRnbPlaylist,
} from '../data/beatsRoomsData';
import { buildBeatsSonicQueue } from '../utils/beatsQueueBuilder';
import { parseSpotifyUrl } from '../utils/spotify';
import { BeatsSonicPlayer } from './player/BeatsSonicPlayer';
import { ModernRnbSubsection } from './ModernRnbSubsection';

type RnbShelfFilter = 'separated' | 'modern' | 'classic';

export function BeatsUniverseSection() {
  const [activeRoom, setActiveRoom] = useState<BeatsRoomKey>('rnb');
  const [rnbShelf, setRnbShelf] = useState<RnbShelfFilter>('separated');

  const sonicQueue = useMemo(() => buildBeatsSonicQueue(), []);
  const [activeTrackId, setActiveTrackId] = useState<string>('modern-rnb-fresh-finds-rnb');

  const activeRoomMeta =
    BEATS_ROOMS.find((room) => room.key === activeRoom) ?? BEATS_ROOMS[1];

  const handlePlayModernPlaylist = useCallback((playlist: ModernRnbPlaylist) => {
    setActiveTrackId(`modern-rnb-${playlist.id}`);
  }, []);

  const handlePlayRoomItem = useCallback((roomKey: Exclude<BeatsRoomKey, 'rnb'>, itemId: string) => {
    setActiveTrackId(`room-${roomKey}-${itemId}`);
    const stage = document.getElementById('beats-sonic-stage');
    stage?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <section
      id="beats-universe"
      aria-labelledby="beats-universe-heading"
      className="py-20 md:py-24 border-t border-white/10 bg-[#06080C] text-[#F4F2EE]"
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6">
        {/* BEATS Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="font-data text-xs font-semibold uppercase tracking-[0.16em] text-[#FF6B1A] mb-3">
              BEATS · Six Musical Rooms
            </p>
            <h2
              id="beats-universe-heading"
              className="font-editorial text-3xl sm:text-5xl font-semibold tracking-tight text-white"
            >
              Rooms Built Around Sound &amp; Rotation
            </h2>
            <p className="text-base text-zinc-400 leading-relaxed mt-3">
              Six curated musical rooms kept distinct by sound and era — enter through Rap, step into Modern R&amp;B inside the R&amp;B room, or settle into African Music, Piano, Lo-Fi, and Study sessions.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300 whitespace-nowrap shrink-0">
            <Headphones className="w-4 h-4 text-[#0EA5FF]" />
            <span>Active Room · {activeRoomMeta.label}</span>
          </div>
        </div>

        {/* Unified Centerpiece 3D Sonic Orb Player */}
        <div id="beats-sonic-stage">
          <BeatsSonicPlayer
            queue={sonicQueue}
            activeTrackId={activeTrackId}
            onSelectTrack={setActiveTrackId}
          />
        </div>

        {/* 6 Existing Musical Rooms Navigation */}
        <div
          role="tablist"
          aria-label="BEATS musical rooms"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8 border-b border-white/10"
        >
          {BEATS_ROOMS.map((room) => {
            const isActive = room.key === activeRoom;
            return (
              <button
                key={room.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveRoom(room.key)}
                className={`inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#FF6B1A] text-[#06080C]'
                    : 'bg-[#0E121B] text-zinc-300 border border-white/10 hover:border-[#0EA5FF]/45 hover:text-white'
                }`}
              >
                <span
                  className={`font-data text-[11px] tabular-nums ${
                    isActive ? 'text-[#06080C]/75' : 'text-zinc-500'
                  }`}
                >
                  {room.number}
                </span>
                <span>{room.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Room Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRoom}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeRoom === 'rnb' ? (
              <div className="space-y-10">
                {/* R&B Room Identity Header + Intentional Separation Controls */}
                <div className="rounded-2xl bg-[#0C1018] border border-white/10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      <span className="font-data text-[#0EA5FF]">02 · R&amp;B Room</span>
                      <span aria-hidden="true">/</span>
                      <span>Heritage &amp; Contemporary</span>
                    </div>
                    <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-white mt-2">
                      Two Distinct Shelves: Classic R&amp;B Crates &amp; Modern R&amp;B
                    </h3>
                    <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                      Modern R&amp;B carries its own editorial identity inside the R&amp;B room and is intentionally kept separate from 90s classics, 2000s slow jams, and traditional soul.
                    </p>
                  </div>

                  <div
                    className="inline-flex items-center p-1 rounded-xl bg-[#07090E] border border-white/10 self-start lg:self-auto shrink-0"
                    role="tablist"
                    aria-label="R&B room shelf view"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={rnbShelf === 'separated'}
                      onClick={() => setRnbShelf('separated')}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                        rnbShelf === 'separated'
                          ? 'bg-white text-[#06080C]'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Modern + Classic (Separated)
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={rnbShelf === 'modern'}
                      onClick={() => setRnbShelf('modern')}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                        rnbShelf === 'modern'
                          ? 'bg-white text-[#06080C]'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Modern R&amp;B Only
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={rnbShelf === 'classic'}
                      onClick={() => setRnbShelf('classic')}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                        rnbShelf === 'classic'
                          ? 'bg-white text-[#06080C]'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      90s · 2000s · Soul
                    </button>
                  </div>
                </div>

                {/* Distinctive Subsection: MODERN R&B (Priority 1) */}
                {(rnbShelf === 'separated' || rnbShelf === 'modern') && (
                  <ModernRnbSubsection
                    activeSonicTrackId={activeTrackId}
                    onPlayPlaylistInOrb={handlePlayModernPlaylist}
                  />
                )}

                {/* Clearly Separated Shelf: 90s Classics, 2000s Slow Jams & Traditional Soul */}
                {(rnbShelf === 'separated' || rnbShelf === 'classic') && (
                  <div className="pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
                      <div>
                        <p className="font-data text-xs font-semibold uppercase tracking-wider text-[#0EA5FF]">
                          Separated Classic Shelf · Heritage R&amp;B &amp; Soul
                        </p>
                        <h4 className="font-editorial text-xl sm:text-2xl font-semibold text-white mt-1">
                          90s Classics, 2000s Slow Jams &amp; Traditional Soul
                        </h4>
                      </div>
                      <span className="text-xs text-zinc-500">
                        Kept separate from Modern R&amp;B
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {CLASSIC_RNB_CRATES.map((crate) => (
                        <article
                          key={crate.id}
                          className="rounded-2xl bg-[#0C1018] border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 transition-colors"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
                              <span className="font-data font-semibold text-[#FF6B1A]">
                                {crate.era}
                              </span>
                              <Disc className="w-4 h-4 text-zinc-600" />
                            </div>
                            <h5 className="text-lg font-bold text-white mt-2">
                              {crate.title}
                            </h5>
                            <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                              {crate.sound}
                            </p>
                            <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                              {crate.description}
                            </p>
                          </div>

                          <div className="mt-5 pt-4 border-t border-white/10">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                              Cornerstone Voices
                            </p>
                            <p className="text-xs font-medium text-zinc-200">
                              {crate.anchors.join(' · ')}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Intact Original Musical Rooms (RAP, AFRICAN MUSIC, CLASSICAL & PIANO, LO-FI, STUDY MUSIC) */
              <div className="space-y-6">
                <div className="rounded-2xl bg-[#0C1018] border border-white/10 p-6 sm:p-8">
                  <p className="font-data text-xs font-semibold uppercase tracking-wider text-[#0EA5FF]">
                    {activeRoomMeta.number} · {activeRoomMeta.label}
                  </p>
                  <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-white mt-1.5">
                    {activeRoomMeta.subtitle}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5">
                    {activeRoomMeta.accentNote}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {OTHER_ROOMS_CONTENT[activeRoom].map((item) => {
                    const parsed = item.spotifyUrl ? parseSpotifyUrl(item.spotifyUrl) : null;
                    const roomTrackId = `room-${activeRoom}-${item.id}`;
                    const isActiveInOrb = activeTrackId === roomTrackId;

                    return (
                      <article
                        key={item.id}
                        className={`rounded-2xl p-6 flex flex-col justify-between border transition-colors ${
                          isActiveInOrb
                            ? 'bg-[#111724] border-[#FF6B1A]/75'
                            : 'bg-[#0C1018] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-medium text-zinc-400">
                                {item.subtitle}
                              </p>
                              <h4 className="text-xl font-bold text-white mt-1">
                                {item.title}
                              </h4>
                            </div>
                            {parsed?.canonicalUrl && (
                              <a
                                href={parsed.canonicalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0EA5FF] hover:underline whitespace-nowrap shrink-0"
                              >
                                <span>Spotify</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>

                          <p className="text-sm text-zinc-300 mt-2.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {parsed?.valid && (
                          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                            <span className="font-data text-[11px] text-zinc-500">
                              {isActiveInOrb ? 'Loaded in Sonic Orb' : 'Unified BEATS Stage'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handlePlayRoomItem(activeRoom, item.id)}
                              className={`inline-flex items-center gap-1.5 min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                                isActiveInOrb
                                  ? 'bg-[#0EA5FF] text-[#06080C]'
                                  : 'bg-[#FF6B1A] text-[#06080C] hover:bg-[#ff7f38]'
                              }`}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>
                                {isActiveInOrb ? 'Active in Sonic Orb' : 'Play in Sonic Orb'}
                              </span>
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
