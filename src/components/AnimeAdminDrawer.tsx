import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import {
  ALL_ANIME_DEMOGRAPHICS,
  ALL_ANIME_GENRES,
  DISCOVERY_CATEGORIES,
  VERIFIED_POSTER_OPTIONS,
  type AnimeDemographic,
  type AnimeGenreName,
  type AnimeUniverseState,
  type CompletedAnimeItem,
  type CurrentlyWatchingItem,
  type DiscoveryAnimeItem,
  type DiscoveryCategory,
  type PendingAnimeSuggestion,
} from '../data/animeUniverseData';
import type {
  ApproveSuggestionPayload,
  CompletedAnimePayload,
  DiscoveryAnimePayload,
  PromoteDiscoveryPayload,
  WatchingAnimePayload,
} from '../services/animeUniverseApi';
import { StickerArt } from './StickerArt';

type AdminTab = 'collection' | 'watching' | 'discovery' | 'pending' | 'chat';

interface AnimeAdminDrawerProps {
  open: boolean;
  onClose: () => void;
  state: AnimeUniverseState;
  busy: boolean;
  errorMessage: string | null;
  onAddCollection: (payload: CompletedAnimePayload) => Promise<void>;
  onUpdateCollection: (id: string, payload: CompletedAnimePayload) => Promise<void>;
  onDeleteCollection: (id: string) => Promise<void>;
  onReorderCollection: (orderedIds: string[]) => Promise<void>;
  onAddWatching: (payload: WatchingAnimePayload) => Promise<void>;
  onUpdateWatching: (id: string, payload: WatchingAnimePayload) => Promise<void>;
  onDeleteWatching: (id: string) => Promise<void>;
  onAddDiscovery: (payload: DiscoveryAnimePayload) => Promise<void>;
  onUpdateDiscovery: (id: string, payload: DiscoveryAnimePayload) => Promise<void>;
  onDeleteDiscovery: (id: string) => Promise<void>;
  onPromoteDiscovery: (id: string, payload: PromoteDiscoveryPayload) => Promise<void>;
  onApproveSuggestion: (id: string, payload?: ApproveSuggestionPayload) => Promise<void>;
  onRejectSuggestion: (id: string) => Promise<void>;
  onDeleteStickerMessage: (id: string) => Promise<void>;
  onDeleteAnimeComment: (id: string) => Promise<void>;
  onResetDefaults: () => Promise<void>;
}

const DEFAULT_POSTER = '/assets/anime/vinlandsaga.jpg';

