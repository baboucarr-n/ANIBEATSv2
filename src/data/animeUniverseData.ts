export type AnimeGenreName =
  | 'Action'
  | 'Adventure'
  | 'Drama'
  | 'Romance'
  | 'Comedy'
  | 'Psychological'
  | 'Thriller'
  | 'Mystery'
  | 'Sci-Fi'
  | 'Fantasy'
  | 'Dark Fantasy'
  | 'Supernatural'
  | 'Horror'
  | 'Historical'
  | 'Crime'
  | 'Slice of Life'
  | 'Sports'
  | 'Music'
  | 'Mecha'
  | 'Military'
  | 'Coming-of-Age'
  | 'Tragedy'
  | 'School Life'
  | 'Isekai'
  | 'Suspense';

export type AnimeDemographic = 'Shonen' | 'Seinen' | 'Shojo' | 'Josei';

export type DiscoveryCategory =
  | 'Dark Fantasy'
  | 'Action / Combat'
  | 'Psych / Mystery'
  | 'Drama / Emotional';

export interface CompletedAnimeItem {
  id: string;
  rank: number;
  title: string;
  posterUrl: string;
  genres: AnimeGenreName[];
  demographic: AnimeDemographic;
  frontNote: string;
  lifeLesson: string;
}

export interface CurrentlyWatchingItem {
  id: string;
  title: string;
  posterUrl: string;
  genres: AnimeGenreName[];
  demographic: AnimeDemographic;
  note: string;
  statusLabel: string;
  currentEp: number;
  totalEp: number;
}

export interface DiscoveryAnimeItem {
  id: string;
  title: string;
  posterUrl: string;
  category: DiscoveryCategory;
  genres: AnimeGenreName[];
  demographic: AnimeDemographic;
  synopsis: string;
  whyOnList: string;
  watchlistStatus: string;
  streamingUrl?: string;
  suggestedBy?: string;
}

export type RankingPeriod = 'week' | 'month' | 'year' | 'all_time';

export interface PendingAnimeSuggestion {
  id: string;
  title: string;
  link: string;
  why: string;
  submittedBy: string;
  submittedAt: string;
}

export interface CommunityVoteRecord {
  animeId: string;
  voterId: string;
  voterName?: string;
  upvoted: boolean;
  stars: number;
  updatedAt: string;
}

export type CommunityRankSnapshots = Record<RankingPeriod, Record<string, number>>;

export interface StickerChatMessage {
  id: string;
  text?: string;
  stickerId?: string;
  senderName?: string;
  voterId?: string;
  createdAt: string;
  hearts: number;
  heartedBy: string[];
}

export interface AnimeCommentItem {
  id: string;
  animeId: string;
  voterId: string;
  authorName?: string;
  text: string;
  createdAt: string;
}

export type RewardBadgeId =
  | 'first_chat'
  | 'first_suggest'
  | 'seven_day_streak'
  | 'top_voter';

export interface RewardXpEvent {
  amount: number;
  source: 'chat' | 'comment' | 'suggest' | 'vote' | 'streak' | 'daily_quest';
  at: string;
}

export interface DailyQuestProgress {
  dayKey: string;
  chatCount: number;
  completed: boolean;
  completedAt?: string;
  stickerCount?: number;
  stickerCompleted?: boolean;
  stickerCompletedAt?: string;
  voteCount?: number;
  voteCompleted?: boolean;
  voteCompletedAt?: string;
}

export interface RewardUserProfile {
  voterId: string;
  displayName?: string;
  totalXp: number;
  chatCount: number;
  commentCount: number;
  suggestCount: number;
  voteCount: number;
  votedAnimeIds: string[];
  chatDays: string[];
  currentStreak: number;
  longestStreak: number;
  lastStreakBonusDate?: string;
  dailyQuestProgress?: DailyQuestProgress;
  badges: RewardBadgeId[];
  xpEvents: RewardXpEvent[];
  updatedAt: string;
}

