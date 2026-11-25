package com.anibeats.service;

import com.anibeats.model.AnimeUniverseModels.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@Service
public class AnimeUniverseService {

    private final ObjectMapper objectMapper;
    private final Path storagePath;
    private final Object lock = new Object();
    private AnimeUniverseState state;

    public AnimeUniverseService(
        ObjectMapper objectMapper,
        @Value("${anibeats.anime.storage.file:data/anime-universe-db.json}") String storageFile
    ) {
        this.objectMapper = objectMapper;
        this.storagePath = Path.of(storageFile);
    }

    @PostConstruct
    public void init() throws IOException {
        synchronized (lock) {
            if (Files.exists(storagePath)) {
                state = objectMapper.readValue(storagePath.toFile(), AnimeUniverseState.class);
            } else {
                state = createDefaultState();
                persist();
            }
        }
    }

    public AnimeUniverseState getState() {
        synchronized (lock) {
            return state;
        }
    }

    public AnimeUniverseState addCollectionItem(CompletedAnimeItem input) throws IOException {
        synchronized (lock) {
            validateTitle(input.title);
            String poster = sanitizePosterUrl(input.posterUrl);
            int targetRank = clampRank(input.rank, state.collection.size() + 1);
            CompletedAnimeItem created = new CompletedAnimeItem(
                "col-" + System.currentTimeMillis(),
                targetRank,
                input.title.trim(),
                poster,
                sanitizeGenres(input.genres),
                safeDemographic(input.demographic),
                safeText(input.frontNote),
                safeText(input.lifeLesson)
            );
            state.collection.add(targetRank - 1, created);
            reindexCollection();
            persist();
            return state;
        }
    }

