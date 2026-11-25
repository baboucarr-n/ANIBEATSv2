import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Plus, Trash2, Check, RotateCcw, Download } from 'lucide-react';
import {
  type AnimeEntry,
  type CarCategoryKey,
  type CarEntry,
  type CurrentlyWatchingState,
  type JournalEntry,
  type PlaylistEntry,
  type SongOfTheWeek,
  type TravelDestination,
  type TravelWhyKey,
} from '../data/anibeatsData';
import { parseSpotifyUrl } from '../utils/spotify';
import {
  parseYouTubeUrl,
  type WeeklyMustItem,
  type WeeklyMustMood,
  type WeeklyMustTag,
} from '../utils/youtube';
import type { WeeklyMustPayload } from '../services/weeklyMustApi';

export type AdminTabKey = 'spotify' | 'weekly-must' | 'anime' | 'cars-travel' | 'story-data';

interface AdminPanelProps {
  isOpen: boolean;
  activeTab: AdminTabKey;
  onChangeTab: (tab: AdminTabKey) => void;
  onClose: () => void;

  // Data + Setters
  songOfTheWeek: SongOfTheWeek;
  onUpdateSongOfTheWeek: (next: SongOfTheWeek) => void;

  playlists: PlaylistEntry[];
  onUpdatePlaylists: (next: PlaylistEntry[]) => void;

  animeWall: AnimeEntry[];
  onUpdateAnimeWall: (next: AnimeEntry[]) => void;

  currentlyWatching: CurrentlyWatchingState;
  onUpdateCurrentlyWatching: (next: CurrentlyWatchingState) => void;

  cars: CarEntry[];
  onUpdateCars: (next: CarEntry[]) => void;

  travelTrips: TravelDestination[];
  onUpdateTravelTrips: (next: TravelDestination[]) => void;

  storyPersonalNote: string;
  onUpdateStoryNote: (note: string) => void;

  journalEntries: JournalEntry[];
  onUpdateJournalEntries: (next: JournalEntry[]) => void;

  onResetAllDefaults: () => void;
  backendStatus?: 'connected' | 'local';

  // Weekly MUST CRUD
  weeklyMusts: WeeklyMustItem[];
  onCreateWeeklyMust: (payload: WeeklyMustPayload) => Promise<void>;
  onUpdateWeeklyMust: (id: number, payload: WeeklyMustPayload) => Promise<void>;
  onDeleteWeeklyMust: (id: number) => Promise<void>;
  onSetCurrentWeeklyMust: (id: number) => Promise<void>;
}

const OFFICIAL_POSTER_PRESETS = [
  { label: 'Attack on Titan', url: '/assets/anime/aot.jpg' },
  { label: 'Jujutsu Kaisen', url: '/assets/anime/jjk.jpg' },
  { label: 'Initial D', url: '/assets/anime/initiald.jpg' },
  { label: 'Cyberpunk: Edgerunners', url: '/assets/anime/edgerunners.jpg' },
  { label: 'Solo Leveling', url: '/assets/anime/sololeveling.png' },
  { label: 'Chainsaw Man', url: '/assets/anime/csm.png' },
  { label: 'Your Name.', url: '/assets/anime/yourname.png' },
  { label: 'Demon Slayer', url: '/assets/anime/demonslayer.jpg' },
  { label: 'Death Note', url: '/assets/anime/deathnote.jpg' },
  { label: 'Vinland Saga', url: '/assets/anime/vinlandsaga.jpg' },
];

