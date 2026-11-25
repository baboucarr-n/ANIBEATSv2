export type MoodKey = 'all' | 'hype' | 'chill' | 'late-night' | 'sad' | 'workout';

export interface MoodOption {
  key: MoodKey;
  label: string;
  message: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    key: 'all',
    label: 'All Vibes',
    message: 'Showing everything across Anime, Rap, Cars, and Travel.',
  },
  {
    key: 'hype',
    label: 'Hype',
    message: 'High-energy shonen, heavy drums, and dream supercars.',
  },
  {
    key: 'chill',
    label: 'Chill',
    message: 'Laid-back instrumentals, scenic drives, and calm focus.',
  },
  {
    key: 'late-night',
    label: 'Late Night',
    message: 'Empty highways, midnight anime watches, and synth/melodic flows.',
  },
  {
    key: 'sad',
    label: 'Sad',
    message: 'Emotional OSTs, introspective bars, and quiet rainy scenes.',
  },
  {
    key: 'workout',
    label: 'Workout',
    message: 'Pure adrenaline tracks and nonstop action picks.',
  },
];

export type AnimeGenreKey = 'all' | 'action' | 'shonen' | 'romance' | 'ost' | 'cars';

export interface AnimeEntry {
  id: string;
  rank: number;
  title: string;
  posterUrl: string;
  genres: Exclude<AnimeGenreKey, 'all'>[];
  genreLabel: string;
  rating: string;
  year: string;
  why: string;
  moods: Exclude<MoodKey, 'all'>[];
}

export const ANIME_GENRE_OPTIONS: { key: AnimeGenreKey; label: string }[] = [
  { key: 'all', label: 'All Genres' },
  { key: 'action', label: 'Action' },
  { key: 'shonen', label: 'Shonen' },
  { key: 'romance', label: 'Romance' },
  { key: 'ost', label: 'OST Heavy' },
  { key: 'cars', label: 'Car / Racing' },
];