    public AnimeUniverseState updateCollectionItem(String id, CompletedAnimeItem input) throws IOException {
        synchronized (lock) {
            validateTitle(input.title);
            int existingIdx = -1;
            for (int i = 0; i < state.collection.size(); i++) {
                if (state.collection.get(i).id.equals(id)) {
                    existingIdx = i;
                    break;
                }
            }
            if (existingIdx < 0) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Anime collection entry not found");
            }
            CompletedAnimeItem item = state.collection.remove(existingIdx);
            item.title = input.title.trim();
            item.posterUrl = sanitizePosterUrl(input.posterUrl);
            item.genres = sanitizeGenres(input.genres);
            item.demographic = safeDemographic(input.demographic);
            item.frontNote = safeText(input.frontNote);
            item.lifeLesson = safeText(input.lifeLesson);

            int targetRank = clampRank(input.rank, state.collection.size() + 1);
            state.collection.add(targetRank - 1, item);
            reindexCollection();
            persist();
            return state;
        }
    }

    public AnimeUniverseState deleteCollectionItem(String id) throws IOException {
        synchronized (lock) {
            boolean removed = state.collection.removeIf(item -> item.id.equals(id));
            if (!removed) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Anime collection entry not found");
            }
            reindexCollection();
            persist();
            return state;
        }
    }

    public AnimeUniverseState reorderCollection(List<String> orderedIds) throws IOException {
        synchronized (lock) {
            if (orderedIds == null || orderedIds.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "orderedIds is required");
            }
            Map<String, CompletedAnimeItem> byId = new LinkedHashMap<>();
            for (CompletedAnimeItem item : state.collection) {
                byId.put(item.id, item);
            }
            List<CompletedAnimeItem> reordered = new ArrayList<>();
            for (String id : orderedIds) {
                CompletedAnimeItem found = byId.remove(id);
                if (found != null) reordered.add(found);
            }
            reordered.addAll(byId.values());
            state.collection = reordered;
            reindexCollection();
            persist();
            return state;
        }
    }

    public AnimeUniverseState addWatchingItem(CurrentlyWatchingItem input) throws IOException {
        synchronized (lock) {
            validateTitle(input.title);
            CurrentlyWatchingItem created = new CurrentlyWatchingItem(
                "watch-" + System.currentTimeMillis(),
                input.title.trim(),
                sanitizePosterUrl(input.posterUrl),
                sanitizeGenres(input.genres),
                safeDemographic(input.demographic),
                safeText(input.note),
                input.statusLabel == null || input.statusLabel.trim().isEmpty()
                    ? "Currently Watching. No final rating."
                    : input.statusLabel.trim(),
                Math.max(0, input.currentEp),
                Math.max(1, input.totalEp)
            );
            state.watching.add(created);
            persist();
            return state;
        }
    }

    public AnimeUniverseState updateWatchingItem(String id, CurrentlyWatchingItem input) throws IOException {
        synchronized (lock) {
            validateTitle(input.title);
            CurrentlyWatchingItem target = state.watching.stream()
                .filter(w -> w.id.equals(id))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Watching entry not found"));

            target.title = input.title.trim();
            target.posterUrl = sanitizePosterUrl(input.posterUrl);
            target.genres = sanitizeGenres(input.genres);
            target.demographic = safeDemographic(input.demographic);
            target.note = safeText(input.note);
            target.statusLabel = (input.statusLabel == null || input.statusLabel.trim().isEmpty())
                ? "Currently Watching. No final rating."
                : input.statusLabel.trim();
            target.currentEp = Math.max(0, input.currentEp);
            target.totalEp = Math.max(1, input.totalEp);
            persist();
            return state;
        }
    }

    public AnimeUniverseState deleteWatchingItem(String id) throws IOException {
        synchronized (lock) {
            boolean removed = state.watching.removeIf(w -> w.id.equals(id));
            if (!removed) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Watching entry not found");
            }
            persist();
            return state;
        }
    }

    public AnimeUniverseState addDiscoveryItem(DiscoveryAnimeItem input) throws IOException {
        synchronized (lock) {
            validateTitle(input.title);
            DiscoveryAnimeItem created = new DiscoveryAnimeItem(
                "disc-" + System.currentTimeMillis(),
                input.title.trim(),
                sanitizePosterUrl(input.posterUrl),
                safeCategory(input.category),
                sanitizeGenres(input.genres),
                safeDemographic(input.demographic),
                safeText(input.synopsis),
                safeText(input.whyOnList),
                input.watchlistStatus == null || input.watchlistStatus.trim().isEmpty()
                    ? "Candidate · Pending Confirmation"
                    : input.watchlistStatus.trim()
            );
            state.discovery.add(created);
            persist();
            return state;
        }
    }

    public AnimeUniverseState updateDiscoveryItem(String id, DiscoveryAnimeItem input) throws IOException {
        synchronized (lock) {
            validateTitle(input.title);
            DiscoveryAnimeItem target = state.discovery.stream()
                .filter(d -> d.id.equals(id))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Discovery candidate not found"));

            target.title = input.title.trim();
            target.posterUrl = sanitizePosterUrl(input.posterUrl);
            target.category = safeCategory(input.category);
            target.genres = sanitizeGenres(input.genres);
            target.demographic = safeDemographic(input.demographic);
            target.synopsis = safeText(input.synopsis);
            target.whyOnList = safeText(input.whyOnList);
            target.watchlistStatus = (input.watchlistStatus == null || input.watchlistStatus.trim().isEmpty())
                ? "Candidate · Pending Confirmation"
                : input.watchlistStatus.trim();
            persist();
            return state;
        }
    }

    public AnimeUniverseState deleteDiscoveryItem(String id) throws IOException {
        synchronized (lock) {
            boolean removed = state.discovery.removeIf(d -> d.id.equals(id));
            if (!removed) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Discovery candidate not found");
            }
            persist();
            return state;
        }
    }

    public AnimeUniverseState promoteDiscoveryToCollection(String id, PromoteDiscoveryRequest req) throws IOException {
        synchronized (lock) {
            if (req == null || !req.confirmedWatched()) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Explicit watched confirmation is required before moving Discovery to Collection"
                );
            }
            DiscoveryAnimeItem candidate = state.discovery.stream()
                .filter(d -> d.id.equals(id))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Discovery candidate not found"));

            int requestedRank = req.rank() == null ? state.collection.size() + 1 : req.rank();
            int targetRank = clampRank(requestedRank, state.collection.size() + 1);

            CompletedAnimeItem promoted = new CompletedAnimeItem(
                "col-" + System.currentTimeMillis(),
                targetRank,
                candidate.title,
                candidate.posterUrl,
                candidate.genres,
                candidate.demographic,
                safeText(req.frontNote()).isEmpty() ? candidate.whyOnList : safeText(req.frontNote()),
                safeText(req.lifeLesson())
            );

            state.discovery.removeIf(d -> d.id.equals(id));
            state.collection.add(targetRank - 1, promoted);
            reindexCollection();
            persist();
            return state;
        }
    }

    public AnimeUniverseState resetToDefaults() throws IOException {
        synchronized (lock) {
            state = createDefaultState();
            persist();
            return state;
        }
    }

    private void reindexCollection() {
        for (int i = 0; i < state.collection.size(); i++) {
            state.collection.get(i).rank = i + 1;
        }
    }

    private int clampRank(int rank, int max) {
        if (rank < 1) return 1;
        return Math.min(rank, Math.max(1, max));
    }

    private void validateTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
        }
    }

    private String sanitizePosterUrl(String url) {
        if (url == null || url.trim().isEmpty()) return "/assets/anime/aot.jpg";
        String trimmed = url.trim();
        if (trimmed.startsWith("/assets/") || trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
            return trimmed;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Poster URL must start with /assets/, http://, or https://");
    }

    private List<String> sanitizeGenres(List<String> genres) {
        if (genres == null || genres.isEmpty()) return List.of("Action");
        return genres.stream().filter(Objects::nonNull).map(String::trim).filter(s -> !s.isEmpty()).distinct().toList();
    }

    private String safeDemographic(String demo) {
        if (demo == null) return "Shonen";
        return switch (demo.trim()) {
            case "Shonen", "Seinen", "Shojo", "Josei" -> demo.trim();
            default -> "Shonen";
        };
    }

    private String safeCategory(String cat) {
        if (cat == null) return "Dark Fantasy";
        return switch (cat.trim()) {
            case "Dark Fantasy", "Action / Combat", "Psych / Mystery", "Drama / Emotional" -> cat.trim();
            default -> "Dark Fantasy";
        };
    }

    private String safeText(String val) {
        return val == null ? "" : val.trim();
    }

    private void persist() throws IOException {
        if (storagePath.getParent() != null) {
            Files.createDirectories(storagePath.getParent());
        }
        objectMapper.writeValue(storagePath.toFile(), state);
    }

    private AnimeUniverseState createDefaultState() {
        AnimeUniverseState s = new AnimeUniverseState();
        s.collection = new ArrayList<>(List.of(
            new CompletedAnimeItem("col-01", 1, "Vinland Saga", "/assets/anime/vinlandsaga.jpg", List.of("Historical", "Action", "Adventure", "Drama"), "Seinen", "Thorfinn's story. Deep, about war and peace.", "Revenge consumes you. True strength is forgiving and building a better future."),
            new CompletedAnimeItem("col-02", 2, "Fullmetal Alchemist: Brotherhood", "/assets/anime/fmab.jpg", List.of("Action", "Adventure", "Fantasy", "Drama"), "Shonen", "Best story ever. Perfect ending.", "Every choice has consequences. Nothing valuable comes without sacrifice."),
            new CompletedAnimeItem("col-03", 3, "Attack on Titan", "/assets/anime/aot.jpg", List.of("Action", "Dark Fantasy", "Mystery", "Drama"), "Shonen", "Eren Yeager. What a plot twist.", "Freedom without understanding others becomes another oppression."),
            new CompletedAnimeItem("col-04", 4, "Bleach", "/assets/anime/bleach.png", List.of("Action", "Adventure", "Supernatural", "Fantasy"), "Shonen", "Ichigo and Soul Society. Bankai!", "Strength is protecting who matters and standing when others cannot."),
            new CompletedAnimeItem("col-05", 5, "Naruto", "/assets/anime/naruto.jpg", List.of("Action", "Adventure", "Fantasy", "Drama"), "Shonen", "My childhood. Believe it!", "Circumstances don't define you. Perseverance + belief take you further."),
            new CompletedAnimeItem("col-06", 6, "Demon Slayer", "/assets/anime/demonslayer.jpg", List.of("Action", "Adventure", "Dark Fantasy"), "Shonen", "Animation is insane. Tanjiro.", "Never let suffering kill your humanity. Kindness survives darkness."),
            new CompletedAnimeItem("col-07", 7, "Cyberpunk: Edgerunners", "/assets/anime/edgerunners.jpg", List.of("Sci-Fi", "Action", "Drama", "Tragedy"), "Seinen", "Short but sad. David and Lucy.", "Ambition without balance destroys you. Don't lose yourself."),
            new CompletedAnimeItem("col-08", 8, "Erased", "/assets/anime/erased.jpg", List.of("Mystery", "Thriller", "Drama", "Supernatural"), "Seinen", "Time travel to save his friend. Emotional.", "One small kindness can change a whole life."),
            new CompletedAnimeItem("col-09", 9, "Terror in Resonance", "/assets/anime/terror.png", List.of("Psychological", "Thriller", "Mystery", "Drama"), "Seinen", "Two boys, bombs and classical music.", "Behind every action is a story. Trauma leaves lasting wounds."),
            new CompletedAnimeItem("col-10", 10, "Odd Taxi", "/assets/anime/oddtaxi.jpg", List.of("Mystery", "Crime", "Psychological", "Thriller"), "Seinen", "Walrus taxi driver. Mystery. Very underrated.", "Everyone hides a story. Don't judge by what you see."),
            new CompletedAnimeItem("col-11", 11, "Solo Leveling", "/assets/anime/sololeveling.png", List.of("Action", "Fantasy", "Adventure", "Supernatural"), "Shonen", "Arise! Jinwoo is too cool.", "Growth needs consistency, discipline, facing the impossible.")
        ));

        s.watching = new ArrayList<>(List.of(
            new CurrentlyWatchingItem("watch-01", "Monster", "/assets/anime/monster.jpg", List.of("Psychological", "Mystery", "Thriller", "Crime"), "Seinen", "Psychological. Very smart. Johan is scary.", "Currently Watching. No final rating.", 1, 74),
            new CurrentlyWatchingItem("watch-02", "Steins;Gate", "/assets/anime/steinsgate.jpg", List.of("Sci-Fi", "Psychological", "Thriller", "Drama"), "Seinen", "Time machine. El Psy Kongroo.", "Currently Watching. No final rating.", 1, 24)
        ));

        s.discovery = new ArrayList<>(List.of(
            new DiscoveryAnimeItem("disc-01", "Hell's Paradise: Jigokuraku", "/assets/anime/hellsparadise.jpg", "Dark Fantasy", List.of("Dark Fantasy", "Action", "Adventure", "Supernatural"), "Shonen", "Condemned criminals hunt elixir on terrifying island.", "Survival + mystery + brutal combat.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-02", "Dororo", "/assets/anime/dororo.jpg", "Dark Fantasy", List.of("Historical", "Action", "Dark Fantasy"), "Shonen", "Swordsman fights demons to reclaim stolen body parts.", "Deep character + humanity questions.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-03", "Dorohedoro", "/assets/anime/dorohedoro.jpg", "Dark Fantasy", List.of("Dark Fantasy", "Action", "Mystery", "Horror"), "Seinen", "Reptile-head man hunts sorcerer who changed him.", "Weird world, distinct art, unpredictable.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-04", "Made in Abyss", "/assets/anime/madeinabyss.jpg", "Dark Fantasy", List.of("Adventure", "Dark Fantasy", "Mystery"), "Seinen", "Two explorers descend into mysterious abyss.", "Incredible world-building, unsettling exploration.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-05", "Claymore", "/assets/anime/claymore.jpg", "Dark Fantasy", List.of("Dark Fantasy", "Action", "Horror"), "Shonen", "Claymore warriors fight monsters, struggle with their power.", "Dark, sword combat, morally complex.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-06", "Chainsaw Man", "/assets/anime/csm.png", "Action / Combat", List.of("Action", "Dark Fantasy", "Horror", "Supernatural"), "Shonen", "Boy becomes devil-hybrid, enters violent contracts.", "Wild action, beyond normal fighting anime.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-07", "Jujutsu Kaisen", "/assets/anime/jjk.jpg", "Action / Combat", List.of("Action", "Supernatural", "Dark Fantasy"), "Shonen", "Student swallows cursed object, enters curse world.", "Exceptional fights, abilities, character dynamics.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-08", "Hunter x Hunter (2011)", "/assets/anime/hxh2011.png", "Action / Combat", List.of("Adventure", "Action", "Fantasy"), "Shonen", "Boy enters hunter world, complex challenges.", "Best power-system, strategic battles.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-09", "Samurai Champloo", "/assets/anime/samuraichamploo.png", "Action / Combat", List.of("Action", "Adventure", "Historical"), "Seinen", "Three companions search for mysterious samurai.", "Samurai + hip-hop + music + story.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-10", "Golden Kamuy", "/assets/anime/goldenkamuy.jpg", "Action / Combat", List.of("Adventure", "Historical", "Action", "Mystery"), "Seinen", "Ex-soldier hunts hidden gold in N. Japan.", "History, survival, humour, great characters.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-11", "Pluto", "/assets/anime/pluto.png", "Psych / Mystery", List.of("Sci-Fi", "Mystery", "Psychological", "Drama"), "Seinen", "Detective probes murders of robots + humans.", "Philosophy, humanity questions.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-12", "Psycho-Pass", "/assets/anime/psychopass.jpg", "Psych / Mystery", List.of("Psychological", "Sci-Fi", "Crime", "Thriller"), "Seinen", "Society measures criminal potential.", "Justice, freedom, surveillance, morality.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-13", "Heavenly Delusion", "/assets/anime/heavenlydelusion.jpg", "Psych / Mystery", List.of("Sci-Fi", "Mystery", "Adventure", "Psychological"), "Seinen", "Two travellers seek Heaven in ruined world.", "Intriguing mysteries, unpredictable.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-14", "Parasyte: The Maxim", "/assets/anime/parasyte.jpg", "Psych / Mystery", List.of("Horror", "Sci-Fi", "Psychological", "Action"), "Seinen", "Alien tries to take over boy's body.", "Survival, identity, what makes us human.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-15", "The Promised Neverland", "/assets/anime/promisedneverland.jpg", "Psych / Mystery", List.of("Psychological", "Mystery", "Thriller", "Horror"), "Shonen", "Orphans discover horrifying secret.", "Suspense, smart strategies, high stakes.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-16", "86 Eighty-Six", "/assets/anime/eightysix.jpg", "Drama / Emotional", List.of("Sci-Fi", "Military", "Drama", "Action"), "Seinen", "Young soldiers fight war society ignores.", "Discrimination, war, sacrifice, dignity.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-17", "Violet Evergarden", "/assets/anime/violetevergarden.png", "Drama / Emotional", List.of("Drama", "Coming-of-Age", "Slice of Life"), "Shojo", "Ex-soldier learns emotions writing letters.", "Beautiful animation, deeply moving.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-18", "Frieren: Beyond Journey's End", "/assets/anime/frieren.jpg", "Drama / Emotional", List.of("Fantasy", "Adventure", "Drama"), "Shonen", "Elf mage reflects on time + friendship.", "Thoughtful, world-building, life perspective.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-19", "To Your Eternity", "/assets/anime/toyoureternity.jpg", "Drama / Emotional", List.of("Fantasy", "Adventure", "Drama"), "Shonen", "Immortal being learns humanity through lives.", "Existence, loss, growth.", "Candidate · Pending Confirmation"),
            new DiscoveryAnimeItem("disc-20", "The Apothecary Diaries", "/assets/anime/apothecarydiaries.jpg", "Drama / Emotional", List.of("Historical", "Mystery", "Drama"), "Josei", "Clever apothecary solves palace mysteries.", "Smart mysteries, great characters, historical.", "Candidate · Pending Confirmation")
        ));
        return s;
    }
}