export function AdminPanel({
  isOpen,
  activeTab,
  onChangeTab,
  onClose,
  songOfTheWeek,
  onUpdateSongOfTheWeek,
  playlists,
  onUpdatePlaylists,
  animeWall,
  onUpdateAnimeWall,
  currentlyWatching,
  onUpdateCurrentlyWatching,
  cars,
  onUpdateCars,
  travelTrips,
  onUpdateTravelTrips,
  storyPersonalNote,
  onUpdateStoryNote,
  journalEntries,
  onUpdateJournalEntries,
  onResetAllDefaults,
  backendStatus = 'local',
  weeklyMusts,
  onCreateWeeklyMust,
  onUpdateWeeklyMust,
  onDeleteWeeklyMust,
  onSetCurrentWeeklyMust,
}: AdminPanelProps) {
  // New Playlist form
  const [newPlTitle, setNewPlTitle] = useState('');
  const [newPlMood, setNewPlMood] = useState('Hype · Custom');
  const [newPlDesc, setNewPlDesc] = useState('');
  const [newPlUrl, setNewPlUrl] = useState('');
  const [plStatus, setPlStatus] = useState('');

  // New Anime form
  const [newAnimeTitle, setNewAnimeTitle] = useState('');
  const [newAnimePoster, setNewAnimePoster] = useState(OFFICIAL_POSTER_PRESETS[0].url);
  const [newAnimeWhy, setNewAnimeWhy] = useState('');

  // New Car form
  const [newCarName, setNewCarName] = useState('');
  const [newCarCat, setNewCarCat] = useState<Exclude<CarCategoryKey, 'all'>>('jdm');
  const [newCarImg, setNewCarImg] = useState('/assets/cars/skyline_gtr.jpg');
  const [newCarWhy, setNewCarWhy] = useState('');

  // New Travel form
  const [newCountry, setNewCountry] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newWhyKey, setNewWhyKey] = useState<Exclude<TravelWhyKey, 'all'>>('anime');
  const [newTravelWhy, setNewTravelWhy] = useState('');
  const [newTravelAct, setNewTravelAct] = useState('');

  // New Journal Entry form
  const [newEntryDate, setNewEntryDate] = useState('Dec 2026');
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryAdded, setNewEntryAdded] = useState('');
  const [newEntryWhy, setNewEntryWhy] = useState('');

  const [confirmReset, setConfirmReset] = useState(false);

  // Weekly MUST CRUD form state
  const [editingWeeklyId, setEditingWeeklyId] = useState<number | null>(null);
  const [wmTitle, setWmTitle] = useState('');
  const [wmCreator, setWmCreator] = useState('');
  const [wmYoutubeUrl, setWmYoutubeUrl] = useState('');
  const [wmWhy, setWmWhy] = useState('');
  const [wmTag, setWmTag] = useState<WeeklyMustTag>('ANIME');
  const [wmMood, setWmMood] = useState<WeeklyMustMood>('');
  const [wmWeekLabel, setWmWeekLabel] = useState('Week 48 — 2026');
  const [wmIsCurrent, setWmIsCurrent] = useState(true);
  const [wmStatus, setWmStatus] = useState('');
  const [wmError, setWmError] = useState('');
  const [wmSaving, setWmSaving] = useState(false);

  const songValidation = parseSpotifyUrl(songOfTheWeek.spotifyUrl);
  const newPlValidation = parseSpotifyUrl(newPlUrl);
  const wmUrlValidation = parseYouTubeUrl(wmYoutubeUrl);

  const resetWeeklyForm = () => {
    setEditingWeeklyId(null);
    setWmTitle('');
    setWmCreator('');
    setWmYoutubeUrl('');
    setWmWhy('');
    setWmTag('ANIME');
    setWmMood('');
    setWmWeekLabel('Week 48 — 2026');
    setWmIsCurrent(true);
    setWmError('');
  };

  const handleStartEditWeekly = (item: WeeklyMustItem) => {
    setEditingWeeklyId(item.id);
    setWmTitle(item.title);
    setWmCreator(item.creator);
    setWmYoutubeUrl(item.youtubeUrl);
    setWmWhy(item.whyThisWeek);
    setWmTag(item.tag);
    setWmMood(item.moodTag || '');
    setWmWeekLabel(item.weekLabel);
    setWmIsCurrent(item.isCurrent);
    setWmStatus('');
    setWmError('');
  };

  const handleSubmitWeekly = async (e: FormEvent) => {
    e.preventDefault();
    setWmError('');
    setWmStatus('');

    if (!wmTitle.trim() || !wmCreator.trim() || !wmWeekLabel.trim()) {
      setWmError('Title, creator, and week label are required.');
      return;
    }

    // Creating requires a valid YouTube URL; editing placeholder allows empty only if keeping empty, otherwise must validate
    if (editingWeeklyId === null || wmYoutubeUrl.trim().length > 0) {
      if (!wmUrlValidation.valid) {
        setWmError('Enter a valid youtube.com/watch?v= or youtu.be/ URL.');
        return;
      }
    }

    setWmSaving(true);
    try {
      const payload: WeeklyMustPayload = {
        title: wmTitle.trim(),
        creator: wmCreator.trim(),
        youtubeUrl: wmYoutubeUrl.trim(),
        whyThisWeek: wmWhy.trim(),
        tag: wmTag,
        moodTag: wmMood,
        weekLabel: wmWeekLabel.trim(),
        isCurrent: wmIsCurrent,
      };
      if (editingWeeklyId !== null) {
        await onUpdateWeeklyMust(editingWeeklyId, payload);
        setWmStatus('Updated Weekly MUST!');
      } else {
        await onCreateWeeklyMust(payload);
        setWmStatus(
          wmIsCurrent
            ? 'Published new Current Weekly MUST (previous one moved to Archive).'
            : 'Saved Weekly MUST to Archive.'
        );
      }
      resetWeeklyForm();
    } catch (err) {
      setWmError(err instanceof Error ? err.message : 'Failed to save Weekly MUST.');
    } finally {
      setWmSaving(false);
    }
  };

  const handleAddPlaylist = (e: FormEvent) => {
    e.preventDefault();
    if (!newPlTitle.trim() || !newPlValidation.valid) {
      setPlStatus('Please enter a playlist title and a valid open.spotify.com link.');
      return;
    }

    const nextItem: PlaylistEntry = {
      id: `pl-${Date.now()}`,
      title: newPlTitle.trim(),
      moodLabel: newPlMood.trim() || 'Custom',
      description: newPlDesc.trim() || 'Added via ANIBEATS Admin Panel.',
      spotifyUrl: newPlUrl.trim(),
      moods: ['hype', 'chill'],
    };

    onUpdatePlaylists([nextItem, ...playlists]);
    setNewPlTitle('');
    setNewPlDesc('');
    setNewPlUrl('');
    setPlStatus('Added new Spotify playlist live!');
  };

  const handleAddAnime = (e: FormEvent) => {
    e.preventDefault();
    if (!newAnimeTitle.trim()) return;
    const nextItem: AnimeEntry = {
      id: `anime-${Date.now()}`,
      rank: animeWall.length + 1,
      title: newAnimeTitle.trim(),
      posterUrl: newAnimePoster.trim() || OFFICIAL_POSTER_PRESETS[0].url,
      genres: ['action'],
      genreLabel: 'Custom Pick',
      rating: 'Personal Pick',
      year: '2026',
      why: newAnimeWhy.trim() || 'Added via Admin Panel.',
      moods: ['hype'],
    };
    onUpdateAnimeWall([...animeWall, nextItem]);
    setNewAnimeTitle('');
    setNewAnimeWhy('');
  };

  const handleAddCar = (e: FormEvent) => {
    e.preventDefault();
    if (!newCarName.trim()) return;
    const catLabels: Record<Exclude<CarCategoryKey, 'all'>, string> = {
      jdm: 'JDM',
      supercars: 'Supercars',
      classics: 'Classics',
      daily: 'Dream Daily',
    };
    const nextCar: CarEntry = {
      id: `car-${Date.now()}`,
      rank: cars.length + 1,
      name: newCarName.trim(),
      category: newCarCat,
      categoryLabel: catLabels[newCarCat],
      imageUrl: newCarImg.trim() || '/assets/cars/skyline_gtr.jpg',
      why: newCarWhy.trim() || 'Added via Admin Panel.',
      moods: ['late-night', 'hype'],
    };
    onUpdateCars([...cars, nextCar]);
    setNewCarName('');
    setNewCarWhy('');
  };

  const handleAddTravel = (e: FormEvent) => {
    e.preventDefault();
    if (!newCountry.trim() || !newCity.trim()) return;
    const whyLabels: Record<Exclude<TravelWhyKey, 'all'>, string> = {
      anime: 'Anime Dream',
      rap: 'Rap / Music Dream',
      cars: 'Car Dream',
      culture: 'Culture / Food / Vibes',
    };
    const nextTrip: TravelDestination = {
      id: `trip-${Date.now()}`,
      rank: travelTrips.length + 1,
      country: newCountry.trim(),
      city: newCity.trim(),
      whyKey: newWhyKey,
      whyLabel: whyLabels[newWhyKey],
      whyText: newTravelWhy.trim() || 'Added via Admin Panel.',
      dreamActivity: newTravelAct.trim() || 'Explore the city.',
    };
    onUpdateTravelTrips([...travelTrips, nextTrip]);
    setNewCountry('');
    setNewCity('');
    setNewTravelWhy('');
    setNewTravelAct('');
  };

  const handleAddJournal = (e: FormEvent) => {
    e.preventDefault();
    if (!newEntryTitle.trim()) return;
    const nextEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      dateLabel: `Entry ${String(journalEntries.length + 1).padStart(2, '0')} · ${newEntryDate}`,
      title: newEntryTitle.trim(),
      added: newEntryAdded.trim() || 'Updated site content.',
      why: newEntryWhy.trim() || 'Keeping ANIBEATS alive.',
    };
    onUpdateJournalEntries([nextEntry, ...journalEntries]);
    setNewEntryTitle('');
    setNewEntryAdded('');
    setNewEntryWhy('');
  };

  const handleExportJson = () => {
    const payload = {
      songOfTheWeek,
      playlists,
      animeWall,
      currentlyWatching,
      cars,
      travelTrips,
      storyPersonalNote,
      journalEntries,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anibeats-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm flex justify-end"
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            onClick={(e) => e.stopPropagation()}
            aria-label="ANIBEATS Admin Panel"
            className="w-full max-w-2xl bg-white h-full border-l border-zinc-200 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between gap-4 shrink-0">
              <div>
                <p className="font-data text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                  ANIBEATS STUDIO · {backendStatus === 'connected' ? 'API BACKEND SYNCED' : 'LOCAL PERSISTENCE'}
                </p>
                <h2 className="text-xl font-extrabold text-zinc-950 mt-0.5">Admin Panel</h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Admin Panel"
                className="w-9 h-9 rounded-full border border-zinc-200 grid place-items-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="px-6 py-3 border-b border-zinc-200 bg-zinc-50/70 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {(
                [
                  { key: 'spotify', label: 'Spotify & Music' },
                  { key: 'weekly-must', label: 'Weekly MUST' },
                  { key: 'anime', label: 'Anime Wall' },
                  { key: 'cars-travel', label: 'Cars & Travel' },
                  { key: 'story-data', label: 'Story & Data' },
                ] as const
              ).map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => onChangeTab(tab.key)}
                    className={`relative px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      active ? 'text-zinc-950' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="adminTabPill"
                        transition={{ type: 'spring', stiffness: 520, damping: 36 }}
                        className="absolute inset-0 bg-white rounded-lg shadow-sm border border-zinc-200"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* TAB: WEEKLY MUST CRUD */}
              {activeTab === 'weekly-must' && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-zinc-950">
                          {editingWeeklyId !== null ? 'Edit Weekly MUST' : 'Add New Weekly MUST'}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Only one MUST is Current at a time — setting a new Current moves the old one to Archive automatically.
                        </p>
                      </div>
                      {editingWeeklyId !== null && (
                        <button
                          type="button"
                          onClick={resetWeeklyForm}
                          className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <form
                      onSubmit={handleSubmitWeekly}
                      className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            required
                            value={wmTitle}
                            onChange={(e) => setWmTitle(e.target.value)}
                            placeholder="Video title..."
                            className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">
                            Creator
                          </label>
                          <input
                            type="text"
                            required
                            value={wmCreator}
                            onChange={(e) => setWmCreator(e.target.value)}
                            placeholder="Channel or creator name"
                            className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-zinc-700">
                            YouTube URL
                          </label>
                          {wmYoutubeUrl && (
                            <span
                              className={`font-data text-[11px] ${
                                wmUrlValidation.valid ? 'text-emerald-700' : 'text-red-600'
                              }`}
                            >
                              {wmUrlValidation.valid
                                ? `Valid ID: ${wmUrlValidation.videoId}`
                                : 'Use youtube.com/watch?v= or youtu.be/'}
                            </span>
                          )}
                        </div>
                        <input
                          type="url"
                          required={editingWeeklyId === null}
                          value={wmYoutubeUrl}
                          onChange={(e) => setWmYoutubeUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                          className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm font-data"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">
                            Tag
                          </label>
                          <select
                            value={wmTag}
                            onChange={(e) => setWmTag(e.target.value as WeeklyMustTag)}
                            className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                          >
                            <option value="ANIME">Anime</option>
                            <option value="RAP">Rap</option>
                            <option value="CAR">Car</option>
                            <option value="TRAVEL">Travel</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">
                            Mood (optional)
                          </label>
                          <select
                            value={wmMood}
                            onChange={(e) => setWmMood(e.target.value as WeeklyMustMood)}
                            className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                          >
                            <option value="">None</option>
                            <option value="Hype">Hype</option>
                            <option value="Chill">Chill</option>
                            <option value="Late Night">Late Night</option>
                            <option value="Sad">Sad</option>
                            <option value="Workout">Workout</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">
                            Week Label
                          </label>
                          <input
                            type="text"
                            required
                            value={wmWeekLabel}
                            onChange={(e) => setWmWeekLabel(e.target.value)}
                            placeholder="Week 48 — 2026"
                            className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Why this one this week (your own words)
                        </label>
                        <textarea
                          rows={3}
                          value={wmWhy}
                          onChange={(e) => setWmWhy(e.target.value)}
                          placeholder="Why people have to watch this right now..."
                          className="w-full p-3 rounded-xl bg-white border border-zinc-200 text-sm"
                        />
                      </div>

                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={wmIsCurrent}
                          onChange={(e) => setWmIsCurrent(e.target.checked)}
                          className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                        />
                        <span>Set as Current Weekly MUST</span>
                      </label>

                      {wmError && (
                        <p className="text-xs font-medium text-red-600">{wmError}</p>
                      )}
                      {wmStatus && (
                        <p className="text-xs font-medium text-emerald-700">{wmStatus}</p>
                      )}

                      <div className="pt-1 flex items-center gap-3">
                        <button
                          type="submit"
                          disabled={wmSaving}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>
                            {wmSaving
                              ? 'Saving...'
                              : editingWeeklyId !== null
                              ? 'Save Changes'
                              : 'Add Weekly MUST'}
                          </span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Existing Weekly MUST Entries */}
                  <div className="pt-6 border-t border-zinc-200 space-y-3">
                    <h3 className="text-base font-bold text-zinc-950">
                      All Weekly MUSTs ({weeklyMusts.length})
                    </h3>

                    {weeklyMusts.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border space-y-2 ${
                          item.isCurrent
                            ? 'border-violet-300 bg-violet-50/40'
                            : 'border-zinc-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-data text-[11px] font-semibold text-violet-700">
                              {item.isCurrent ? 'CURRENT · ' : 'ARCHIVE · '}
                              {item.weekLabel} · {item.tag}
                              {item.moodTag ? ` · ${item.moodTag}` : ''}
                            </p>
                            <h4 className="text-sm font-bold text-zinc-950 mt-0.5 truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs text-zinc-500">{item.creator}</p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {!item.isCurrent && (
                              <button
                                type="button"
                                onClick={() => onSetCurrentWeeklyMust(item.id)}
                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-violet-600 hover:bg-violet-700 cursor-pointer whitespace-nowrap"
                              >
                                Set as Current
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleStartEditWeekly(item)}
                              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteWeeklyMust(item.id)}
                              aria-label={`Delete ${item.title}`}
                              className="p-1.5 text-zinc-400 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* TAB 1: SPOTIFY & MUSIC */}
              {activeTab === 'spotify' && (
                <>
                  {/* Song of the Week Editor */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-zinc-950">Song of the Week</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Paste any Spotify track, album, or playlist link — it updates the live embed automatically.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Track Title
                        </label>
                        <input
                          type="text"
                          value={songOfTheWeek.title}
                          onChange={(e) =>
                            onUpdateSongOfTheWeek({ ...songOfTheWeek, title: e.target.value })
                          }
                          className="w-full min-h-[40px] px-3 rounded-xl border border-zinc-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Artist
                        </label>
                        <input
                          type="text"
                          value={songOfTheWeek.artist}
                          onChange={(e) =>
                            onUpdateSongOfTheWeek({ ...songOfTheWeek, artist: e.target.value })
                          }
                          className="w-full min-h-[40px] px-3 rounded-xl border border-zinc-200 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-zinc-700">
                          Spotify URL (track or playlist)
                        </label>
                        <span
                          className={`font-data text-[11px] ${
                            songValidation.valid ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {songValidation.valid
                            ? `Valid ${songValidation.type}`
                            : 'Enter valid open.spotify.com URL'}
                        </span>
                      </div>
                      <input
                        type="url"
                        value={songOfTheWeek.spotifyUrl}
                        onChange={(e) =>
                          onUpdateSongOfTheWeek({ ...songOfTheWeek, spotifyUrl: e.target.value })
                        }
                        placeholder="https://open.spotify.com/track/..."
                        className="w-full min-h-[40px] px-3 rounded-xl border border-zinc-200 text-sm font-data"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Why it’s on repeat
                      </label>
                      <textarea
                        rows={2}
                        value={songOfTheWeek.why}
                        onChange={(e) =>
                          onUpdateSongOfTheWeek({ ...songOfTheWeek, why: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-sm"
                      />
                    </div>
                  </div>

                  {/* Add New Playlist */}
                  <div className="pt-6 border-t border-zinc-200">
                    <h3 className="text-base font-bold text-zinc-950 mb-3">
                      Add New Spotify Playlist
                    </h3>
                    <form onSubmit={handleAddPlaylist} className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={newPlTitle}
                          onChange={(e) => setNewPlTitle(e.target.value)}
                          placeholder="Playlist title (e.g., Gym Beats)"
                          className="min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                        />
                        <input
                          type="text"
                          value={newPlMood}
                          onChange={(e) => setNewPlMood(e.target.value)}
                          placeholder="Mood label (e.g., Hype · Workout)"
                          className="min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                        />
                      </div>

                      <div>
                        <input
                          type="url"
                          required
                          value={newPlUrl}
                          onChange={(e) => setNewPlUrl(e.target.value)}
                          placeholder="https://open.spotify.com/playlist/..."
                          className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm font-data"
                        />
                        {newPlUrl && (
                          <p
                            className={`font-data text-[11px] mt-1 ${
                              newPlValidation.valid ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {newPlValidation.valid
                              ? `Ready to embed (${newPlValidation.type})`
                              : 'Paste an open.spotify.com playlist, album, or track link'}
                          </p>
                        )}
                      </div>

                      <input
                        type="text"
                        value={newPlDesc}
                        onChange={(e) => setNewPlDesc(e.target.value)}
                        placeholder="Short note on when you play this..."
                        className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                      />

                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Playlist</span>
                        </button>
                        {plStatus && <span className="text-xs text-zinc-600">{plStatus}</span>}
                      </div>
                    </form>
                  </div>

                  {/* Existing Playlists Editor */}
                  <div className="pt-6 border-t border-zinc-200 space-y-4">
                    <h3 className="text-base font-bold text-zinc-950">
                      Current Playlists ({playlists.length})
                    </h3>
                    {playlists.map((pl) => (
                      <div
                        key={pl.id}
                        className="p-4 rounded-2xl border border-zinc-200 bg-white space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={pl.title}
                            onChange={(e) =>
                              onUpdatePlaylists(
                                playlists.map((item) =>
                                  item.id === pl.id ? { ...item, title: e.target.value } : item
                                )
                              )
                            }
                            className="font-bold text-sm text-zinc-950 border-b border-transparent focus:border-zinc-400 focus:outline-none flex-1"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              onUpdatePlaylists(playlists.filter((item) => item.id !== pl.id))
                            }
                            aria-label={`Remove ${pl.title}`}
                            className="p-1.5 text-zinc-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <input
                          type="url"
                          value={pl.spotifyUrl}
                          onChange={(e) =>
                            onUpdatePlaylists(
                              playlists.map((item) =>
                                item.id === pl.id
                                  ? { ...item, spotifyUrl: e.target.value }
                                  : item
                              )
                            )
                          }
                          className="w-full min-h-[38px] px-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-data"
                        />

                        <input
                          type="text"
                          value={pl.description}
                          onChange={(e) =>
                            onUpdatePlaylists(
                              playlists.map((item) =>
                                item.id === pl.id
                                  ? { ...item, description: e.target.value }
                                  : item
                              )
                            )
                          }
                          className="w-full min-h-[38px] px-3 rounded-lg bg-white border border-zinc-200 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* TAB 2: ANIME WALL */}
              {activeTab === 'anime' && (
                <>
                  {/* Currently Watching */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-zinc-950">Currently Watching</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Show Title
                        </label>
                        <input
                          type="text"
                          value={currentlyWatching.title}
                          onChange={(e) =>
                            onUpdateCurrentlyWatching({
                              ...currentlyWatching,
                              title: e.target.value,
                            })
                          }
                          className="w-full min-h-[40px] px-3 rounded-xl border border-zinc-200 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">
                            Ep
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={currentlyWatching.currentEp}
                            onChange={(e) =>
                              onUpdateCurrentlyWatching({
                                ...currentlyWatching,
                                currentEp: Number(e.target.value) || 0,
                              })
                            }
                            className="w-full min-h-[40px] px-2.5 rounded-xl border border-zinc-200 text-sm font-data"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">
                            Total
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={currentlyWatching.totalEp}
                            onChange={(e) =>
                              onUpdateCurrentlyWatching({
                                ...currentlyWatching,
                                totalEp: Math.max(1, Number(e.target.value) || 1),
                              })
                            }
                            className="w-full min-h-[40px] px-2.5 rounded-xl border border-zinc-200 text-sm font-data"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add Anime Entry */}
                  <div className="pt-6 border-t border-zinc-200">
                    <h3 className="text-base font-bold text-zinc-950 mb-3">Add Anime to Wall</h3>
                    <form onSubmit={handleAddAnime} className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                      <input
                        type="text"
                        required
                        value={newAnimeTitle}
                        onChange={(e) => setNewAnimeTitle(e.target.value)}
                        placeholder="Anime title"
                        className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                      />
                      <select
                        value={newAnimePoster}
                        onChange={(e) => setNewAnimePoster(e.target.value)}
                        className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                      >
                        {OFFICIAL_POSTER_PRESETS.map((p) => (
                          <option key={p.url} value={p.url}>
                            Official Poster: {p.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={newAnimePoster}
                        onChange={(e) => setNewAnimePoster(e.target.value)}
                        placeholder="Or paste custom official poster image URL..."
                        className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-xs font-data"
                      />
                      <input
                        type="text"
                        value={newAnimeWhy}
                        onChange={(e) => setNewAnimeWhy(e.target.value)}
                        placeholder="Why I love this show..."
                        className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Anime</span>
                      </button>
                    </form>
                  </div>

                  {/* Edit Existing Anime Entries */}
                  <div className="pt-6 border-t border-zinc-200 space-y-3">
                    <h3 className="text-base font-bold text-zinc-950">
                      Edit Wall Entries ({animeWall.length})
                    </h3>
                    {animeWall.map((anime) => (
                      <div
                        key={anime.id}
                        className="p-4 rounded-2xl border border-zinc-200 flex gap-3.5 items-start"
                      >
                        <img
                          src={anime.posterUrl}
                          alt={anime.title}
                          referrerPolicy="no-referrer"
                          className="w-12 h-16 rounded-lg object-cover border border-zinc-200 shrink-0"
                        />
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={anime.title}
                              onChange={(e) =>
                                onUpdateAnimeWall(
                                  animeWall.map((a) =>
                                    a.id === anime.id ? { ...a, title: e.target.value } : a
                                  )
                                )
                              }
                              className="font-bold text-sm text-zinc-950 border-b border-transparent focus:border-zinc-400 focus:outline-none flex-1"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateAnimeWall(animeWall.filter((a) => a.id !== anime.id))
                              }
                              aria-label={`Remove ${anime.title}`}
                              className="p-1 text-zinc-400 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={anime.why}
                            onChange={(e) =>
                              onUpdateAnimeWall(
                                animeWall.map((a) =>
                                  a.id === anime.id ? { ...a, why: e.target.value } : a
                                )
                              )
                            }
                            placeholder="Why I love this..."
                            className="w-full min-h-[34px] px-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* TAB 3: CARS & TRAVEL */}
              {activeTab === 'cars-travel' && (
                <>
                  {/* Add Car */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-zinc-950">Add Dream Car</h3>
                    <form onSubmit={handleAddCar} className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={newCarName}
                          onChange={(e) => setNewCarName(e.target.value)}
                          placeholder="Car name (e.g., Porsche 911 GT3 RS)"
                          className="min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                        />
                        <select
                          value={newCarCat}
                          onChange={(e) =>
                            setNewCarCat(e.target.value as Exclude<CarCategoryKey, 'all'>)
                          }
                          className="min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                        >
                          <option value="jdm">JDM</option>
                          <option value="supercars">Supercars</option>
                          <option value="classics">Classics</option>
                          <option value="daily">Dream Daily</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={newCarImg}
                        onChange={(e) => setNewCarImg(e.target.value)}
                        placeholder="Car image URL..."
                        className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-xs font-data"
                      />
                      <input
                        type="text"
                        value={newCarWhy}
                        onChange={(e) => setNewCarWhy(e.target.value)}
                        placeholder="Why this car matters to me..."
                        className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Car</span>
                      </button>
                    </form>
                  </div>

                  {/* Add Travel Destination */}
                  <div className="pt-6 border-t border-zinc-200 space-y-3">
                    <h3 className="text-base font-bold text-zinc-950">
                      Add Dream Destination (Toward 80)
                    </h3>
                    <form onSubmit={handleAddTravel} className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          required
                          value={newCountry}
                          onChange={(e) => setNewCountry(e.target.value)}
                          placeholder="Country"
                          className="min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                        />
                        <input
                          type="text"
                          required
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          placeholder="City"
                          className="min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                        />
                        <select
                          value={newWhyKey}
                          onChange={(e) =>
                            setNewWhyKey(e.target.value as Exclude<TravelWhyKey, 'all'>)
                          }
                          className="min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                        >
                          <option value="anime">Anime Dream</option>
                          <option value="rap">Rap / Music Dream</option>
                          <option value="cars">Car Dream</option>
                          <option value="culture">Culture / Food / Vibes</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={newTravelWhy}
                        onChange={(e) => setNewTravelWhy(e.target.value)}
                        placeholder="Why this place..."
                        className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                      />
                      <input
                        type="text"
                        value={newTravelAct}
                        onChange={(e) => setNewTravelAct(e.target.value)}
                        placeholder="Dream activity there..."
                        className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Destination</span>
                      </button>
                    </form>
                  </div>
                </>
              )}

              {/* TAB 4: STORY, JOURNAL & DATA */}
              {activeTab === 'story-data' && (
                <>
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-zinc-950">Story Personal Note</h3>
                    <textarea
                      rows={4}
                      value={storyPersonalNote}
                      onChange={(e) => onUpdateStoryNote(e.target.value)}
                      className="w-full p-3 rounded-xl border border-zinc-200 text-sm"
                    />
                  </div>

                  <div className="pt-6 border-t border-zinc-200 space-y-3">
                    <h3 className="text-base font-bold text-zinc-950">Add Dev Diary Entry</h3>
                    <form onSubmit={handleAddJournal} className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={newEntryDate}
                          onChange={(e) => setNewEntryDate(e.target.value)}
                          placeholder="Month Year"
                          className="min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                        />
                        <input
                          type="text"
                          required
                          value={newEntryTitle}
                          onChange={(e) => setNewEntryTitle(e.target.value)}
                          placeholder="Diary headline..."
                          className="sm:col-span-2 min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                        />
                      </div>
                      <input
                        type="text"
                        value={newEntryAdded}
                        onChange={(e) => setNewEntryAdded(e.target.value)}
                        placeholder="What I added..."
                        className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                      />
                      <input
                        type="text"
                        value={newEntryWhy}
                        onChange={(e) => setNewEntryWhy(e.target.value)}
                        placeholder="Why..."
                        className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-zinc-200 text-sm"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Publish Entry</span>
                      </button>
                    </form>
                  </div>

                  {/* Backup & Reset */}
                  <div className="pt-6 border-t border-zinc-200 space-y-3">
                    <h3 className="text-base font-bold text-zinc-950">Backup &amp; Reset</h3>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleExportJson}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-50 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export JSON Backup</span>
                      </button>

                      {!confirmReset ? (
                        <button
                          type="button"
                          onClick={() => setConfirmReset(true)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset to Defaults</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onResetAllDefaults();
                              setConfirmReset(false);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm Reset</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmReset(false)}
                            className="px-3 py-2 text-xs font-medium text-zinc-500 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