// Real official anime posters verified from AniList & downloaded locally to public/assets/anime/
// Owners can customize/replace rankings & personal notes anytime from the Admin Panel.
export const DEFAULT_ANIME_WALL: AnimeEntry[] = [
  {
    id: 'anime-1',
    rank: 1,
    title: 'Attack on Titan',
    posterUrl: '/assets/anime/aot.jpg',
    genres: ['action', 'shonen', 'ost'],
    genreLabel: 'Action · OST Heavy',
    rating: 'To be filled by me',
    year: '2013',
    why: 'To be filled by me — personal slot ready in Admin Panel (official poster loaded for testing).',
    moods: ['hype', 'workout'],
  },
  {
    id: 'anime-2',
    rank: 2,
    title: 'Jujutsu Kaisen',
    posterUrl: '/assets/anime/jjk.jpg',
    genres: ['action', 'shonen'],
    genreLabel: 'Action · Shonen',
    rating: 'To be filled by me',
    year: '2020',
    why: 'To be filled by me — replace title, rating, or story anytime in Admin.',
    moods: ['hype', 'workout'],
  },
  {
    id: 'anime-3',
    rank: 3,
    title: 'Initial D 1st Stage',
    posterUrl: '/assets/anime/initiald.jpg',
    genres: ['cars', 'action', 'ost'],
    genreLabel: 'Car / Racing · OST Heavy',
    rating: 'To be filled by me',
    year: '1998',
    why: 'To be filled by me — touge night runs, Eurobeat energy, and pure car culture.',
    moods: ['late-night', 'hype'],
  },
  {
    id: 'anime-4',
    rank: 4,
    title: 'Cyberpunk: Edgerunners',
    posterUrl: '/assets/anime/edgerunners.jpg',
    genres: ['action', 'ost'],
    genreLabel: 'Action · OST Heavy',
    rating: 'To be filled by me',
    year: '2022',
    why: 'To be filled by me — futuristic visuals and a soundtrack that stays with you.',
    moods: ['late-night', 'sad'],
  },
  {
    id: 'anime-5',
    rank: 5,
    title: 'Solo Leveling',
    posterUrl: '/assets/anime/sololeveling.png',
    genres: ['action', 'shonen'],
    genreLabel: 'Action · Shonen',
    rating: 'To be filled by me',
    year: '2024',
    why: 'To be filled by me',
    moods: ['hype', 'workout'],
  },
  {
    id: 'anime-6',
    rank: 6,
    title: 'Chainsaw Man',
    posterUrl: '/assets/anime/csm.png',
    genres: ['action', 'shonen', 'ost'],
    genreLabel: 'Action · OST Heavy',
    rating: 'To be filled by me',
    year: '2022',
    why: 'To be filled by me',
    moods: ['hype', 'late-night'],
  },
  {
    id: 'anime-7',
    rank: 7,
    title: 'Your Name.',
    posterUrl: '/assets/anime/yourname.png',
    genres: ['romance', 'ost'],
    genreLabel: 'Romance · OST Heavy',
    rating: 'To be filled by me',
    year: '2016',
    why: 'To be filled by me',
    moods: ['sad', 'chill'],
  },
  {
    id: 'anime-8',
    rank: 8,
    title: 'Demon Slayer: Kimetsu no Yaiba',
    posterUrl: '/assets/anime/demonslayer.jpg',
    genres: ['action', 'shonen'],
    genreLabel: 'Action · Shonen',
    rating: 'To be filled by me',
    year: '2019',
    why: 'To be filled by me',
    moods: ['hype', 'workout'],
  },
  {
    id: 'anime-9',
    rank: 9,
    title: 'Death Note',
    posterUrl: '/assets/anime/deathnote.jpg',
    genres: ['ost'],
    genreLabel: 'Thriller · OST Heavy',
    rating: 'To be filled by me',
    year: '2006',
    why: 'To be filled by me',
    moods: ['late-night'],
  },
  {
    id: 'anime-10',
    rank: 10,
    title: 'Vinland Saga',
    posterUrl: '/assets/anime/vinlandsaga.jpg',
    genres: ['action', 'shonen'],
    genreLabel: 'Action · Drama',
    rating: 'To be filled by me',
    year: '2019',
    why: 'To be filled by me',
    moods: ['sad', 'chill'],
  },
];

export interface CurrentlyWatchingState {
  title: string;
  currentEp: number;
  totalEp: number;
  note: string;
}

export const DEFAULT_CURRENTLY_WATCHING: CurrentlyWatchingState = {
  title: 'Show In Progress — To be filled by me',
  currentEp: 12,
  totalEp: 24,
  note: 'Update my current show & episode count directly from the Admin Panel.',
};

export interface SongOfTheWeek {
  title: string;
  artist: string;
  spotifyUrl: string;
  why: string;
}

// Verified via open.spotify.com/oembed
export const DEFAULT_SONG_OF_THE_WEEK: SongOfTheWeek = {
  title: 'Bling-Bang-Bang-Born (Test Track)',
  artist: 'Creepy Nuts',
  spotifyUrl: 'https://open.spotify.com/track/0kdqcbwei4MDWFEX5f33yG',
  why: 'Loaded as a verified test track — swap in your real Song of the Week link anytime from the Admin Panel.',
};

export interface PlaylistEntry {
  id: string;
  title: string;
  moodLabel: string;
  description: string;
  spotifyUrl: string;
  moods: Exclude<MoodKey, 'all'>[];
}

