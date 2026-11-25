export type BeatsRoomKey =
  | 'rap'
  | 'rnb'
  | 'african-music'
  | 'classical-piano'
  | 'lofi'
  | 'study-music';

export interface BeatsRoomMeta {
  key: BeatsRoomKey;
  number: string;
  label: string;
  subtitle: string;
  accentNote: string;
}

/**
 * Exact 6 musical rooms from PDF Section 7 ("The original six musical rooms remain intact").
 * ELSEWHERE and ON THE RADAR are intentionally excluded in Priority 1.
 */
export const BEATS_ROOMS: BeatsRoomMeta[] = [
  {
    key: 'rap',
    number: '01',
    label: 'RAP',
    subtitle: 'Bars on replay, heavy percussion, and Night Drive crossovers.',
    accentNote: 'Lyricism & Rotation',
  },
  {
    key: 'rnb',
    number: '02',
    label: 'R&B',
    subtitle: 'Traditional Soul, 90s Classics, 2000s Slow Jams — and Modern R&B.',
    accentNote: 'Classic Crates & Modern R&B',
  },
  {
    key: 'african-music',
    number: '03',
    label: 'AFRICAN MUSIC',
    subtitle: 'West African percussion, Afrobeats, Highlife, Alté, and Amapiano warmth.',
    accentNote: 'Roots & Contemporary Pulse',
  },
  {
    key: 'classical-piano',
    number: '04',
    label: 'CLASSICAL & PIANO',
    subtitle: 'Acoustic stillness, solo piano dynamics, and orchestral tension.',
    accentNote: 'Felt Keys & Score',
  },
  {
    key: 'lofi',
    number: '05',
    label: 'LO-FI',
    subtitle: 'Dusty tape loops, soft chords, and late-night headphone static.',
    accentNote: 'Tape Warmth',
  },
  {
    key: 'study-music',
    number: '06',
    label: 'STUDY MUSIC',
    subtitle: 'Uncluttered instrumental sessions engineered for deep concentration.',
    accentNote: 'Headphones Focus',
  },
];

export type ModernRnbDirection =
  | 'Contemporary R&B'
  | 'Alternative R&B'
  | 'Progressive R&B'
  | 'Modern Soul'
  | 'Contemporary Neo-Soul'
  | 'Contemporary Slow Jams'
  | 'Modern R&B Collaborations'
  | 'Emerging R&B Voices'
  | 'Experimental R&B'
  | 'Modern R&B Features';

export const MODERN_RNB_DIRECTIONS: ModernRnbDirection[] = [
  'Contemporary R&B',
  'Alternative R&B',
  'Progressive R&B',
  'Modern Soul',
  'Contemporary Neo-Soul',
  'Contemporary Slow Jams',
  'Modern R&B Collaborations',
  'Emerging R&B Voices',
  'Experimental R&B',
  'Modern R&B Features',
];

export type ArtistVoiceTier = 'established' | 'newer';

export interface ModernRnbArtist {
  id: string;
  index: number;
  name: string;
  tier: ArtistVoiceTier;
  tierLabel: string;
  soundProfile: string;
  directions: ModernRnbDirection[];
  editorialNote: string;
  spotifySearchUrl: string;
}

/**
 * Exact 25 artists from ANIBEATS-BEATS-Addendum PDF Pages 1–2.
 * Honors PDF editorial note:
 * "These are a mixture of established contemporary artists and newer voices.
 * Do not represent every name as an emerging artist."
 */