function GenrePicker({
  selected,
  onChange,
}: {
  selected: AnimeGenreName[];
  onChange: (next: AnimeGenreName[]) => void;
}) {
  const toggleGenre = (g: AnimeGenreName) => {
    if (selected.includes(g)) {
      if (selected.length === 1) return;
      onChange(selected.filter((x) => x !== g));
    } else {
      onChange([...selected, g]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-36 overflow-y-auto p-2.5 rounded-xl bg-slate-50 border border-slate-200">
      {ALL_ANIME_GENRES.map((genre) => {
        const active = selected.includes(genre);
        return (
          <button
            key={genre}
            type="button"
            onClick={() => toggleGenre(genre)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
              active
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-violet-50'
            }`}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
}

function PosterInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <select
        aria-label="Choose verified anime poster"
        value={VERIFIED_POSTER_OPTIONS.some((p) => p.url === value) ? value : '__custom__'}
        onChange={(e) => {
          if (e.target.value !== '__custom__') {
            onChange(e.target.value);
          }
        }}
        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
      >
        {VERIFIED_POSTER_OPTIONS.map((opt) => (
          <option key={opt.url} value={opt.url}>
            Poster Preset: {opt.label}
          </option>
        ))}
        <option value="__custom__">Custom Poster URL</option>
      </select>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/assets/anime/... or https://..."
        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500"
      />
    </div>
  );
}

export function AnimeAdminDrawer({
  open,
  onClose,
  state,
  busy,
  errorMessage,
  onAddCollection,
  onUpdateCollection,
  onDeleteCollection,
  onReorderCollection,
  onAddWatching,
  onUpdateWatching,
  onDeleteWatching,
  onAddDiscovery,
  onUpdateDiscovery,
  onDeleteDiscovery,
  onPromoteDiscovery,
  onApproveSuggestion,
  onRejectSuggestion,
  onDeleteStickerMessage,
  onDeleteAnimeComment,
  onResetDefaults,
}: AnimeAdminDrawerProps) {
  const pendingSuggestions = state.pendingSuggestions ?? [];
  const stickerMessages = state.stickerChatMessages ?? [];
  const animeComments = state.animeComments ?? [];
  const [tab, setTab] = useState<AdminTab>('collection');
  const [confirmReset, setConfirmReset] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [localMsg, setLocalMsg] = useState<string | null>(null);
  const [approvingSuggestion, setApprovingSuggestion] = useState<PendingAnimeSuggestion | null>(null);
  const [approveCategory, setApproveCategory] = useState<DiscoveryCategory>('Drama / Emotional');
  const [approveDemographic, setApproveDemographic] = useState<AnimeDemographic>('Shonen');
  const [approvePoster, setApprovePoster] = useState('/assets/anime/frieren.jpg');
  const [approveGenres, setApproveGenres] = useState<AnimeGenreName[]>(['Action', 'Drama']);

  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [colTitle, setColTitle] = useState('');
  const [colRank, setColRank] = useState<number>(state.collection.length + 1);
  const [colPoster, setColPoster] = useState(DEFAULT_POSTER);
  const [colGenres, setColGenres] = useState<AnimeGenreName[]>(['Action', 'Drama']);
  const [colDemographic, setColDemographic] = useState<AnimeDemographic>('Seinen');
  const [colFrontNote, setColFrontNote] = useState('');
  const [colLifeLesson, setColLifeLesson] = useState('');
  const [showColForm, setShowColForm] = useState(false);

  const [editingWatchId, setEditingWatchId] = useState<string | null>(null);
  const [watchTitle, setWatchTitle] = useState('');
  const [watchPoster, setWatchPoster] = useState(DEFAULT_POSTER);
  const [watchGenres, setWatchGenres] = useState<AnimeGenreName[]>(['Psychological', 'Mystery']);
  const [watchDemographic, setWatchDemographic] = useState<AnimeDemographic>('Seinen');
  const [watchNote, setWatchNote] = useState('');
  const [watchStatus, setWatchStatus] = useState('Currently Watching. No final rating.');
  const [watchCurrentEp, setWatchCurrentEp] = useState(1);
  const [watchTotalEp, setWatchTotalEp] = useState(24);
  const [showWatchForm, setShowWatchForm] = useState(false);

  const [editingDiscId, setEditingDiscId] = useState<string | null>(null);
  const [discTitle, setDiscTitle] = useState('');
  const [discPoster, setDiscPoster] = useState(DEFAULT_POSTER);
  const [discCategory, setDiscCategory] = useState<DiscoveryCategory>('Dark Fantasy');
  const [discGenres, setDiscGenres] = useState<AnimeGenreName[]>(['Dark Fantasy', 'Action']);
  const [discDemographic, setDiscDemographic] = useState<AnimeDemographic>('Shonen');
  const [discSynopsis, setDiscSynopsis] = useState('');
  const [discWhy, setDiscWhy] = useState('');
  const [discStatus, setDiscStatus] = useState('Candidate · Pending Confirmation');
  const [showDiscForm, setShowDiscForm] = useState(false);

  const [promotingItem, setPromotingItem] = useState<DiscoveryAnimeItem | null>(null);
  const [confirmedWatched, setConfirmedWatched] = useState(false);
  const [promoteRank, setPromoteRank] = useState<number>(state.collection.length + 1);
  const [promoteFrontNote, setPromoteFrontNote] = useState('');
  const [promoteLifeLesson, setPromoteLifeLesson] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const sortedCollection = [...state.collection].sort((a, b) => a.rank - b.rank);

  const openAddCollection = () => {
    setEditingColId(null);
    setColTitle('');
    setColRank(sortedCollection.length + 1);
    setColPoster(DEFAULT_POSTER);
    setColGenres(['Action', 'Drama']);
    setColDemographic('Seinen');
    setColFrontNote('');
    setColLifeLesson('');
    setShowColForm(true);
    setLocalMsg(null);
  };

  const openEditCollection = (item: CompletedAnimeItem) => {
    setEditingColId(item.id);
    setColTitle(item.title);
    setColRank(item.rank);
    setColPoster(item.posterUrl);
    setColGenres(item.genres);
    setColDemographic(item.demographic);
    setColFrontNote(item.frontNote);
    setColLifeLesson(item.lifeLesson);
    setShowColForm(true);
    setLocalMsg(null);
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colTitle.trim() || !colFrontNote.trim() || !colLifeLesson.trim()) {
      setLocalMsg('Title, Front Note, and Life Lesson are required.');
      return;
    }
    const payload: CompletedAnimePayload = {
      title: colTitle.trim(),
      rank: Number(colRank) || sortedCollection.length + 1,
      posterUrl: colPoster.trim() || DEFAULT_POSTER,
      genres: colGenres,
      demographic: colDemographic,
      frontNote: colFrontNote.trim(),
      lifeLesson: colLifeLesson.trim(),
    };
    if (editingColId) {
      await onUpdateCollection(editingColId, payload);
      setLocalMsg(`Updated "${payload.title}".`);
    } else {
      await onAddCollection(payload);
      setLocalMsg(`Added "${payload.title}" to Collection.`);
    }
    setShowColForm(false);
  };

  const handleMoveRank = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= sortedCollection.length) return;
    const ids = sortedCollection.map((i) => i.id);
    const [moved] = ids.splice(idx, 1);
    ids.splice(target, 0, moved);
    await onReorderCollection(ids);
  };

  const openAddWatching = () => {
    setEditingWatchId(null);
    setWatchTitle('');
    setWatchPoster(DEFAULT_POSTER);
    setWatchGenres(['Psychological', 'Mystery']);
    setWatchDemographic('Seinen');
    setWatchNote('');
    setWatchStatus('Currently Watching. No final rating.');
    setWatchCurrentEp(1);
    setWatchTotalEp(24);
    setShowWatchForm(true);
    setLocalMsg(null);
  };

  const openEditWatching = (item: CurrentlyWatchingItem) => {
    setEditingWatchId(item.id);
    setWatchTitle(item.title);
    setWatchPoster(item.posterUrl);
    setWatchGenres(item.genres);
    setWatchDemographic(item.demographic);
    setWatchNote(item.note);
    setWatchStatus(item.statusLabel);
    setWatchCurrentEp(item.currentEp);
    setWatchTotalEp(item.totalEp);
    setShowWatchForm(true);
    setLocalMsg(null);
  };

  const handleSaveWatching = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!watchTitle.trim()) {
      setLocalMsg('Anime title is required.');
      return;
    }
    const payload: WatchingAnimePayload = {
      title: watchTitle.trim(),
      posterUrl: watchPoster.trim() || DEFAULT_POSTER,
      genres: watchGenres,
      demographic: watchDemographic,
      note: watchNote.trim(),
      statusLabel: watchStatus.trim() || 'Currently Watching. No final rating.',
      currentEp: Math.max(0, Number(watchCurrentEp) || 0),
      totalEp: Math.max(1, Number(watchTotalEp) || 12),
    };
    if (editingWatchId) {
      await onUpdateWatching(editingWatchId, payload);
      setLocalMsg(`Updated "${payload.title}".`);
    } else {
      await onAddWatching(payload);
      setLocalMsg(`Added "${payload.title}" to Currently Watching.`);
    }
    setShowWatchForm(false);
  };

  const openAddDiscovery = () => {
    setEditingDiscId(null);
    setDiscTitle('');
    setDiscPoster(DEFAULT_POSTER);
    setDiscCategory('Dark Fantasy');
    setDiscGenres(['Dark Fantasy', 'Action']);
    setDiscDemographic('Shonen');
    setDiscSynopsis('');
    setDiscWhy('');
    setDiscStatus('Candidate · Pending Confirmation');
    setShowDiscForm(true);
    setLocalMsg(null);
  };

  const openEditDiscovery = (item: DiscoveryAnimeItem) => {
    setEditingDiscId(item.id);
    setDiscTitle(item.title);
    setDiscPoster(item.posterUrl);
    setDiscCategory(item.category);
    setDiscGenres(item.genres);
    setDiscDemographic(item.demographic);
    setDiscSynopsis(item.synopsis);
    setDiscWhy(item.whyOnList);
    setDiscStatus(item.watchlistStatus);
    setShowDiscForm(true);
    setLocalMsg(null);
  };

  const handleSaveDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discTitle.trim() || !discSynopsis.trim()) {
      setLocalMsg('Title and Synopsis are required for Discovery.');
      return;
    }
    const payload: DiscoveryAnimePayload = {
      title: discTitle.trim(),
      posterUrl: discPoster.trim() || DEFAULT_POSTER,
      category: discCategory,
      genres: discGenres,
      demographic: discDemographic,
      synopsis: discSynopsis.trim(),
      whyOnList: discWhy.trim(),
      watchlistStatus: discStatus.trim() || 'Candidate · Pending Confirmation',
    };
    if (editingDiscId) {
      await onUpdateDiscovery(editingDiscId, payload);
      setLocalMsg(`Updated "${payload.title}".`);
    } else {
      await onAddDiscovery(payload);
      setLocalMsg(`Added "${payload.title}" to Discovery candidates.`);
    }
    setShowDiscForm(false);
  };

  const openPromoteModal = (item: DiscoveryAnimeItem) => {
    setPromotingItem(item);
    setConfirmedWatched(false);
    setPromoteRank(sortedCollection.length + 1);
    setPromoteFrontNote('');
    setPromoteLifeLesson('');
    setLocalMsg(null);
  };

  const handleConfirmPromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promotingItem) return;
    if (!confirmedWatched) {
      setLocalMsg('Please check the confirmation box confirming you finished watching this anime.');
      return;
    }
    if (!promoteFrontNote.trim() || !promoteLifeLesson.trim()) {
      setLocalMsg('Enter both your Front Note and short Life Lesson before moving to Collection.');
      return;
    }
    await onPromoteDiscovery(promotingItem.id, {
      confirmedWatched: true,
      rank: Number(promoteRank) || sortedCollection.length + 1,
      frontNote: promoteFrontNote.trim(),
      lifeLesson: promoteLifeLesson.trim(),
    });
    setLocalMsg(`Moved "${promotingItem.title}" to Completed Collection.`);
    setPromotingItem(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Manage Anime Universe"
    >
      <div className="relative w-full max-w-2xl h-full bg-[#FAF9FE] border-l border-white text-slate-900 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between gap-4 bg-white/85 backdrop-blur-md">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-700">
              Anime Universe Admin
            </p>
            <h2 className="text-lg font-bold text-slate-950 mt-0.5">
              Collection, Watching & Discovery
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/70 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>PDF Defaults</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200">
                <span className="text-[11px] text-rose-700 font-medium">Restore PDF list?</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    await onResetDefaults();
                    setConfirmReset(false);
                    setLocalMsg('Restored verbatim PDF collection, watching, and discovery.');
                  }}
                  className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-semibold cursor-pointer"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[11px] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close admin panel"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="px-6 pt-3 pb-2.5 border-b border-slate-200/80 bg-white/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setTab('collection')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              tab === 'collection'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-violet-50'
            }`}
          >
            Completed Collection ({state.collection.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('watching')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              tab === 'watching'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-cyan-50'
            }`}
          >
            Currently Watching ({state.watching.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('discovery')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              tab === 'discovery'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Discovery Candidates ({state.discovery.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('pending')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors inline-flex items-center gap-1.5 ${
              tab === 'pending'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Pending Suggestions</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                pendingSuggestions.length > 0
                  ? 'bg-[#EA843D] text-[#121417]'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {pendingSuggestions.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab('chat')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              tab === 'chat'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Chat & Comments ({stickerMessages.length + animeComments.length})
          </button>
        </div>

        {/* Status / Error Banner */}
        {(errorMessage || localMsg) && (
          <div className="mx-6 mt-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs shadow-sm">
            <span className={errorMessage ? 'text-rose-600 font-medium' : 'text-violet-700 font-medium'}>
              {errorMessage || localMsg}
            </span>
            <button
              type="button"
              onClick={() => setLocalMsg(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {tab === 'collection' && (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-600">
                  Reorder ranks, edit verbatim notes/life lessons, or add finished anime.
                </p>
                <button
                  type="button"
                  onClick={openAddCollection}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-600 to-cyan-600 text-white cursor-pointer shrink-0 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Completed</span>
                </button>
              </div>

              {showColForm && (
                <form
                  onSubmit={handleSaveCollection}
                  className="p-4 rounded-2xl bg-white border border-violet-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      {editingColId ? 'Edit Completed Anime' : 'Add Completed Anime'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowColForm(false)}
                      className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-600">Title</label>
                      <input
                        type="text"
                        value={colTitle}
                        onChange={(e) => setColTitle(e.target.value)}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Rank</label>
                      <input
                        type="number"
                        min={1}
                        max={sortedCollection.length + 1}
                        value={colRank}
                        onChange={(e) => setColRank(Number(e.target.value))}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Demographic</label>
                      <select
                        value={colDemographic}
                        onChange={(e) => setColDemographic(e.target.value as AnimeDemographic)}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      >
                        {ALL_ANIME_DEMOGRAPHICS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Poster Artwork</label>
                      <div className="mt-1">
                        <PosterInput value={colPoster} onChange={setColPoster} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">
                      Genres (multi-select)
                    </label>
                    <GenrePicker selected={colGenres} onChange={setColGenres} />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">
                      Front Note (1 line shown on poster front)
                    </label>
                    <input
                      type="text"
                      value={colFrontNote}
                      onChange={(e) => setColFrontNote(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">
                      Short Life Lesson (shown on 3D flip back)
                    </label>
                    <textarea
                      rows={2}
                      value={colLifeLesson}
                      onChange={(e) => setColLifeLesson(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={busy}
                      className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-600 to-cyan-600 text-white cursor-pointer disabled:opacity-50"
                    >
                      {busy ? 'Saving...' : editingColId ? 'Save Changes' : 'Add to Collection'}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {sortedCollection.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 shadow-[0_8px_20px_-14px_rgba(91,75,180,0.2)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.posterUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-10 h-14 rounded-lg object-cover bg-violet-50 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-data text-xs font-bold text-violet-700">
                            #{String(item.rank).padStart(2, '0')}
                          </span>
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-slate-500 shrink-0">
                            · {item.demographic}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-0.5">{item.frontNote}</p>
                        <p className="text-[11px] text-cyan-700 truncate mt-0.5">
                          Lesson: {item.lifeLesson}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={busy || idx === 0}
                        onClick={() => handleMoveRank(idx, -1)}
                        aria-label={`Move ${item.title} up in rank`}
                        className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-slate-100 hover:bg-violet-50 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={busy || idx === sortedCollection.length - 1}
                        onClick={() => handleMoveRank(idx, 1)}
                        aria-label={`Move ${item.title} down in rank`}
                        className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-slate-100 hover:bg-violet-50 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditCollection(item)}
                        aria-label={`Edit ${item.title}`}
                        className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-slate-100 hover:bg-cyan-50 text-cyan-700 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {deleteConfirmId === item.id ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={async () => {
                            await onDeleteCollection(item.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          aria-label={`Delete ${item.title}`}
                          className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-slate-100 hover:bg-rose-50 text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'watching' && (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-600">
                  Separated from Collection. Tracks episode progress with no final rating.
                </p>
                <button
                  type="button"
                  onClick={openAddWatching}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-700 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Watching</span>
                </button>
              </div>

              {showWatchForm && (
                <form
                  onSubmit={handleSaveWatching}
                  className="p-4 rounded-2xl bg-white border border-cyan-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      {editingWatchId ? 'Edit Watching Anime' : 'Add Watching Anime'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowWatchForm(false)}
                      className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Title</label>
                      <input
                        type="text"
                        value={watchTitle}
                        onChange={(e) => setWatchTitle(e.target.value)}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Demographic</label>
                      <select
                        value={watchDemographic}
                        onChange={(e) => setWatchDemographic(e.target.value as AnimeDemographic)}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      >
                        {ALL_ANIME_DEMOGRAPHICS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Status Label</label>
                      <input
                        type="text"
                        value={watchStatus}
                        onChange={(e) => setWatchStatus(e.target.value)}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Current Ep</label>
                        <input
                          type="number"
                          min={0}
                          value={watchCurrentEp}
                          onChange={(e) => setWatchCurrentEp(Number(e.target.value))}
                          className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Total Ep</label>
                        <input
                          type="number"
                          min={1}
                          value={watchTotalEp}
                          onChange={(e) => setWatchTotalEp(Number(e.target.value))}
                          className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Poster Artwork</label>
                    <div className="mt-1">
                      <PosterInput value={watchPoster} onChange={setWatchPoster} />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Genres</label>
                    <GenrePicker selected={watchGenres} onChange={setWatchGenres} />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Note</label>
                    <input
                      type="text"
                      value={watchNote}
                      onChange={(e) => setWatchNote(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={busy}
                      className="px-4 py-2 rounded-full text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-700 cursor-pointer"
                    >
                      {busy ? 'Saving...' : editingWatchId ? 'Save Changes' : 'Add Watching'}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2.5">
                {state.watching.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.posterUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-10 h-14 rounded-lg object-cover bg-cyan-50 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {item.title}
                          </span>
                          <span className="font-data text-xs font-semibold text-cyan-700">
                            Ep {item.currentEp}/{item.totalEp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate">{item.note}</p>
                        <p className="text-[11px] text-slate-400">{item.statusLabel}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditWatching(item)}
                        aria-label={`Edit ${item.title}`}
                        className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-slate-100 hover:bg-cyan-50 text-cyan-700 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {deleteConfirmId === item.id ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={async () => {
                            await onDeleteWatching(item.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          aria-label={`Delete ${item.title}`}
                          className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-slate-100 hover:bg-rose-50 text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'discovery' && (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-600">
                  Watchlist candidates only. Confirm completion explicitly before moving to Collection.
                </p>
                <button
                  type="button"
                  onClick={openAddDiscovery}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Recommendation</span>
                </button>
              </div>

              {promotingItem && (
                <form
                  onSubmit={handleConfirmPromote}
                  className="p-4 rounded-2xl bg-gradient-to-br from-white to-violet-50 border border-violet-300 space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-violet-700 shrink-0" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Confirm Watched & Move "{promotingItem.title}" to Collection
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPromotingItem(null)}
                      className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmedWatched}
                      onChange={(e) => setConfirmedWatched(e.target.checked)}
                      className="mt-0.5 accent-violet-600"
                    />
                    <span className="text-xs text-slate-700 leading-relaxed">
                      I confirm I have finished watching <strong>{promotingItem.title}</strong> and want to move it from Discovery into my ranked Completed Collection.
                    </span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Target Rank</label>
                      <input
                        type="number"
                        min={1}
                        max={sortedCollection.length + 1}
                        value={promoteRank}
                        onChange={(e) => setPromoteRank(Number(e.target.value))}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-600">
                        Front Note (1 line)
                      </label>
                      <input
                        type="text"
                        value={promoteFrontNote}
                        onChange={(e) => setPromoteFrontNote(e.target.value)}
                        placeholder="Your personal reaction..."
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">
                      Short Life Lesson (back of flip card)
                    </label>
                    <textarea
                      rows={2}
                      value={promoteLifeLesson}
                      onChange={(e) => setPromoteLifeLesson(e.target.value)}
                      placeholder="Short takeaway in your own words..."
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      disabled={busy || !confirmedWatched}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-600 to-cyan-600 text-white disabled:opacity-40 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{busy ? 'Moving...' : 'Confirm & Move to Collection'}</span>
                    </button>
                  </div>
                </form>
              )}

              {showDiscForm && (
                <form
                  onSubmit={handleSaveDiscovery}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      {editingDiscId ? 'Edit Discovery Candidate' : 'Add Discovery Recommendation'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowDiscForm(false)}
                      className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Title</label>
                      <input
                        type="text"
                        value={discTitle}
                        onChange={(e) => setDiscTitle(e.target.value)}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Category</label>
                      <select
                        value={discCategory}
                        onChange={(e) => setDiscCategory(e.target.value as DiscoveryCategory)}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      >
                        {DISCOVERY_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Demographic</label>
                      <select
                        value={discDemographic}
                        onChange={(e) => setDiscDemographic(e.target.value as AnimeDemographic)}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      >
                        {ALL_ANIME_DEMOGRAPHICS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Poster Artwork</label>
                    <div className="mt-1">
                      <PosterInput value={discPoster} onChange={setDiscPoster} />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Genres</label>
                    <GenrePicker selected={discGenres} onChange={setDiscGenres} />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Synopsis</label>
                    <input
                      type="text"
                      value={discSynopsis}
                      onChange={(e) => setDiscSynopsis(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Why on list</label>
                      <input
                        type="text"
                        value={discWhy}
                        onChange={(e) => setDiscWhy(e.target.value)}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Watchlist Status</label>
                      <input
                        type="text"
                        value={discStatus}
                        onChange={(e) => setDiscStatus(e.target.value)}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={busy}
                      className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                    >
                      {busy ? 'Saving...' : editingDiscId ? 'Save Changes' : 'Add Candidate'}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {state.discovery.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.posterUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-10 h-14 rounded-lg object-cover bg-violet-50 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-violet-700 font-medium shrink-0">
                            · {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate">{item.whyOnList}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.demographic} · {item.watchlistStatus}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openPromoteModal(item)}
                        className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-800 hover:bg-violet-600 hover:text-white cursor-pointer transition-colors"
                      >
                        Move to Collection
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditDiscovery(item)}
                        aria-label={`Edit ${item.title}`}
                        className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-slate-100 hover:bg-cyan-50 text-cyan-700 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {deleteConfirmId === item.id ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={async () => {
                            await onDeleteDiscovery(item.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          aria-label={`Delete ${item.title}`}
                          className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-slate-100 hover:bg-rose-50 text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TAB 4 — PENDING COMMUNITY SUGGESTIONS */}
          {tab === 'pending' && (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-600">
                  Community submissions wait here until approved. Approved anime move straight into Discovery; rejected ones are removed.
                </p>
              </div>

              {approvingSuggestion && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await onApproveSuggestion(approvingSuggestion.id, {
                      category: approveCategory,
                      demographic: approveDemographic,
                      posterUrl: approvePoster,
                      genres: approveGenres,
                    });
                    setLocalMsg(`Approved "${approvingSuggestion.title}" and added it to Discovery.`);
                    setApprovingSuggestion(null);
                  }}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Approve “{approvingSuggestion.title}” to Discovery
                    </h3>
                    <button
                      type="button"
                      onClick={() => setApprovingSuggestion(null)}
                      className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Discovery Category</label>
                      <select
                        value={approveCategory}
                        onChange={(e) => setApproveCategory(e.target.value as DiscoveryCategory)}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      >
                        {DISCOVERY_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Demographic</label>
                      <select
                        value={approveDemographic}
                        onChange={(e) => setApproveDemographic(e.target.value as AnimeDemographic)}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      >
                        {ALL_ANIME_DEMOGRAPHICS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Poster Artwork</label>
                    <div className="mt-1">
                      <PosterInput value={approvePoster} onChange={setApprovePoster} />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Genres</label>
                    <GenrePicker selected={approveGenres} onChange={setApproveGenres} />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#A8E84A]" />
                      <span>{busy ? 'Approving...' : 'Confirm & Move to Discovery'}</span>
                    </button>
                  </div>
                </form>
              )}

              {pendingSuggestions.length === 0 ? (
                <div className="py-12 px-4 rounded-2xl bg-white border border-slate-200 text-center">
                  <p className="text-sm font-semibold text-slate-800">No pending suggestions</p>
                  <p className="text-xs text-slate-500 mt-1">
                    When someone uses “Suggest an Anime”, it lands here for your approval.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingSuggestions.map((sug) => (
                    <div
                      key={sug.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                              Pending
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">{sug.title}</h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Suggested by <span className="font-semibold text-slate-800">{sug.submittedBy}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setApprovingSuggestion(sug);
                              setApproveCategory('Drama / Emotional');
                              setApproveDemographic('Shonen');
                              setApprovePoster('/assets/anime/frieren.jpg');
                              setApproveGenres(['Action', 'Drama']);
                              setLocalMsg(null);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#A8E84A]" />
                            <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={async () => {
                              await onRejectSuggestion(sug.id);
                              if (approvingSuggestion?.id === sug.id) {
                                setApprovingSuggestion(null);
                              }
                              setLocalMsg(`Rejected and removed "${sug.title}".`);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white disabled:opacity-40 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                        “{sug.why}”
                      </p>

                      <a
                        href={sug.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:underline break-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span>{sug.link}</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 5 — ANIME CHAT MODERATION */}
          {tab === 'chat' && (
            <>
              <p className="text-xs text-slate-600">
                Moderate live Anime Chat messages below. Newest messages appear first here for quick removal.
              </p>

              {stickerMessages.length === 0 ? (
                <div className="py-12 px-4 rounded-2xl bg-white border border-slate-200 text-center">
                  <p className="text-sm font-semibold text-slate-800">No chat messages yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...stickerMessages].reverse().map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {msg.stickerId && (
                          <StickerArt stickerId={msg.stickerId} sizeClass="w-14 h-14" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {msg.senderName || 'Anonymous'}
                          </p>
                          {msg.text && (
                            <p className="text-xs text-slate-700 break-words mt-0.5">{msg.text}</p>
                          )}
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {new Date(msg.createdAt).toLocaleString()} · {msg.hearts} hearts
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          await onDeleteStickerMessage(msg.id);
                          setLocalMsg('Deleted chat message.');
                        }}
                        aria-label="Delete chat message"
                        className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-slate-100 hover:bg-rose-50 text-rose-600 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 mt-4 border-t border-slate-200 space-y-2.5">
                <p className="text-xs font-bold text-slate-800">
                  Anime Card Comments ({animeComments.length})
                </p>
                {animeComments.length === 0 ? (
                  <p className="text-xs text-slate-500">No anime comments posted yet.</p>
                ) : (
                  <div className="space-y-2">
                    {[...animeComments].reverse().map((cmt) => (
                      <div
                        key={cmt.id}
                        className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {cmt.authorName || 'Anonymous'}
                          </p>
                          <p className="text-xs text-slate-700 break-words mt-0.5">{cmt.text}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {new Date(cmt.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={async () => {
                            await onDeleteAnimeComment(cmt.id);
                            setLocalMsg('Deleted anime comment.');
                          }}
                          aria-label="Delete anime comment"
                          className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-slate-100 hover:bg-rose-50 text-rose-600 cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