// Verified via open.spotify.com/oembed: RapCaviar, Anime On Replay, lofi beats, Retrowave // Outrun
export const DEFAULT_PLAYLISTS: PlaylistEntry[] = [
  {
    id: 'pl-1',
    title: 'My Rap Rotation (Test: RapCaviar)',
    moodLabel: 'Hype · Daily',
    description: 'Verified test playlist — replace with your personal Spotify link in the Admin Panel.',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd',
    moods: ['hype', 'workout'],
  },
  {
    id: 'pl-2',
    title: 'Anime OSTs That Hit Different (Test: Anime On Replay)',
    moodLabel: 'Anime · Emotional',
    description: 'Verified official Spotify Anime Hub playlist — swap with your custom playlist in Admin.',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX0hAXqBDwvwI',
    moods: ['hype', 'sad'],
  },
  {
    id: 'pl-3',
    title: 'Late Night Beats (Test: lofi beats)',
    moodLabel: 'Chill · Late Night',
    description: 'Verified chill instrumental rotation — swap with your personal Spotify link in Admin.',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn',
    moods: ['chill', 'late-night', 'sad'],
  },
  {
    id: 'pl-4',
    title: 'Night Drive (Test: Retrowave // Outrun)',
    moodLabel: 'Night Drive · Cars',
    description: 'The bridge between Music and Cars — edit link & notes anytime in Admin.',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
    moods: ['late-night', 'hype'],
  },
];

export type CarCategoryKey = 'all' | 'jdm' | 'supercars' | 'classics' | 'daily';

export interface CarEntry {
  id: string;
  rank: number;
  name: string;
  category: Exclude<CarCategoryKey, 'all'>;
  categoryLabel: string;
  imageUrl: string;
  why: string;
  moods: Exclude<MoodKey, 'all'>[];
}

export const CAR_CATEGORIES: { key: CarCategoryKey; label: string }[] = [
  { key: 'all', label: 'All Cars' },
  { key: 'jdm', label: 'JDM' },
  { key: 'supercars', label: 'Supercars' },
  { key: 'classics', label: 'Classics' },
  { key: 'daily', label: 'Dream Daily' },
];

export const DEFAULT_GARAGE: CarEntry[] = [
  {
    id: 'car-1',
    rank: 1,
    name: 'Nissan Skyline GT-R (R34)',
    category: 'jdm',
    categoryLabel: 'JDM',
    imageUrl: '/assets/cars/skyline_gtr.jpg',
    why: 'To be filled by me — JDM icon slot (edit name, photo, or personal story in Admin Panel).',
    moods: ['late-night', 'hype'],
  },
  {
    id: 'car-2',
    rank: 2,
    name: 'Toyota GR Supra',
    category: 'jdm',
    categoryLabel: 'JDM',
    imageUrl: '/assets/cars/supra.png',
    why: 'To be filled by me — pure coupe proportions and street presence.',
    moods: ['hype', 'workout'],
  },
  {
    id: 'car-3',
    rank: 3,
    name: 'Mazda RX-7 (FD3S)',
    category: 'classics',
    categoryLabel: 'Classics · JDM',
    imageUrl: '/assets/cars/rx7.jpg',
    why: 'To be filled by me — rotary icon straight out of mountain pass anime.',
    moods: ['chill', 'late-night'],
  },
  {
    id: 'car-4',
    rank: 4,
    name: 'Dream Daily / Supercar — To be filled by me',
    category: 'daily',
    categoryLabel: 'Dream Daily',
    imageUrl: '/src/assets/images/anibeats_car_visual_1795278851586.jpg',
    why: 'To be filled by me — add your exact dream daily or supercar from the Admin Panel.',
    moods: ['chill', 'late-night'],
  },
];

export type TravelWhyKey = 'all' | 'anime' | 'rap' | 'cars' | 'culture';

export interface TravelDestination {
  id: string;
  rank: number;
  country: string;
  city: string;
  whyKey: Exclude<TravelWhyKey, 'all'>;
  whyLabel: string;
  whyText: string;
  dreamActivity: string;
}

export const TRAVEL_WHY_FILTERS: { key: TravelWhyKey; label: string }[] = [
  { key: 'all', label: 'All Reasons' },
  { key: 'anime', label: 'Anime Dream' },
  { key: 'rap', label: 'Rap / Music Dream' },
  { key: 'cars', label: 'Car Dream' },
  { key: 'culture', label: 'Culture / Food / Vibes' },
];