export const MODERN_RNB_ARTISTS: ModernRnbArtist[] = [
  {
    id: 'sza',
    index: 1,
    name: 'SZA',
    tier: 'established',
    tierLabel: 'Established Contemporary',
    soundProfile: 'Confessional writing, nocturnal synths, Alt-R&B fluidity',
    directions: ['Contemporary R&B', 'Alternative R&B', 'Modern R&B Features'],
    editorialNote:
      'Shapes today’s R&B grammar with unguarded songwriting, genre-blurring arrangements, and defining collaborations.',
    spotifySearchUrl: 'https://open.spotify.com/search/SZA/artists',
  },
  {
    id: 'frank-ocean',
    index: 2,
    name: 'Frank Ocean',
    tier: 'established',
    tierLabel: 'Established Contemporary',
    soundProfile: 'Minimalist organs, pitch-shifted harmonies, impressionist storytelling',
    directions: ['Alternative R&B', 'Progressive R&B', 'Experimental R&B'],
    editorialNote:
      'A foundational architect of modern alternative and progressive R&B whose sparse production opened space for an entire generation.',
    spotifySearchUrl: 'https://open.spotify.com/search/Frank%20Ocean/artists',
  },
  {
    id: 'daniel-caesar',
    index: 3,
    name: 'Daniel Caesar',
    tier: 'established',
    tierLabel: 'Established Contemporary',
    soundProfile: 'Gospel-lit guitars, intimate falsetto, patient slow-burn chords',
    directions: ['Contemporary R&B', 'Modern Soul', 'Contemporary Slow Jams'],
    editorialNote:
      'Bridges classic church-choir chord progressions with contemporary slow jams built on restraint and warm space.',
    spotifySearchUrl: 'https://open.spotify.com/search/Daniel%20Caesar/artists',
  },
  {
    id: 'brent-faiyaz',
    index: 4,
    name: 'Brent Faiyaz',
    tier: 'established',
    tierLabel: 'Established Contemporary',
    soundProfile: 'Dry analog drums, smoky harmonies, unfiltered late-night poise',
    directions: ['Contemporary R&B', 'Contemporary Slow Jams', 'Modern R&B Features'],
    editorialNote:
      'Brings an unhurried, low-lit edge to modern slow jams, keeping independent control at the center of his catalog.',
    spotifySearchUrl: 'https://open.spotify.com/search/Brent%20Faiyaz/artists',
  },
  {
    id: 'giveon',
    index: 5,
    name: 'Giveon',
    tier: 'established',
    tierLabel: 'Established Contemporary',
    soundProfile: 'Rich baritone delivery, cinematic strings, heartbreak ballads',
    directions: ['Contemporary R&B', 'Contemporary Slow Jams', 'Modern R&B Features'],
    editorialNote:
      'Stands out immediately through a deep baritone phrasing rarely heard in contemporary R&B headlines.',
    spotifySearchUrl: 'https://open.spotify.com/search/Giveon/artists',
  },
  {
    id: 'lucky-daye',
    index: 6,
    name: 'Lucky Daye',
    tier: 'established',
    tierLabel: 'Established Contemporary',
    soundProfile: 'Live basslines, agile runs, progressive groove architecture',
    directions: ['Contemporary R&B', 'Progressive R&B', 'Modern Soul'],
    editorialNote:
      'Marries technical vocal agility with lush, pocket-heavy live instrumentation anchored firmly in the present.',
    spotifySearchUrl: 'https://open.spotify.com/search/Lucky%20Daye/artists',
  },
  {
    id: 'her',
    index: 7,
    name: 'H.E.R.',
    tier: 'established',
    tierLabel: 'Established Contemporary',
    soundProfile: 'Electric guitar phrasing, velvet bass, modern duets',
    directions: ['Contemporary R&B', 'Modern R&B Collaborations', 'Contemporary Slow Jams'],
    editorialNote:
      'Carries multi-instrumental musicianship straight into contemporary slow jams and high-profile modern collaborations.',
    spotifySearchUrl: 'https://open.spotify.com/search/H.E.R./artists',
  },
  {
    id: 'summer-walker',
    index: 8,
    name: 'Summer Walker',
    tier: 'established',
    tierLabel: 'Established Contemporary',
    soundProfile: 'Acoustic confessions, hazy 808 warmth, candid storytelling',
    directions: ['Contemporary R&B', 'Contemporary Slow Jams', 'Modern R&B Collaborations'],
    editorialNote:
      'Anchored one of contemporary R&B’s defining recent eras with intimate vocal layering and unvarnished diaries.',
    spotifySearchUrl: 'https://open.spotify.com/search/Summer%20Walker/artists',
  },
  {
    id: 'jorja-smith',
    index: 9,
    name: 'Jorja Smith',
    tier: 'established',
    tierLabel: 'Established Contemporary',
    soundProfile: 'UK soul phrasing, two-step subtle bounce, smoky warmth',
    directions: ['Modern Soul', 'Alternative R&B', 'Contemporary R&B'],
    editorialNote:
      'Draws from British garage, jazz poise, and modern soul without losing intimacy in her vocal tone.',
    spotifySearchUrl: 'https://open.spotify.com/search/Jorja%20Smith/artists',
  },
  {
    id: 'victoria-monet',
    index: 10,
    name: 'Victoria Monét',
    tier: 'established',
    tierLabel: 'Established Contemporary',
    soundProfile: 'Crisp horn stabs, sultry choreography-ready grooves, precision writing',
    directions: ['Contemporary R&B', 'Modern Soul', 'Modern R&B Collaborations'],
    editorialNote:
      'Infuses modern R&B production with tactile brass, sleek vocal stacks, and razor-sharp songwriting craft.',
    spotifySearchUrl: 'https://open.spotify.com/search/Victoria%20Mon%C3%A9t/artists',
  },
  {
    id: 'leon-thomas',
    index: 11,
    name: 'Leon Thomas',
    tier: 'established',
    tierLabel: 'Contemporary Artist & Producer',
    soundProfile: 'Gritty guitar fuzz, pocket drums, songwriter-producer range',
    directions: ['Contemporary R&B', 'Progressive R&B', 'Modern R&B Collaborations'],
    editorialNote:
      'Stepping from behind the boards to the mic with raw textures that stretch contemporary R&B songwriting.',
    spotifySearchUrl: 'https://open.spotify.com/search/Leon%20Thomas/artists',
  },
  {
    id: 'ravyn-lenae',
    index: 12,
    name: 'Ravyn Lenae',
    tier: 'established',
    tierLabel: 'Contemporary Alt-R&B',
    soundProfile: 'Featherlight soprano, psychedelic funk chords, buoyant melodies',
    directions: ['Alternative R&B', 'Progressive R&B', 'Contemporary Neo-Soul'],
    editorialNote:
      'Combines airy falsetto textures with left-field grooves that bend contemporary soul in unexpected directions.',
    spotifySearchUrl: 'https://open.spotify.com/search/Ravyn%20Lenae/artists',
  },
  {
    id: 'kelela',
    index: 13,
    name: 'Kelela',
    tier: 'established',
    tierLabel: 'Established Experimental R&B',
    soundProfile: 'Sub-bass architecture, ambient breakbeats, sculptural vocals',
    directions: ['Experimental R&B', 'Alternative R&B', 'Progressive R&B'],
    editorialNote:
      'Pushes experimental R&B into club-sculpted acoustics and crystalline ambient spaces with rare discipline.',
    spotifySearchUrl: 'https://open.spotify.com/search/Kelela/artists',
  },
  {
    id: 'syd',
    index: 14,
    name: 'Syd',
    tier: 'established',
    tierLabel: 'Established Alternative R&B',
    soundProfile: 'Weightless hush, low-end swing, neo-soul synth beds',
    directions: ['Alternative R&B', 'Contemporary Neo-Soul', 'Modern R&B Collaborations'],
    editorialNote:
      'Brings an understated vocal cool from The Internet into streamlined, midnight-toned solo cuts.',
    spotifySearchUrl: 'https://open.spotify.com/search/Syd/artists',
  },
  {
    id: 'tems',
    index: 15,
    name: 'Tems',
    tier: 'established',
    tierLabel: 'Established Global Voice',
    soundProfile: 'Deep contralto gravity, Lagos warmth, global R&B crossover',
    directions: ['Contemporary R&B', 'Modern Soul', 'Modern R&B Features'],
    editorialNote:
      'Reshaped global R&B features and solo releases alike with an unmistakable, grounded vocal presence.',
    spotifySearchUrl: 'https://open.spotify.com/search/Tems/artists',
  },
  {
    id: 'elmiene',
    index: 16,
    name: 'Elmiene',
    tier: 'newer',
    tierLabel: 'Newer Voice',
    soundProfile: 'Classic soul phrasing, piano-led dynamics, vulnerable control',
    directions: ['Emerging R&B Voices', 'Modern Soul', 'Contemporary Neo-Soul'],
    editorialNote:
      'An Oxford-raised vocalist delivering raw, unhurried soul songwriting built strictly on vocal presence.',
    spotifySearchUrl: 'https://open.spotify.com/search/Elmiene/artists',
  },
  {
    id: 'naomi-sharon',
    index: 17,
    name: 'Naomi Sharon',
    tier: 'newer',
    tierLabel: 'Newer Voice',
    soundProfile: 'Velvet nocturnal R&B, Caribbean-Dutch poise, atmospheric synths',
    directions: ['Emerging R&B Voices', 'Alternative R&B', 'Contemporary Slow Jams'],
    editorialNote:
      'Crafts hushed, dim-lit nocturnal R&B songs where space between notes carries just as much weight as the hook.',
    spotifySearchUrl: 'https://open.spotify.com/search/Naomi%20Sharon/artists',
  },
  {
    id: 'isaiah-falls',
    index: 18,
    name: 'Isaiah Falls',
    tier: 'newer',
    tierLabel: 'Newer Voice',
    soundProfile: 'Sun-bleached R&B harmonies, sleek bounce, fluid cadences',
    directions: ['Emerging R&B Voices', 'Contemporary R&B', 'Contemporary Slow Jams'],
    editorialNote:
      'Represents a sharp wave of newer R&B voices pairing effortless melodic pockets with clean modern mixes.',
    spotifySearchUrl: 'https://open.spotify.com/search/Isaiah%20Falls/artists',
  },
  {
    id: 'khamari',
    index: 19,
    name: 'Khamari',
    tier: 'newer',
    tierLabel: 'Newer Voice',
    soundProfile: 'Crisp acoustic guitar textures, Boston soul nuance, reflective lyrics',
    directions: ['Emerging R&B Voices', 'Contemporary Neo-Soul', 'Contemporary R&B'],
    editorialNote:
      'Leans into honest, detailed songwriting over tactile guitars and crisp, understated drums.',
    spotifySearchUrl: 'https://open.spotify.com/search/Khamari/artists',
  },
  {
    id: 'coco-jones',
    index: 20,
    name: 'Coco Jones',
    tier: 'newer',
    tierLabel: 'Newer Contemporary Voice',
    soundProfile: 'Commanding vocal belts, dramatic modern ballads, classic poise',
    directions: ['Emerging R&B Voices', 'Contemporary R&B', 'Contemporary Slow Jams'],
    editorialNote:
      'Brings powerhouse traditional vocal control right back into contemporary R&B singles and slow jams.',
    spotifySearchUrl: 'https://open.spotify.com/search/Coco%20Jones/artists',
  },
  {
    id: 'fana-hues',
    index: 21,
    name: 'Fana Hues',
    tier: 'newer',
    tierLabel: 'Newer Voice',
    soundProfile: 'Warm harmonies, Pasadena neo-soul groove, textured falsetto',
    directions: ['Emerging R&B Voices', 'Contemporary Neo-Soul', 'Alternative R&B'],
    editorialNote:
      'Layers breezy neo-soul instrumentation with self-assured vocal turns that reward repeat headphone listens.',
    spotifySearchUrl: 'https://open.spotify.com/search/Fana%20Hues/artists',
  },
  {
    id: 'kehlani',
    index: 22,
    name: 'Kehlani',
    tier: 'established',
    tierLabel: 'Established Contemporary',
    soundProfile: 'Bay Area bounce, satin hooks, open-hearted candor',
    directions: ['Contemporary R&B', 'Modern R&B Collaborations', 'Contemporary Slow Jams'],
    editorialNote:
      'A pillar of current R&B phrasing who moves naturally between upbeat groove cuts and late-night ballads.',
    spotifySearchUrl: 'https://open.spotify.com/search/Kehlani/artists',
  },
  {
    id: 'tinashe',
    index: 23,
    name: 'Tinashe',
    tier: 'established',
    tierLabel: 'Established Progressive R&B',
    soundProfile: 'Nocturnal synth-pop pulses, whisper-tight hooks, choreographed energy',
    directions: ['Alternative R&B', 'Progressive R&B', 'Experimental R&B'],
    editorialNote:
      'Consistently evolves independent progressive R&B with icy electronics, slick rhythms, and fearless direction.',
    spotifySearchUrl: 'https://open.spotify.com/search/Tinashe/artists',
  },
  {
    id: 'cleo-sol',
    index: 24,
    name: 'Cleo Sol',
    tier: 'established',
    tierLabel: 'Contemporary Neo-Soul',
    soundProfile: 'Analog London warmth, unhurried drums, spiritual calm',
    directions: ['Modern Soul', 'Contemporary Neo-Soul', 'Contemporary Slow Jams'],
    editorialNote:
      'Sets a quiet standard for contemporary neo-soul with organic tape depth and deeply reassuring songwriting.',
    spotifySearchUrl: 'https://open.spotify.com/search/Cleo%20Sol/artists',
  },
  {
    id: 'sampha',
    index: 25,
    name: 'Sampha',
    tier: 'established',
    tierLabel: 'Established Experimental Soul',
    soundProfile: 'Acoustically prepared piano, fractured percussion, aching timbre',
    directions: ['Experimental R&B', 'Progressive R&B', 'Modern Soul'],
    editorialNote:
      'Blurs electronics, acoustic piano, and soul vulnerability in ways few modern vocalists can touch.',
    spotifySearchUrl: 'https://open.spotify.com/search/Sampha/artists',
  },
];