export interface AnimeUniverseState {
  collection: CompletedAnimeItem[];
  watching: CurrentlyWatchingItem[];
  discovery: DiscoveryAnimeItem[];
  pendingSuggestions?: PendingAnimeSuggestion[];
  communityVotes?: CommunityVoteRecord[];
  communityRankSnapshots?: CommunityRankSnapshots;
  stickerChatMessages?: StickerChatMessage[];
  animeComments?: AnimeCommentItem[];
  rewardProfiles?: Record<string, RewardUserProfile>;
}

export const ALL_ANIME_GENRES: AnimeGenreName[] = [
  'Action',
  'Adventure',
  'Drama',
  'Romance',
  'Comedy',
  'Psychological',
  'Thriller',
  'Mystery',
  'Sci-Fi',
  'Fantasy',
  'Dark Fantasy',
  'Supernatural',
  'Horror',
  'Historical',
  'Crime',
  'Slice of Life',
  'Sports',
  'Music',
  'Mecha',
  'Military',
  'Coming-of-Age',
  'Tragedy',
  'School Life',
  'Isekai',
  'Suspense',
];

export const ALL_ANIME_DEMOGRAPHICS: AnimeDemographic[] = [
  'Shonen',
  'Seinen',
  'Shojo',
  'Josei',
];

export const DISCOVERY_CATEGORIES: DiscoveryCategory[] = [
  'Dark Fantasy',
  'Action / Combat',
  'Psych / Mystery',
  'Drama / Emotional',
];

export const VERIFIED_POSTER_OPTIONS: { label: string; url: string }[] = [
  { label: 'Vinland Saga', url: '/assets/anime/vinlandsaga.jpg' },
  { label: 'Fullmetal Alchemist: Brotherhood', url: '/assets/anime/fmab.jpg' },
  { label: 'Attack on Titan', url: '/assets/anime/aot.jpg' },
  { label: 'Bleach', url: '/assets/anime/bleach.png' },
  { label: 'Naruto', url: '/assets/anime/naruto.jpg' },
  { label: 'Demon Slayer', url: '/assets/anime/demonslayer.jpg' },
  { label: 'Cyberpunk: Edgerunners', url: '/assets/anime/edgerunners.jpg' },
  { label: 'Erased', url: '/assets/anime/erased.jpg' },
  { label: 'Terror in Resonance', url: '/assets/anime/terror.png' },
  { label: 'Odd Taxi', url: '/assets/anime/oddtaxi.jpg' },
  { label: 'Solo Leveling', url: '/assets/anime/sololeveling.png' },
  { label: 'Monster', url: '/assets/anime/monster.jpg' },
  { label: 'Steins;Gate', url: '/assets/anime/steinsgate.jpg' },
  { label: "Hell's Paradise: Jigokuraku", url: '/assets/anime/hellsparadise.jpg' },
  { label: 'Dororo', url: '/assets/anime/dororo.jpg' },
  { label: 'Dorohedoro', url: '/assets/anime/dorohedoro.jpg' },
  { label: 'Made in Abyss', url: '/assets/anime/madeinabyss.jpg' },
  { label: 'Claymore', url: '/assets/anime/claymore.jpg' },
  { label: 'Chainsaw Man', url: '/assets/anime/csm.png' },
  { label: 'Jujutsu Kaisen', url: '/assets/anime/jjk.jpg' },
  { label: 'Hunter x Hunter (2011)', url: '/assets/anime/hxh2011.png' },
  { label: 'Samurai Champloo', url: '/assets/anime/samuraichamploo.png' },
  { label: 'Golden Kamuy', url: '/assets/anime/goldenkamuy.jpg' },
  { label: 'Pluto', url: '/assets/anime/pluto.png' },
  { label: 'Psycho-Pass', url: '/assets/anime/psychopass.jpg' },
  { label: 'Heavenly Delusion', url: '/assets/anime/heavenlydelusion.jpg' },
  { label: 'Parasyte: The Maxim', url: '/assets/anime/parasyte.jpg' },
  { label: 'The Promised Neverland', url: '/assets/anime/promisedneverland.jpg' },
  { label: '86 Eighty-Six', url: '/assets/anime/eightysix.jpg' },
  { label: 'Violet Evergarden', url: '/assets/anime/violetevergarden.png' },
  { label: "Frieren: Beyond Journey's End", url: '/assets/anime/frieren.jpg' },
  { label: 'To Your Eternity', url: '/assets/anime/toyoureternity.jpg' },
  { label: 'The Apothecary Diaries', url: '/assets/anime/apothecarydiaries.jpg' },
];