export const DREAM_MAP_PINS = [
  {
    id: 'pin-jp',
    country: 'Japan',
    tag: 'Anime Dream',
    why: 'Anime dream — Tokyo, Akihabara, and midnight touge roads.',
  },
  {
    id: 'pin-us',
    country: 'USA',
    tag: 'Rap / Music Dream',
    why: 'Rap & music dream — cities that shaped the sound.',
  },
  {
    id: 'pin-de',
    country: 'Germany',
    tag: 'Car Dream',
    why: 'Car dream — Autobahn and automotive heritage.',
  },
  {
    id: 'pin-ae',
    country: 'Dubai',
    tag: 'Cars + Vibes',
    why: 'Cars + futuristic skyline vibes.',
  },
];

export const DEFAULT_TRAVEL_TRIPS: TravelDestination[] = [
  {
    id: 'trip-1',
    rank: 1,
    country: 'Japan',
    city: 'Tokyo & Hakone',
    whyKey: 'anime',
    whyLabel: 'Anime Dream',
    whyText: 'To be filled by me — walking Shibuya & Akihabara at night.',
    dreamActivity: 'To be filled by me',
  },
  {
    id: 'trip-2',
    rank: 2,
    country: 'Germany',
    city: 'Nürburgring & Stuttgart',
    whyKey: 'cars',
    whyLabel: 'Car Dream',
    whyText: 'To be filled by me — pure automotive history.',
    dreamActivity: 'To be filled by me',
  },
  {
    id: 'trip-3',
    rank: 3,
    country: 'USA',
    city: 'New York / Atlanta',
    whyKey: 'rap',
    whyLabel: 'Rap / Music Dream',
    whyText: 'To be filled by me — standing where the music came from.',
    dreamActivity: 'To be filled by me',
  },
  {
    id: 'trip-4',
    rank: 4,
    country: 'UAE',
    city: 'Dubai',
    whyKey: 'cars',
    whyLabel: 'Car Dream',
    whyText: 'To be filled by me — supercars & skyline nights.',
    dreamActivity: 'To be filled by me',
  },
  {
    id: 'trip-5',
    rank: 5,
    country: 'Destination #5',
    city: 'To be filled by me',
    whyKey: 'culture',
    whyLabel: 'Culture / Food / Vibes',
    whyText: 'To be filled by me',
    dreamActivity: 'To be filled by me',
  },
  {
    id: 'trip-6',
    rank: 6,
    country: 'Destination #6',
    city: 'To be filled by me',
    whyKey: 'anime',
    whyLabel: 'Anime Dream',
    whyText: 'To be filled by me',
    dreamActivity: 'To be filled by me',
  },
  {
    id: 'trip-7',
    rank: 7,
    country: 'Destination #7',
    city: 'To be filled by me',
    whyKey: 'rap',
    whyLabel: 'Rap / Music Dream',
    whyText: 'To be filled by me',
    dreamActivity: 'To be filled by me',
  },
  {
    id: 'trip-8',
    rank: 8,
    country: 'Destination #8',
    city: 'To be filled by me',
    whyKey: 'culture',
    whyLabel: 'Culture / Food / Vibes',
    whyText: 'To be filled by me',
    dreamActivity: 'To be filled by me',
  },
  {
    id: 'trip-9',
    rank: 9,
    country: 'Destination #9',
    city: 'To be filled by me',
    whyKey: 'cars',
    whyLabel: 'Car Dream',
    whyText: 'To be filled by me',
    dreamActivity: 'To be filled by me',
  },
  {
    id: 'trip-10',
    rank: 10,
    country: 'Destination #10',
    city: 'To be filled by me',
    whyKey: 'culture',
    whyLabel: 'Culture / Food / Vibes',
    whyText: 'To be filled by me',
    dreamActivity: 'To be filled by me',
  },
];

