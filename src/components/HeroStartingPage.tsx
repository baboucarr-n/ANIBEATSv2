import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import {
  AfricanPattern3D,
  type HeroAuraKey,
  type HeroWorldKey,
} from './three/AfricanPattern3D';

interface WorldPillar {
  key: HeroWorldKey;
  index: string;
  label: string;
  title: string;
  note: string;
  defaultAura: Exclude<HeroAuraKey, 'auto'>;
  underlineClass: string;
}

const WORLD_PILLARS: WorldPillar[] = [
  {
    key: 'anime',
    index: '01',
    label: 'Anime',
    title: 'Stories & visuals that stay with me',
    note: 'From Attack on Titan to Cyberpunk: Edgerunners — the worlds, frames, and soundtracks that shaped my taste.',
    defaultAura: 'lavender',
    underlineClass: 'bg-[#9F8FEF]',
  },
  {
    key: 'rap',
    index: '02',
    label: 'Rap',
    title: 'Verses I keep on replay',
    note: 'Sharp writing, late-night storytelling, and records that hit harder every single time you listen back.',
    defaultAura: 'cyan',
    underlineClass: 'bg-[#4ABBD0]',
  },
  {
    key: 'beats',
    index: '03',
    label: 'Beats',
    title: 'Production, drums & anime OSTs',
    note: 'Where orchestral anime tension meets heavy basslines, clean bounce, and headphones-only focus.',
    defaultAura: 'peach',
    underlineClass: 'bg-[#E59D73]',
  },
  {
    key: 'cars',
    index: '04',
    label: 'Cars',
    title: 'Midnight silhouettes & dream builds',
    note: 'JDM icons, clean lines, and the playlists built specifically for empty roads after dark.',
    defaultAura: 'mint',
    underlineClass: 'bg-[#4CB792]',
  },
  {
    key: 'travel',
    index: '05',
    label: 'Travel',
    title: '80 places I want to stand in',
    note: 'Tokyo streets at sunrise, coastal drives, and every stamp still waiting on my bucket list.',
    defaultAura: 'lavender',
    underlineClass: 'bg-[#8F80EA]',
  },
];

const AURA_CONFIG: Record<
  Exclude<HeroAuraKey, 'auto'>,
  {
    label: string;
    swatchHex: string;
    motifTintHex: string;
    glowTopLeft: string;
    glowRight: string;
    glowBottomLeft: string;
  }
> = {
  lavender: {
    label: 'Calm Lavender Aura',
    swatchHex: '#DDD4FA',
    motifTintHex: '#8E7CE0',
    glowTopLeft: 'rgba(216, 206, 248, 0.55)',
    glowRight: 'rgba(194, 238, 246, 0.45)',
    glowBottomLeft: 'rgba(250, 219, 199, 0.36)',
  },
  cyan: {
    label: 'Calm Cyan Aura',
    swatchHex: '#C2EEF6',
    motifTintHex: '#43AFC5',
    glowTopLeft: 'rgba(194, 238, 246, 0.58)',
    glowRight: 'rgba(200, 242, 227, 0.46)',
    glowBottomLeft: 'rgba(216, 206, 248, 0.36)',
  },
  peach: {
    label: 'Calm Peach Aura',
    swatchHex: '#FADBC7',
    motifTintHex: '#DF956B',
    glowTopLeft: 'rgba(250, 219, 199, 0.58)',
    glowRight: 'rgba(216, 206, 248, 0.42)',
    glowBottomLeft: 'rgba(200, 242, 227, 0.38)',
  },
  mint: {
    label: 'Calm Mint Aura',
    swatchHex: '#C8F2E3',
    motifTintHex: '#4BAE8C',
    glowTopLeft: 'rgba(200, 242, 227, 0.58)',
    glowRight: 'rgba(194, 238, 246, 0.46)',
    glowBottomLeft: 'rgba(216, 206, 248, 0.36)',
  },
};

const NAV_PATTERN_TILES = [
  '/assets/aistudio/image_a450befa.png',
  '/assets/aistudio/image_9b91b926.png',
  '/assets/aistudio/image_742341cc.png',
  '/assets/aistudio/Afrucan-design-patttern_a5bacfb5.jfif',
  '/assets/aistudio/Beautiful-ad-pattern_47c27c29.jfif',
  '/assets/aistudio/AD-pattern_e6824c29.jfif',
  '/assets/aistudio/image_7b768cce.png',
];