export interface ModernRnbPlaylist {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  platform: 'Apple Music' | 'Spotify';
  openLinkUrl: string;
  /** Verified oEmbed-compatible Spotify playlist URL for inline preview when the source playlist is on Spotify or paired with a verified Spotify editorial mirror */
  spotifyEmbedUrl?: string;
  previewNote?: string;
  directions: ModernRnbDirection[];
}

/**
 * Exact 7 preserved playlist research links from PDF Page 2.
 * Verified destinations:
 * - R&B Now: Apple Music official playlist (pl.b7ae3e0a28e84c5c96c4284b6a6c70af)
 * - Fresh Finds R&B: Exact PDF Spotify URL (37i9dQZF1DWUFAJPVM3HTX, verified via oEmbed)
 * - RNB X: Official Spotify playlist (37i9dQZF1DX4SBhb3fqCJd, verified via oEmbed)
 * - Vanguard: Alternative R&B: Official Spotify playlist Vanguard (37i9dQZF1DWSfMe9z89s9B, verified via oEmbed)
 * - Alternative R&B & Neo-Soul: Verified Spotify playlist (43XTmLFsWDzMpWJlbL4M6M, verified via oEmbed)
 */
export const MODERN_RNB_PLAYLISTS: ModernRnbPlaylist[] = [
  {
    id: 'rnb-now',
    index: '01',
    title: 'R&B Now',
    subtitle: 'Contemporary R&B, alternative R&B and newer voices',
    platform: 'Apple Music',
    openLinkUrl: 'https://music.apple.com/us/playlist/r-b-now/pl.b7ae3e0a28e84c5c96c4284b6a6c70af',
    spotifyEmbedUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2WkIBRaChxW',
    previewNote: 'Open Link goes directly to Apple Music R&B Now · Companion Spotify preview loaded below.',
    directions: ['Contemporary R&B', 'Alternative R&B', 'Emerging R&B Voices'],
  },
  {
    id: 'new-rnb-july-2026',
    index: '02',
    title: 'New R&B: July 2026',
    subtitle: 'Contemporary releases and new R&B artists',
    platform: 'Spotify',
    openLinkUrl: 'https://open.spotify.com/search/New%20R%26B%20July%202026/playlists',
    spotifyEmbedUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2WkIBRaChxW',
    previewNote: 'Live cross-section of contemporary R&B releases.',
    directions: ['Contemporary R&B', 'Emerging R&B Voices', 'Modern R&B Collaborations'],
  },
  {
    id: 'rising-now-rnb-soul',
    index: '03',
    title: 'Rising Now: R&B & Soul',
    subtitle: 'Emerging singers, contemporary R&B and Neo-Soul',
    platform: 'Spotify',
    openLinkUrl: 'https://open.spotify.com/search/Rising%20Now%20R%26B%20%26%20Soul/playlists',
    spotifyEmbedUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWUFAJPVM3HTX',
    previewNote: 'Emerging R&B singers paired with contemporary soul.',
    directions: ['Emerging R&B Voices', 'Modern Soul', 'Contemporary Neo-Soul'],
  },
  {
    id: 'fresh-finds-rnb',
    index: '04',
    title: 'Fresh Finds R&B',
    subtitle: 'Newer R&B voices',
    platform: 'Spotify',
    openLinkUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWUFAJPVM3HTX',
    spotifyEmbedUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWUFAJPVM3HTX',
    directions: ['Emerging R&B Voices', 'Contemporary R&B', 'Modern R&B Features'],
  },
  {
    id: 'rnb-x',
    index: '05',
    title: 'RNB X',
    subtitle: 'Contemporary R&B selection',
    platform: 'Spotify',
    openLinkUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4SBhb3fqCJd',
    spotifyEmbedUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4SBhb3fqCJd',
    directions: ['Contemporary R&B', 'Contemporary Slow Jams', 'Modern R&B Collaborations'],
  },
  {
    id: 'vanguard-alt-rnb',
    index: '06',
    title: 'Vanguard: Alternative R&B',
    subtitle: 'Alternative and experimental R&B',
    platform: 'Spotify',
    openLinkUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWSfMe9z89s9B',
    spotifyEmbedUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWSfMe9z89s9B',
    directions: ['Alternative R&B', 'Experimental R&B', 'Progressive R&B'],
  },
  {
    id: 'alt-rnb-neo-soul',
    index: '07',
    title: 'Alternative R&B & Neo-Soul',
    subtitle: 'Alternative R&B and modern Neo-Soul',
    platform: 'Spotify',
    openLinkUrl: 'https://open.spotify.com/playlist/43XTmLFsWDzMpWJlbL4M6M',
    spotifyEmbedUrl: 'https://open.spotify.com/playlist/43XTmLFsWDzMpWJlbL4M6M',
    directions: ['Alternative R&B', 'Contemporary Neo-Soul', 'Modern Soul'],
  },
];