export interface JournalEntry {
  id: string;
  dateLabel: string;
  title: string;
  added: string;
  why: string;
}

export const DEFAULT_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-02',
    dateLabel: 'Entry 02 · Dec 2026',
    title: '“Rebuilt ANIBEATS with Apple-grade clarity & a live Admin Studio”',
    added: 'Ultra-clean monochrome design, official anime posters, live Spotify embed manager, and fluid spring motion.',
    why: 'I wanted opening ANIBEATS to feel effortless, sharp, and personal — where content is the star.',
  },
  {
    id: 'entry-01',
    dateLabel: 'Entry 01 · Nov 2026',
    title: 'WEB1 Assignment 2 — Where It Started',
    added: 'The first hobby site about Anime and Rap Music for Internet and Web Programming 1.',
    why: 'Once I submitted it, I realized I wasn’t building it for a grade anymore — I was building it for me.',
  },
];

export const WATCH_IF_YOU_LIKED = [
  { id: 'pair-1', index: '01', prompt: 'If you liked [X], try [Y]', reason: 'To be filled by me' },
  { id: 'pair-2', index: '02', prompt: 'If you liked [X], try [Y]', reason: 'To be filled by me' },
  { id: 'pair-3', index: '03', prompt: 'If you liked [X], try [Y]', reason: 'To be filled by me' },
];

export const OST_VS_RAP_BATTLES = [
  {
    id: 'battle-1',
    label: 'Matchup 01',
    title: '[Anime Opening] vs [Rap Track]',
    sharedEnergy: 'To be filled by me (e.g., boss-fight adrenaline, undefeated mindset).',
    ostLabel: 'Anime OP',
    rapLabel: 'Rap Track',
    moods: ['hype', 'workout'] as Exclude<MoodKey, 'all'>[],
  },
  {
    id: 'battle-2',
    label: 'Matchup 02',
    title: '[Late-Night OST] vs [Melodic Rap Track]',
    sharedEnergy: 'To be filled by me (e.g., 2 AM thoughts looking out the window).',
    ostLabel: 'Anime OST',
    rapLabel: 'Rap Track',
    moods: ['late-night', 'sad'] as Exclude<MoodKey, 'all'>[],
  },
];

export const STORY_PILLARS = [
  {
    num: '01',
    title: 'Started from an assignment and never stopped',
    body: 'Most school assignments get submitted and forgotten. I couldn’t stop working on mine because it finally felt like my own space.',
  },
  {
    num: '02',
    title: 'Real love, not fake',
    body: 'I actually watch these shows, play these tracks on repeat, obsess over these cars, and dream about these 80 places. Honesty is the whole impression.',
  },
  {
    num: '03',
    title: 'Leave with something to watch or listen to',
    body: 'Every person who opens ANIBEATS should walk away with at least one anime to watch, song to replay, car to admire, or city to dream about visiting.',
  },
];

export const LIVING_TIMELINE = [
  {
    date: 'Nov 2026',
    title: 'WEB1 Assignment 2 → Shared it → Kept building',
    description:
      'Built the very first version for Internet and Web Programming 1. Turned it in, shared it, and realized I wanted to keep going after the grade was done.',
  },
  {
    date: 'Dec 2026',
    title: 'Apple-Minimalist Edition + Live Spotify & Admin Studio',
    description:
      'Redesigned ANIBEATS around razor-clean typography, physical spring motion, official anime flyers, live Spotify embeds, Cars, and 80 Travel dreams.',
  },
  {
    date: '2027',
    title: 'Future chapters ahead',
    description:
      'This timeline stays alive as I grow — ticking off real destinations, adding real reviews, and updating the diary along the way.',
  },
];

export const POLL_OPTIONS = [
  'High-energy Shonen hype openings',
  'Emotional / atmospheric openings that give chills',
  'Smooth hip-hop / jazz / late-night openings',
];