/** Small stylized African Mask brand mark inspired by image_e71aa317.png */
function AfricanMaskMark() {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className="w-7 h-7 shrink-0"
    >
      {/* Elongated oval shield silhouette */}
      <path
        d="M14 2.2C9.2 2.2 6.5 6.1 6.5 11.4C6.5 17.5 9.6 25.4 14 25.8C18.4 25.4 21.5 17.5 21.5 11.4C21.5 6.1 18.8 2.2 14 2.2Z"
        fill="#EDE8FD"
        stroke="#18181B"
        strokeWidth="1.5"
      />
      {/* Carved brow line & subtle crown notches */}
      <path
        d="M7.8 9.2H20.2M11 4.2V6.1M14 3.7V6.1M17 4.2V6.1"
        stroke="#18181B"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      {/* Serene almond eyes */}
      <path
        d="M8.9 12.2C9.8 11.2 11.3 11.2 12.2 12.2C11.3 13.2 9.8 13.2 8.9 12.2Z"
        fill="#FFFFFF"
        stroke="#18181B"
        strokeWidth="1.2"
      />
      <circle cx="10.55" cy="12.2" r="0.65" fill="#18181B" />
      <path
        d="M15.8 12.2C16.7 11.2 18.2 11.2 19.1 12.2C18.2 13.2 16.7 13.2 15.8 12.2Z"
        fill="#FFFFFF"
        stroke="#18181B"
        strokeWidth="1.2"
      />
      <circle cx="17.45" cy="12.2" r="0.65" fill="#18181B" />
      {/* Vertical nose bridge & geometric mouth */}
      <path
        d="M14 10.6V16.8M11.6 20.1C12.4 19.3 15.6 19.3 16.4 20.1C15.4 21.1 12.6 21.1 11.6 20.1Z"
        stroke="#18181B"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Tiny sculpted African eye crest for the integrated story spotlight card */
function AfricanEyeCrest({ accentHex }: { accentHex: string }) {
  return (
    <svg
      viewBox="0 0 28 16"
      fill="none"
      aria-hidden="true"
      className="w-6 h-3.5 shrink-0"
    >
      <path
        d="M2 8C6 2.5 22 2.5 26 8C22 13.5 6 13.5 2 8Z"
        fill={accentHex}
        fillOpacity="0.35"
        stroke="#18181B"
        strokeWidth="1.25"
      />
      <circle cx="14" cy="8" r="2.3" fill="#18181B" />
    </svg>
  );
}

interface HeroStartingPageProps {
  onEnterAnime?: () => void;
  onEnterBeats?: () => void;
}

export function HeroStartingPage({ onEnterAnime, onEnterBeats }: HeroStartingPageProps = {}) {
  const [selectedKey, setSelectedKey] = useState<HeroWorldKey>('anime');
  const [auraOverride, setAuraOverride] = useState<HeroAuraKey>('auto');
  const [motionPaused, setMotionPaused] = useState(false);

  const activeIndex = WORLD_PILLARS.findIndex((p) => p.key === selectedKey);
  const activePillar = WORLD_PILLARS[activeIndex >= 0 ? activeIndex : 0];

  const effectiveAuraKey: Exclude<HeroAuraKey, 'auto'> =
    auraOverride === 'auto' ? activePillar.defaultAura : auraOverride;
  const activeAura = AURA_CONFIG[effectiveAuraKey];

  const handleSelectWorld = (key: HeroWorldKey) => {
    setSelectedKey(key);
    setAuraOverride('auto');
  };

  const handleStepWorld = (dir: 1 | -1) => {
    const nextIdx = (activeIndex + dir + WORLD_PILLARS.length) % WORLD_PILLARS.length;
    handleSelectWorld(WORLD_PILLARS[nextIdx].key);
  };

  return (
    <div className="relative w-full min-h-[100dvh] overflow-hidden bg-[#FAF6F1] text-zinc-950 flex flex-col justify-between selection:bg-[#DDD4FA] selection:text-zinc-950">
      {/* Inline SVG color-matrix filter that strips white background and recolors the African motif artwork cleanly into calm pastel ink (zero brown) */}
      <svg className="sr-only" aria-hidden="true" width="0" height="0">
        <defs>
          <filter id="african-motif-pastel" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 0 0
                -0.36 -0.54 -0.20 1.02 0
              "
              result="inkAlpha"
            />
            <feFlood floodColor={activeAura.motifTintHex} floodOpacity="1" result="pastelColor" />
            <feComposite in="pastelColor" in2="inkAlpha" operator="in" />
          </filter>
        </defs>
      </svg>

      {/* LAYER 1: Attached Portrait — kept 100% intact and unobstructed */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/assets/aistudio/image_f89375b5.png"
          alt="Baboucarr wearing headphones listening to music in front of geometric wall reliefs"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-[50%_58%] md:object-[50%_72%] select-none"
        />
        {/* Soft ivory top wash on smaller viewports so upper copy remains crisp above portrait */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-[#FAF6F1]/88 via-[#FAF6F1]/40 to-transparent md:from-[#FAF6F1]/50 md:via-[#FAF6F1]/10 md:h-[28%]"
        />
        {/* Subtle left legibility mist safely clear of center portrait */}
        <div
          aria-hidden="true"
          className="hidden md:block absolute inset-y-0 left-0 w-[39%] bg-gradient-to-r from-[#FAF6F1]/74 via-[#FAF6F1]/30 to-transparent"
        />
      </div>

      {/* LAYER 2A: Calm Pastel Ambient Glow + Integrated African Ink Relief Etching (image_e71aa317.png) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-5 pointer-events-none transition-all duration-700"
        style={{
          backgroundImage: `
            radial-gradient(520px 380px at 14% 22%, ${activeAura.glowTopLeft}, transparent 72%),
            radial-gradient(540px 420px at 88% 30%, ${activeAura.glowRight}, transparent 72%),
            radial-gradient(460px 340px at 16% 84%, ${activeAura.glowBottomLeft}, transparent 74%)
          `,
          maskImage:
            'radial-gradient(ellipse 30% 60% at 50% 67%, transparent 45%, rgba(0,0,0,0.65) 75%, black 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 30% 60% at 50% 67%, transparent 45%, rgba(0,0,0,0.65) 75%, black 100%)',
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          maskImage:
            'radial-gradient(ellipse 33% 64% at 50% 67%, transparent 48%, rgba(0, 0, 0, 0.52) 76%, rgba(0, 0, 0, 0.96) 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 33% 64% at 50% 67%, transparent 48%, rgba(0, 0, 0, 0.52) 76%, rgba(0, 0, 0, 0.96) 100%)',
        }}
      >
        <img
          src="/assets/aistudio/image_e71aa317.png"
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-[0.2] select-none transition-opacity duration-500"
          style={{ filter: 'url(#african-motif-pastel)' }}
        />
      </div>

      {/* LAYER 2B: Subtle Three.js 3D African Geometric Relief Boxes (Calm Lavender, Cyan, Peach, Mint) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 pointer-events-none opacity-72"
        style={{
          maskImage:
            'radial-gradient(ellipse 32% 62% at 50% 67%, transparent 47%, rgba(0, 0, 0, 0.45) 75%, rgba(0, 0, 0, 0.92) 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 32% 62% at 50% 67%, transparent 47%, rgba(0, 0, 0, 0.45) 75%, rgba(0, 0, 0, 0.92) 100%)',
        }}
      >
        <AfricanPattern3D
          activeWorld={selectedKey}
          auraOverride={auraOverride}
          paused={motionPaused}
        />
      </div>

      {/* LAYER 3A: Minimal 3-Zone Top Navigation Bar with Seamless 7-Tile African Pattern Marquee */}
      <header className="nav-bar-hover-pause relative z-30 w-full h-16 overflow-hidden border-b border-zinc-900/15">
        {/* Seamless 25s left-moving tile marquee — 100% pop, full color, sharp, no fade, pauses on hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          <div className="nav-marquee-track flex h-full w-max">
            {[0, 1, 2, 3].map((copyIdx) => (
              <div key={copyIdx} className="flex h-full shrink-0">
                {NAV_PATTERN_TILES.map((src, tileIdx) => (
                  <div key={`${copyIdx}-${tileIdx}`} className="h-full w-[144px] sm:w-[164px] shrink-0">
                    <img
                      src={src}
                      alt=""
                      loading="eager"
                      draggable={false}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center select-none"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 h-full flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark with African Mask Emblem on 85% translucent white blur pill */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleSelectWorld('anime');
            }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-zinc-900/10 text-[15px] font-extrabold tracking-tight text-zinc-950 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:outline-offset-4"
          >
            <AfricanMaskMark />
            <span>ANIBEATS</span>
          </a>

          {/* Zone 2: Clean Single-Line World Selectors on 85% translucent white blur pill */}
          <nav
            aria-label="Worlds preview"
            className="hidden md:flex items-center gap-6 px-5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-zinc-900/10"
          >
            {WORLD_PILLARS.map((pillar) => {
              const isActive = pillar.key === selectedKey;
              return (
                <button
                  key={pillar.key}
                  type="button"
                  onClick={() => {
                    handleSelectWorld(pillar.key);
                    if (pillar.key === 'anime' && onEnterAnime) {
                      onEnterAnime();
                    } else if (pillar.key === 'beats' && onEnterBeats) {
                      onEnterBeats();
                    }
                  }}
                  className={`relative py-1 text-sm whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:outline-offset-4 rounded-xs ${
                    isActive
                      ? 'text-zinc-950 font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 font-medium'
                  }`}
                >
                  {pillar.label}
                  {isActive && (
                    <motion.span
                      layoutId="heroWorldUnderline"
                      transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                      className={`absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full ${pillar.underlineClass}`}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                if (selectedKey === 'beats' && onEnterBeats) {
                  onEnterBeats();
                } else if (onEnterAnime) {
                  onEnterAnime();
                } else {
                  handleStepWorld(1);
                }
              }}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-full text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:outline-offset-2"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* LAYER 3B: Hero Starting Content — framed cleanly in open wall margins */}
      <main className="relative z-20 flex-1 max-w-[1360px] w-full mx-auto px-5 sm:px-8 lg:px-12 pt-8 pb-8 md:pt-12 md:pb-10 flex flex-col justify-between">
        {/* Top-Left Editorial Intro (stays safely left/above center portrait) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[395px] sm:max-w-[435px]"
        >
          <p className="text-xs font-medium tracking-wide text-zinc-700 mb-3">
            Baboucarr · ANIBEATS
          </p>

          <h1 className="text-[2.15rem] sm:text-[2.75rem] lg:text-[3.2rem] font-extrabold tracking-[-0.035em] leading-[1.04] text-zinc-950">
            Headphones on. Everything that moves me, in one place.
          </h1>

          <p className="text-[14.5px] sm:text-[15px] leading-[1.65] text-zinc-700 mt-4 max-w-[390px]">
            What began as a class assignment grew into my personal corner online — part anime archive, part rap and beat journal, part dream garage, and an 80-stop map of where I want to go.
          </p>

          {/* Integrated Studio Vibe & Chapter Dock (replaces boxy buttons) */}
          <div className="mt-6 inline-flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#FAF6F1]/82 backdrop-blur-md border border-zinc-900/10 shadow-[0_12px_30px_-18px_rgba(24,24,27,0.12)]">
            <button
              type="button"
              onClick={() => handleStepWorld(1)}
              className="group inline-flex items-center gap-2.5 min-h-[40px] pl-4 pr-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:outline-offset-2"
            >
              {/* Subtle animated soundwave cadence bars */}
              <span aria-hidden="true" className="inline-flex items-end gap-[2px] h-3">
                <span
                  className={`w-[2px] rounded-full bg-[#DDD4FA] transition-all duration-300 ${
                    motionPaused ? 'h-1.5' : 'h-2.5 group-hover:h-3'
                  }`}
                />
                <span
                  className={`w-[2px] rounded-full bg-[#C2EEF6] transition-all duration-300 ${
                    motionPaused ? 'h-2.5' : 'h-3 group-hover:h-1.5'
                  }`}
                />
                <span
                  className={`w-[2px] rounded-full bg-[#FADBC7] transition-all duration-300 ${
                    motionPaused ? 'h-1.5' : 'h-2 group-hover:h-3'
                  }`}
                />
              </span>
              <span>Inside the 5 Worlds</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
            </button>

            <div className="h-5 w-px bg-zinc-900/10 mx-0.5" aria-hidden="true" />

            {/* Tactile Calm Pastel Aura Switchers */}
            <div className="inline-flex items-center gap-1.5 px-1" role="group" aria-label="Pattern aura color">
              {(['lavender', 'cyan', 'peach', 'mint'] as const).map((auraKey) => {
                const isSelected = effectiveAuraKey === auraKey;
                const cfg = AURA_CONFIG[auraKey];
                return (
                  <button
                    key={auraKey}
                    type="button"
                    onClick={() => setAuraOverride(auraKey)}
                    aria-label={cfg.label}
                    aria-pressed={isSelected}
                    title={cfg.label}
                    className={`relative w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-zinc-900 ${
                      isSelected
                        ? 'scale-105 ring-1 ring-zinc-900/35 bg-white/80'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="w-3.5 h-3.5 rounded-[4px] rotate-45 border border-zinc-900/15"
                      style={{ backgroundColor: cfg.swatchHex }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Quiet Motion Control Integrated Smoothly */}
            <button
              type="button"
              onClick={() => setMotionPaused((prev) => !prev)}
              aria-label={motionPaused ? 'Resume 3D relief motion' : 'Pause 3D relief motion'}
              aria-pressed={motionPaused}
              title={motionPaused ? 'Resume 3D relief motion' : 'Pause 3D relief motion'}
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-zinc-700 hover:text-zinc-950 hover:bg-zinc-900/5 cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-zinc-900"
            >
              {motionPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>
        </motion.div>

        {/* Bottom-Right Interactive World Spotlight Card (keeps center portrait unobstructed) */}
        <div className="mt-auto pt-10 md:pt-0 flex flex-col md:items-end gap-3">
          {/* Mobile world selector strip */}
          <div
            role="tablist"
            aria-label="Choose world preview"
            className="flex md:hidden items-center gap-1.5 overflow-x-auto no-scrollbar p-1 rounded-xl bg-[#FAF6F1]/85 backdrop-blur-md border border-zinc-900/10 self-start"
          >
            {WORLD_PILLARS.map((pillar) => {
              const active = pillar.key === selectedKey;
              return (
                <button
                  key={pillar.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    handleSelectWorld(pillar.key);
                    if (pillar.key === 'anime' && onEnterAnime) {
                      onEnterAnime();
                    } else if (pillar.key === 'beats' && onEnterBeats) {
                      onEnterBeats();
                    }
                  }}
                  className={`px-3 py-2 min-h-[38px] rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 ${
                    active
                      ? 'bg-zinc-950 text-white'
                      : 'text-zinc-700 hover:text-zinc-950'
                  }`}
                >
                  {pillar.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.aside
              key={activePillar.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="w-full md:w-[335px] rounded-2xl bg-[#FAF6F1]/86 backdrop-blur-md border border-zinc-900/10 p-5 shadow-[0_18px_40px_-20px_rgba(24,24,27,0.12)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs font-medium text-zinc-600 tabular-nums">
                  <AfricanEyeCrest accentHex={activeAura.swatchHex} />
                  <span>{activePillar.index} / 05</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-zinc-950 font-semibold">{activePillar.label}</span>
                </div>

                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStepWorld(-1)}
                    aria-label="Previous world preview"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-zinc-700 hover:text-zinc-950 hover:bg-zinc-900/5 cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepWorld(1)}
                    aria-label="Next world preview"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-zinc-700 hover:text-zinc-950 hover:bg-zinc-900/5 cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h2 className="text-base font-bold text-zinc-950 mt-2.5 leading-snug">
                {activePillar.title}
              </h2>

              <p className="text-[13px] leading-relaxed text-zinc-700 mt-1.5">
                {activePillar.note}
              </p>

              {/* Integrated 5-chapter step rail */}
              <div className="mt-4 pt-3 border-t border-zinc-900/8 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5" role="group" aria-label="Chapter progress">
                  {WORLD_PILLARS.map((p) => {
                    const current = p.key === selectedKey;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => handleSelectWorld(p.key)}
                        aria-label={`Preview ${p.label}`}
                        className={`h-1.5 rounded-full cursor-pointer transition-all duration-200 ${
                          current ? `w-6 ${p.underlineClass}` : 'w-2.5 bg-zinc-900/15 hover:bg-zinc-900/30'
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="text-[11px] font-medium text-zinc-600 tabular-nums">
                  Hero · Section 01
                </span>
              </div>
            </motion.aside>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