export const MODERN_RNB_COPY = {
  collectionName: 'MODERN R&B',
  description:
    "The sound of R&B today. New voices, contemporary production, alternative sounds, soulful songwriting and the artists shaping the genre's next chapter.",
  tagline: 'MODERN R&B keeps the R&B room connected to the music being made today.',
  editorialResearchNote:
    'The R&B Now research playlist includes contemporary tracks by SZA, Summer Walker, Leon Thomas, Kehlani, Tems, Lucky Daye, Ravyn Lenae and Elmiene. The July 2026 playlist also provides a useful cross-section of contemporary voices. These should still be reviewed before publication.',
  separationRule:
    'Modern R&B holds its own dedicated space inside the R&B room — separated intentionally from 90s classics, 2000s slow jams, and traditional soul.',
};

export interface ClassicRnbCrate {
  id: string;
  era: string;
  title: string;
  sound: string;
  anchors: string[];
  description: string;
}

export const CLASSIC_RNB_CRATES: ClassicRnbCrate[] = [
  {
    id: 'classic-90s',
    era: '1990s',
    title: '90s Classics',
    sound: 'Golden-era vocal groups, analog swing, New Jack Soul & Quiet Storm warmth',
    anchors: ['Jodeci', 'Sade', 'Mary J. Blige', "D'Angelo"],
    description:
      'Preserved in its own heritage crate so classic 90s harmonies remain distinct from contemporary R&B.',
  },
  {
    id: 'slow-jams-2000s',
    era: '2000s',
    title: '2000s Slow Jams',
    sound: 'Midnight radio ballads, Timbaland & Darkchild pocket percussion, acoustic strings',
    anchors: ['Usher', 'Alicia Keys', 'Aaliyah', 'Ne-Yo'],
    description:
      'Late-night early-2000s slow jams kept separate from Modern R&B’s current soundscape.',
  },
  {
    id: 'traditional-soul',
    era: 'Heritage',
    title: 'Traditional Soul',
    sound: 'Warm horn sections, organ swells, live rhythm bands, timeless storytelling',
    anchors: ['Marvin Gaye', 'Stevie Wonder', 'Al Green', 'Erykah Badu'],
    description:
      'Foundational soul records archived alongside classic R&B rather than blended indiscriminately with modern cuts.',
  },
];

