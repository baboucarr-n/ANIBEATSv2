import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_ANIME_UNIVERSE_STATE,
  type AnimeUniverseState,
  type CurrentlyWatchingItem,
} from './data/animeUniverseData';
import {
  animeUniverseApi,
  type ApproveSuggestionPayload,
  type CommunityVotePayload,
  type CompletedAnimePayload,
  type DiscoveryAnimePayload,
  type PromoteDiscoveryPayload,
  type SubmitSuggestionPayload,
  type WatchingAnimePayload,
} from './services/animeUniverseApi';
import { HeroStartingPage } from './components/HeroStartingPage';
import { HeroSandTransition } from './components/HeroSandTransition';
import { AnimeUniverseSection } from './components/AnimeUniverseSection';
import { AnimeAdminDrawer } from './components/AnimeAdminDrawer';
import { BeatsUniverseSection } from './components/BeatsUniverseSection';

export default function App() {
  const [animeState, setAnimeState] = useState<AnimeUniverseState>(DEFAULT_ANIME_UNIVERSE_STATE);
  const [adminOpen, setAdminOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    animeUniverseApi
      .getAll()
      .then((data) => {
        if (active && data?.collection) {
          setAnimeState(data);
        }
      })
      .catch(() => {
        // Hydrate gracefully from exact verbatim PDF defaults when offline
      });
    return () => {
      active = false;
    };
  }, []);

  const runMutation = useCallback(async (action: () => Promise<AnimeUniverseState>) => {
    setBusy(true);
    setApiError(null);
    try {
      const next = await action();
      setAnimeState(next);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Unable to save anime update.');
    } finally {
      setBusy(false);
    }
  }, []);

  const scrollToAnimeUniverse = useCallback(() => {
    const el = document.getElementById('anime-universe');
    if (el) {
      const targetTop = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  }, []);

  const scrollToBeatsUniverse = useCallback(() => {
    const el = document.getElementById('beats-universe');
    if (el) {
      const targetTop = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  }, []);

  const handleIncrementWatchingEp = useCallback(
    async (item: CurrentlyWatchingItem) => {
      const nextEp = Math.min(item.totalEp, item.currentEp + 1);
      await runMutation(() =>
        animeUniverseApi.updateWatchingItem(item.id, {
          title: item.title,
          posterUrl: item.posterUrl,
          genres: item.genres,
          demographic: item.demographic,
          note: item.note,
          statusLabel: item.statusLabel,
          currentEp: nextEp,
          totalEp: item.totalEp,
        })
      );
    },
    [runMutation]
  );

  const handleRefreshStickerMessages = useCallback(async () => {
    try {
      const latest = await animeUniverseApi.getStickerMessages();
      setAnimeState((prev) => {
        const current = prev.stickerChatMessages ?? [];
        if (JSON.stringify(current) === JSON.stringify(latest)) {
          return prev;
        }
        return { ...prev, stickerChatMessages: latest };
      });
    } catch {
      // ignore transient background poll errors
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      <HeroSandTransition>
        <HeroStartingPage
          onEnterAnime={scrollToAnimeUniverse}
          onEnterBeats={scrollToBeatsUniverse}
        />
      </HeroSandTransition>

      <div className="relative z-10 -mt-[100dvh]">
        <AnimeUniverseSection
          state={animeState}
          busy={busy}
          onOpenAdmin={() => {
            setApiError(null);
            setAdminOpen(true);
          }}
          onIncrementWatchingEp={handleIncrementWatchingEp}
          onSubmitSuggestion={(payload: SubmitSuggestionPayload) =>
            runMutation(() => animeUniverseApi.submitSuggestion(payload))
          }
          onVoteAnime={(payload: CommunityVotePayload) =>
            runMutation(() => animeUniverseApi.submitVote(payload))
          }
          onSendStickerMessage={(payload: {
            text?: string;
            stickerId?: string;
            senderName?: string;
            voterId?: string;
            dayKey?: string;
          }) => runMutation(() => animeUniverseApi.sendStickerMessage(payload))}
          onToggleStickerHeart={(messageId: string, voterId: string) =>
            runMutation(() => animeUniverseApi.toggleStickerHeart(messageId, voterId))
          }
          onRefreshStickerMessages={handleRefreshStickerMessages}
          onAddAnimeComment={(payload: {
            animeId: string;
            voterId: string;
            authorName?: string;
            text: string;
          }) => runMutation(() => animeUniverseApi.addAnimeComment(payload))}
          onUpdateRewardProfile={(payload: {
            voterId: string;
            displayName?: string;
          }) => runMutation(() => animeUniverseApi.updateRewardProfile(payload))}
        />
        <BeatsUniverseSection />
      </div>

      <AnimeAdminDrawer
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        state={animeState}
        busy={busy}
        errorMessage={apiError}
        onAddCollection={(payload: CompletedAnimePayload) =>
          runMutation(() => animeUniverseApi.addCollectionItem(payload))
        }
        onUpdateCollection={(id: string, payload: CompletedAnimePayload) =>
          runMutation(() => animeUniverseApi.updateCollectionItem(id, payload))
        }
        onDeleteCollection={(id: string) =>
          runMutation(() => animeUniverseApi.deleteCollectionItem(id))
        }
        onReorderCollection={(orderedIds: string[]) =>
          runMutation(() => animeUniverseApi.reorderCollection(orderedIds))
        }
        onAddWatching={(payload: WatchingAnimePayload) =>
          runMutation(() => animeUniverseApi.addWatchingItem(payload))
        }
        onUpdateWatching={(id: string, payload: WatchingAnimePayload) =>
          runMutation(() => animeUniverseApi.updateWatchingItem(id, payload))
        }
        onDeleteWatching={(id: string) =>
          runMutation(() => animeUniverseApi.deleteWatchingItem(id))
        }
        onAddDiscovery={(payload: DiscoveryAnimePayload) =>
          runMutation(() => animeUniverseApi.addDiscoveryItem(payload))
        }
        onUpdateDiscovery={(id: string, payload: DiscoveryAnimePayload) =>
          runMutation(() => animeUniverseApi.updateDiscoveryItem(id, payload))
        }
        onDeleteDiscovery={(id: string) =>
          runMutation(() => animeUniverseApi.deleteDiscoveryItem(id))
        }
        onPromoteDiscovery={(id: string, payload: PromoteDiscoveryPayload) =>
          runMutation(() => animeUniverseApi.promoteDiscoveryToCollection(id, payload))
        }
        onApproveSuggestion={(id: string, payload?: ApproveSuggestionPayload) =>
          runMutation(() => animeUniverseApi.approveSuggestion(id, payload))
        }
        onRejectSuggestion={(id: string) =>
          runMutation(() => animeUniverseApi.rejectSuggestion(id))
        }
        onDeleteStickerMessage={(id: string) =>
          runMutation(() => animeUniverseApi.deleteStickerMessage(id))
        }
        onDeleteAnimeComment={(id: string) =>
          runMutation(() => animeUniverseApi.deleteAnimeComment(id))
        }
        onResetDefaults={() => runMutation(() => animeUniverseApi.resetToPdfDefaults())}
      />
    </div>
  );
}