export const DEFAULT_ANIME_COLLECTION: CompletedAnimeItem[] = [
  {
    id: 'col-01',
    rank: 1,
    title: 'Vinland Saga',
    posterUrl: '/assets/anime/vinlandsaga.jpg',
    genres: ['Historical', 'Action', 'Adventure', 'Drama'],
    demographic: 'Seinen',
    frontNote: "Thorfinn's story. Deep, about war and peace.",
    lifeLesson: 'Revenge consumes you. True strength is forgiving and building a better future.',
  },
  {
    id: 'col-02',
    rank: 2,
    title: 'Fullmetal Alchemist: Brotherhood',
    posterUrl: '/assets/anime/fmab.jpg',
    genres: ['Action', 'Adventure', 'Fantasy', 'Drama'],
    demographic: 'Shonen',
    frontNote: 'Best story ever. Perfect ending.',
    lifeLesson: 'Every choice has consequences. Nothing valuable comes without sacrifice.',
  },
  {
    id: 'col-03',
    rank: 3,
    title: 'Attack on Titan',
    posterUrl: '/assets/anime/aot.jpg',
    genres: ['Action', 'Dark Fantasy', 'Mystery', 'Drama'],
    demographic: 'Shonen',
    frontNote: 'Eren Yeager. What a plot twist.',
    lifeLesson: 'Freedom without understanding others becomes another oppression.',
  },
  {
    id: 'col-04',
    rank: 4,
    title: 'Bleach',
    posterUrl: '/assets/anime/bleach.png',
    genres: ['Action', 'Adventure', 'Supernatural', 'Fantasy'],
    demographic: 'Shonen',
    frontNote: 'Ichigo and Soul Society. Bankai!',
    lifeLesson: 'Strength is protecting who matters and standing when others cannot.',
  },
  {
    id: 'col-05',
    rank: 5,
    title: 'Naruto',
    posterUrl: '/assets/anime/naruto.jpg',
    genres: ['Action', 'Adventure', 'Fantasy', 'Drama'],
    demographic: 'Shonen',
    frontNote: 'My childhood. Believe it!',
    lifeLesson: "Circumstances don't define you. Perseverance + belief take you further.",
  },
  {
    id: 'col-06',
    rank: 6,
    title: 'Demon Slayer',
    posterUrl: '/assets/anime/demonslayer.jpg',
    genres: ['Action', 'Adventure', 'Dark Fantasy'],
    demographic: 'Shonen',
    frontNote: 'Animation is insane. Tanjiro.',
    lifeLesson: 'Never let suffering kill your humanity. Kindness survives darkness.',
  },
  {
    id: 'col-07',
    rank: 7,
    title: 'Cyberpunk: Edgerunners',
    posterUrl: '/assets/anime/edgerunners.jpg',
    genres: ['Sci-Fi', 'Action', 'Drama', 'Tragedy'],
    demographic: 'Seinen',
    frontNote: 'Short but sad. David and Lucy.',
    lifeLesson: "Ambition without balance destroys you. Don't lose yourself.",
  },
  {
    id: 'col-08',
    rank: 8,
    title: 'Erased',
    posterUrl: '/assets/anime/erased.jpg',
    genres: ['Mystery', 'Thriller', 'Drama', 'Supernatural'],
    demographic: 'Seinen',
    frontNote: 'Time travel to save his friend. Emotional.',
    lifeLesson: 'One small kindness can change a whole life.',
  },
  {
    id: 'col-09',
    rank: 9,
    title: 'Terror in Resonance',
    posterUrl: '/assets/anime/terror.png',
    genres: ['Psychological', 'Thriller', 'Mystery', 'Drama'],
    demographic: 'Seinen',
    frontNote: 'Two boys, bombs and classical music.',
    lifeLesson: 'Behind every action is a story. Trauma leaves lasting wounds.',
  },
  {
    id: 'col-10',
    rank: 10,
    title: 'Odd Taxi',
    posterUrl: '/assets/anime/oddtaxi.jpg',
    genres: ['Mystery', 'Crime', 'Psychological', 'Thriller'],
    demographic: 'Seinen',
    frontNote: 'Walrus taxi driver. Mystery. Very underrated.',
    lifeLesson: "Everyone hides a story. Don't judge by what you see.",
  },
  {
    id: 'col-11',
    rank: 11,
    title: 'Solo Leveling',
    posterUrl: '/assets/anime/sololeveling.png',
    genres: ['Action', 'Fantasy', 'Adventure', 'Supernatural'],
    demographic: 'Shonen',
    frontNote: 'Arise! Jinwoo is too cool.',
    lifeLesson: 'Growth needs consistency, discipline, facing the impossible.',
  },
];