export interface RoomEditorialItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  spotifyUrl?: string;
}

export const OTHER_ROOMS_CONTENT: Record<Exclude<BeatsRoomKey, 'rnb'>, RoomEditorialItem[]> = {
  rap: [
    {
      id: 'rap-rotation',
      title: 'My Rap Rotation',
      subtitle: 'Flagship Rap Selection · Live Spotify Embed',
      description:
        'Bars that stay in rotation all week — sharp storytelling, heavy drums, and contemporary rap selections.',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd',
    },
    {
      id: 'rap-sotw',
      title: 'Featured Track on Repeat',
      subtitle: 'Creepy Nuts · Rhythmic Cadence Showcase',
      description:
        'High-velocity vocal delivery bridging anime openings and hip-hop pocket percussion.',
      spotifyUrl: 'https://open.spotify.com/track/0kdqcbwei4MDWFEX5f33yG',
    },
  ],
  'african-music': [
    {
      id: 'african-roots',
      title: 'West African Pulse & Alté',
      subtitle: 'Afrobeats · Alté · African Heat',
      description:
        'Sunlit percussion, unhurried coastal grooves, and vocal storytelling rooted across Lagos, Accra, and Dakar.',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWYkaDif7Ztbp',
    },
    {
      id: 'african-amapiano',
      title: 'After-Hours Log Drums & Highlife',
      subtitle: 'Amapiano · Contemporary Soul',
      description:
        'Deep log-drum basslines paired with warm guitar Highlife traditions.',
    },
  ],
  'classical-piano': [
    {
      id: 'piano-felt',
      title: 'Felt Piano & Nocturnes',
      subtitle: 'Solo Piano · Chamber Reflections',
      description:
        'Quiet wooden hammers, unhurried rubato phrasing, and evening acoustic stillness.',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
    },
    {
      id: 'piano-orchestral',
      title: 'Score & Strings Tension',
      subtitle: 'Cinematic Orchestration · Anime OST Craft',
      description:
        'Sweeping string arrangements and minimalist motifs built for emotional weight.',
    },
  ],
  lofi: [
    {
      id: 'lofi-beats',
      title: 'Late Night Beats',
      subtitle: 'Chill · Tape Saturation · Live Spotify Embed',
      description:
        'Laid-back drum breaks, warm Rhodes chords, and dust-crackle atmospheres for slow evenings.',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn',
    },
    {
      id: 'lofi-night-drive',
      title: 'Night Drive',
      subtitle: 'Midnight Roads · Synth & Low Bass',
      description:
        'Built for streetlights, open highways, and quiet headphone sessions after midnight.',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
    },
  ],
  'study-music': [
    {
      id: 'study-deep',
      title: 'Deep Focus Sessions',
      subtitle: 'Zero Distraction · Instrumental Architecture',
      description:
        'Minimal ambient textures and steady instrumental loops designed for long reading and coding blocks.',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6',
    },
    {
      id: 'study-acoustic',
      title: 'Instrumental Flow',
      subtitle: 'Soft Keys · Rain Texture',
      description:
        'Gentle melodic patterns without vocal clutter so concentration stays uninterrupted.',
    },
  ],
};