export const DEFAULT_CURRENTLY_WATCHING_LIST: CurrentlyWatchingItem[] = [
  {
    id: 'watch-01',
    title: 'Monster',
    posterUrl: '/assets/anime/monster.jpg',
    genres: ['Psychological', 'Mystery', 'Thriller', 'Crime'],
    demographic: 'Seinen',
    note: 'Psychological. Very smart. Johan is scary.',
    statusLabel: 'Currently Watching. No final rating.',
    currentEp: 1,
    totalEp: 74,
  },
  {
    id: 'watch-02',
    title: 'Steins;Gate',
    posterUrl: '/assets/anime/steinsgate.jpg',
    genres: ['Sci-Fi', 'Psychological', 'Thriller', 'Drama'],
    demographic: 'Seinen',
    note: 'Time machine. El Psy Kongroo.',
    statusLabel: 'Currently Watching. No final rating.',
    currentEp: 1,
    totalEp: 24,
  },
];

export const DEFAULT_DISCOVERY_LIST: DiscoveryAnimeItem[] = [
  // A. DARK FANTASY
  {
    id: 'disc-01',
    title: "Hell's Paradise: Jigokuraku",
    posterUrl: '/assets/anime/hellsparadise.jpg',
    category: 'Dark Fantasy',
    genres: ['Dark Fantasy', 'Action', 'Adventure', 'Supernatural'],
    demographic: 'Shonen',
    synopsis: 'Condemned criminals hunt elixir on terrifying island.',
    whyOnList: 'Survival + mystery + brutal combat.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },
  {
    id: 'disc-02',
    title: 'Dororo',
    posterUrl: '/assets/anime/dororo.jpg',
    category: 'Dark Fantasy',
    genres: ['Historical', 'Action', 'Dark Fantasy'],
    demographic: 'Shonen',
    synopsis: 'Swordsman fights demons to reclaim stolen body parts.',
    whyOnList: 'Deep character + humanity questions.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },
  {
    id: 'disc-03',
    title: 'Dorohedoro',
    posterUrl: '/assets/anime/dorohedoro.jpg',
    category: 'Dark Fantasy',
    genres: ['Dark Fantasy', 'Action', 'Mystery', 'Horror'],
    demographic: 'Seinen',
    synopsis: 'Reptile-head man hunts sorcerer who changed him.',
    whyOnList: 'Weird world, distinct art, unpredictable.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },
  {
    id: 'disc-04',
    title: 'Made in Abyss',
    posterUrl: '/assets/anime/madeinabyss.jpg',
    category: 'Dark Fantasy',
    genres: ['Adventure', 'Dark Fantasy', 'Mystery'],
    demographic: 'Seinen',
    synopsis: 'Two explorers descend into mysterious abyss.',
    whyOnList: 'Incredible world-building, unsettling exploration.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },
  {
    id: 'disc-05',
    title: 'Claymore',
    posterUrl: '/assets/anime/claymore.jpg',
    category: 'Dark Fantasy',
    genres: ['Dark Fantasy', 'Action', 'Horror'],
    demographic: 'Shonen',
    synopsis: 'Claymore warriors fight monsters, struggle with their power.',
    whyOnList: 'Dark, sword combat, morally complex.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },

  // B. ACTION / COMBAT
  {
    id: 'disc-06',
    title: 'Chainsaw Man',
    posterUrl: '/assets/anime/csm.png',
    category: 'Action / Combat',
    genres: ['Action', 'Dark Fantasy', 'Horror', 'Supernatural'],
    demographic: 'Shonen',
    synopsis: 'Boy becomes devil-hybrid, enters violent contracts.',
    whyOnList: 'Wild action, beyond normal fighting anime.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },
  {
    id: 'disc-07',
    title: 'Jujutsu Kaisen',
    posterUrl: '/assets/anime/jjk.jpg',
    category: 'Action / Combat',
    genres: ['Action', 'Supernatural', 'Dark Fantasy'],
    demographic: 'Shonen',
    synopsis: 'Student swallows cursed object, enters curse world.',
    whyOnList: 'Exceptional fights, abilities, character dynamics.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },
  {
    id: 'disc-08',
    title: 'Hunter x Hunter (2011)',
    posterUrl: '/assets/anime/hxh2011.png',
    category: 'Action / Combat',
    genres: ['Adventure', 'Action', 'Fantasy'],
    demographic: 'Shonen',
    synopsis: 'Boy enters hunter world, complex challenges.',
    whyOnList: 'Best power-system, strategic battles.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },
  {
    id: 'disc-09',
    title: 'Samurai Champloo',
    posterUrl: '/assets/anime/samuraichamploo.png',
    category: 'Action / Combat',
    genres: ['Action', 'Adventure', 'Historical'],
    demographic: 'Seinen',
    synopsis: 'Three companions search for mysterious samurai.',
    whyOnList: 'Samurai + hip-hop + music + story.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },
  {
    id: 'disc-10',
    title: 'Golden Kamuy',
    posterUrl: '/assets/anime/goldenkamuy.jpg',
    category: 'Action / Combat',
    genres: ['Adventure', 'Historical', 'Action', 'Mystery'],
    demographic: 'Seinen',
    synopsis: 'Ex-soldier hunts hidden gold in N. Japan.',
    whyOnList: 'History, survival, humour, great characters.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },

  // C. PSYCH / MYSTERY
  {
    id: 'disc-11',
    title: 'Pluto',
    posterUrl: '/assets/anime/pluto.png',
    category: 'Psych / Mystery',
    genres: ['Sci-Fi', 'Mystery', 'Psychological', 'Drama'],
    demographic: 'Seinen',
    synopsis: 'Detective probes murders of robots + humans.',
    whyOnList: 'Philosophy, humanity questions.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },
  {
    id: 'disc-12',
    title: 'Psycho-Pass',
    posterUrl: '/assets/anime/psychopass.jpg',
    category: 'Psych / Mystery',
    genres: ['Psychological', 'Sci-Fi', 'Crime', 'Thriller'],
    demographic: 'Seinen',
    synopsis: 'Society measures criminal potential.',
    whyOnList: 'Justice, freedom, surveillance, morality.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },
  {
    id: 'disc-13',
    title: 'Heavenly Delusion',
    posterUrl: '/assets/anime/heavenlydelusion.jpg',
    category: 'Psych / Mystery',
    genres: ['Sci-Fi', 'Mystery', 'Adventure', 'Psychological'],
    demographic: 'Seinen',
    synopsis: 'Two travellers seek Heaven in ruined world.',
    whyOnList: 'Intriguing mysteries, unpredictable.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },
  {
    id: 'disc-14',
    title: 'Parasyte: The Maxim',
    posterUrl: '/assets/anime/parasyte.jpg',
    category: 'Psych / Mystery',
    genres: ['Horror', 'Sci-Fi', 'Psychological', 'Action'],
    demographic: 'Seinen',
    synopsis: "Alien tries to take over boy's body.",
    whyOnList: 'Survival, identity, what makes us human.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },
  {
    id: 'disc-15',
    title: 'The Promised Neverland',
    posterUrl: '/assets/anime/promisedneverland.jpg',
    category: 'Psych / Mystery',
    genres: ['Psychological', 'Mystery', 'Thriller', 'Horror'],
    demographic: 'Shonen',
    synopsis: 'Orphans discover horrifying secret.',
    whyOnList: 'Suspense, smart strategies, high stakes.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },

  // D. DRAMA / EMOTIONAL
  {
    id: 'disc-16',
    title: '86 Eighty-Six',
    posterUrl: '/assets/anime/eightysix.jpg',
    category: 'Drama / Emotional',
    genres: ['Sci-Fi', 'Military', 'Drama', 'Action'],
    demographic: 'Seinen',
    synopsis: 'Young soldiers fight war society ignores.',
    whyOnList: 'Discrimination, war, sacrifice, dignity.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },
  {
    id: 'disc-17',
    title: 'Violet Evergarden',
    posterUrl: '/assets/anime/violetevergarden.png',
    category: 'Drama / Emotional',
    genres: ['Drama', 'Coming-of-Age', 'Slice of Life'],
    demographic: 'Shojo',
    synopsis: 'Ex-soldier learns emotions writing letters.',
    whyOnList: 'Beautiful animation, deeply moving.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },
  {
    id: 'disc-18',
    title: "Frieren: Beyond Journey's End",
    posterUrl: '/assets/anime/frieren.jpg',
    category: 'Drama / Emotional',
    genres: ['Fantasy', 'Adventure', 'Drama'],
    demographic: 'Shonen',
    synopsis: 'Elf mage reflects on time + friendship.',
    whyOnList: 'Thoughtful, world-building, life perspective.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },
  {
    id: 'disc-19',
    title: 'To Your Eternity',
    posterUrl: '/assets/anime/toyoureternity.jpg',
    category: 'Drama / Emotional',
    genres: ['Fantasy', 'Adventure', 'Drama'],
    demographic: 'Shonen',
    synopsis: 'Immortal being learns humanity through lives.',
    whyOnList: 'Existence, loss, growth.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },
  {
    id: 'disc-20',
    title: 'The Apothecary Diaries',
    posterUrl: '/assets/anime/apothecarydiaries.jpg',
    category: 'Drama / Emotional',
    genres: ['Historical', 'Mystery', 'Drama'],
    demographic: 'Josei',
    synopsis: 'Clever apothecary solves palace mysteries.',
    whyOnList: 'Smart mysteries, great characters, historical.',
    watchlistStatus: 'Candidate · Pending Confirmation',
  },
];

export const DEFAULT_ANIME_UNIVERSE_STATE: AnimeUniverseState = {
  collection: DEFAULT_ANIME_COLLECTION,
  watching: DEFAULT_CURRENTLY_WATCHING_LIST,
  discovery: DEFAULT_DISCOVERY_LIST,
  pendingSuggestions: [],
  communityVotes: [],
  communityRankSnapshots: {
    week: {},
    month: {},
    year: {},
    all_time: {},
  },
  stickerChatMessages: [],
  animeComments: [],
  rewardProfiles: {},
};
