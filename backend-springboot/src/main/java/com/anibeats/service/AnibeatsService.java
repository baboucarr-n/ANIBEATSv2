package com.anibeats.service;

import com.anibeats.model.AnibeatsModels.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnibeatsService {

    private final ObjectMapper objectMapper;
    private final Path storagePath;
    private final Object lock = new Object();
    private AnibeatsState state;

    public AnibeatsService(
        ObjectMapper objectMapper,
        @Value("${anibeats.storage.file:data/anibeats-db.json}") String storageFile
    ) {
        this.objectMapper = objectMapper;
        this.storagePath = Path.of(storageFile);
    }

    @PostConstruct
    public void init() throws IOException {
        synchronized (lock) {
            if (Files.exists(storagePath)) {
                state = objectMapper.readValue(storagePath.toFile(), AnibeatsState.class);
            } else {
                state = createDefaultState();
                persist();
            }
        }
    }

    public AnibeatsState getState() {
        synchronized (lock) {
            return state;
        }
    }

    public AnibeatsState replaceState(AnibeatsState next) throws IOException {
        synchronized (lock) {
            this.state = next;
            persist();
            return this.state;
        }
    }

    public AnibeatsState updateSongOfTheWeek(SongOfTheWeek song) throws IOException {
        synchronized (lock) {
            state.songOfTheWeek = song;
            persist();
            return state;
        }
    }

    public AnibeatsState updatePlaylists(List<PlaylistEntry> playlists) throws IOException {
        synchronized (lock) {
            state.playlists = new ArrayList<>(playlists);
            persist();
            return state;
        }
    }

    public AnibeatsState updateAnimeWall(List<AnimeEntry> animeWall) throws IOException {
        synchronized (lock) {
            state.animeWall = new ArrayList<>(animeWall);
            persist();
            return state;
        }
    }

    public AnibeatsState updateCurrentlyWatching(CurrentlyWatching watching) throws IOException {
        synchronized (lock) {
            state.currentlyWatching = watching;
            persist();
            return state;
        }
    }

    public AnibeatsState updateCars(List<CarEntry> cars) throws IOException {
        synchronized (lock) {
            state.cars = new ArrayList<>(cars);
            persist();
            return state;
        }
    }

    public AnibeatsState updateTravel(List<TravelDestination> trips, List<String> visitedIds) throws IOException {
        synchronized (lock) {
            if (trips != null) state.travelTrips = new ArrayList<>(trips);
            if (visitedIds != null) state.visitedTravelIds = new ArrayList<>(visitedIds);
            persist();
            return state;
        }
    }

    public AnibeatsState votePoll(int optionIndex) throws IOException {
        synchronized (lock) {
            List<Integer> votes = new ArrayList<>(state.pollState.votes());
            while (votes.size() < 3) votes.add(0);
            if (optionIndex >= 0 && optionIndex < votes.size()) {
                votes.set(optionIndex, votes.get(optionIndex) + 1);
            }
            state.pollState = new PollState(votes, optionIndex);
            persist();
            return state;
        }
    }

    public AnibeatsState addCommunityPlaylist(CommunityPlaylistPick pick) throws IOException {
        synchronized (lock) {
            state.communityPlaylists.add(0, pick);
            persist();
            return state;
        }
    }

    public AnibeatsState addSuggestion(FanSuggestion suggestion) throws IOException {
        synchronized (lock) {
            state.suggestions.add(0, suggestion);
            persist();
            return state;
        }
    }

    public AnibeatsState updateStoryAndJournal(String storyNote, List<JournalEntry> entries) throws IOException {
        synchronized (lock) {
            if (storyNote != null) state.storyPersonalNote = storyNote;
            if (entries != null) state.journalEntries = new ArrayList<>(entries);
            persist();
            return state;
        }
    }

    public AnibeatsState resetDefaults() throws IOException {
        synchronized (lock) {
            state = createDefaultState();
            persist();
            return state;
        }
    }

    private void persist() throws IOException {
        if (storagePath.getParent() != null) {
            Files.createDirectories(storagePath.getParent());
        }
        objectMapper.writeValue(storagePath.toFile(), state);
    }

    private AnibeatsState createDefaultState() {
        AnibeatsState s = new AnibeatsState();
        s.songOfTheWeek = new SongOfTheWeek(
            "Bling-Bang-Bang-Born (Test Track)",
            "Creepy Nuts",
            "https://open.spotify.com/track/0kdqcbwei4MDWFEX5f33yG",
            "Loaded as a verified test track — swap in your real Song of the Week link anytime from the Admin Panel."
        );
        s.currentlyWatching = new CurrentlyWatching(
            "Show In Progress — To be filled by me",
            12,
            24,
            "Update my current show & episode count directly from the Admin Panel."
        );
        s.animeWall = List.of(
            new AnimeEntry("anime-1", 1, "Attack on Titan", "/assets/anime/aot.jpg", List.of("action", "shonen", "ost"), "Action · OST Heavy", "To be filled by me", "2013", "To be filled by me — personal slot ready in Admin Panel.", List.of("hype", "workout")),
            new AnimeEntry("anime-2", 2, "Jujutsu Kaisen", "/assets/anime/jjk.jpg", List.of("action", "shonen"), "Action · Shonen", "To be filled by me", "2020", "To be filled by me — replace title, rating, or story anytime in Admin.", List.of("hype", "workout")),
            new AnimeEntry("anime-3", 3, "Initial D 1st Stage", "/assets/anime/initiald.jpg", List.of("cars", "action", "ost"), "Car / Racing · OST Heavy", "To be filled by me", "1998", "To be filled by me — touge night runs, Eurobeat energy, and pure car culture.", List.of("late-night", "hype")),
            new AnimeEntry("anime-4", 4, "Cyberpunk: Edgerunners", "/assets/anime/edgerunners.jpg", List.of("action", "ost"), "Action · OST Heavy", "To be filled by me", "2022", "To be filled by me — futuristic visuals and a soundtrack that stays with you.", List.of("late-night", "sad")),
            new AnimeEntry("anime-5", 5, "Solo Leveling", "/assets/anime/sololeveling.png", List.of("action", "shonen"), "Action · Shonen", "To be filled by me", "2024", "To be filled by me", List.of("hype", "workout")),
            new AnimeEntry("anime-6", 6, "Chainsaw Man", "/assets/anime/csm.png", List.of("action", "shonen", "ost"), "Action · OST Heavy", "To be filled by me", "2022", "To be filled by me", List.of("hype", "late-night")),
            new AnimeEntry("anime-7", 7, "Your Name.", "/assets/anime/yourname.png", List.of("romance", "ost"), "Romance · OST Heavy", "To be filled by me", "2016", "To be filled by me", List.of("sad", "chill")),
            new AnimeEntry("anime-8", 8, "Demon Slayer: Kimetsu no Yaiba", "/assets/anime/demonslayer.jpg", List.of("action", "shonen"), "Action · Shonen", "To be filled by me", "2019", "To be filled by me", List.of("hype", "workout")),
            new AnimeEntry("anime-9", 9, "Death Note", "/assets/anime/deathnote.jpg", List.of("ost"), "Thriller · OST Heavy", "To be filled by me", "2006", "To be filled by me", List.of("late-night")),
            new AnimeEntry("anime-10", 10, "Vinland Saga", "/assets/anime/vinlandsaga.jpg", List.of("action", "shonen"), "Action · Drama", "To be filled by me", "2019", "To be filled by me", List.of("sad", "chill"))
        );
        s.playlists = List.of(
            new PlaylistEntry("pl-1", "My Rap Rotation (Test: RapCaviar)", "Hype · Daily",
                "Verified test playlist — replace with your personal Spotify link in the Admin Panel.",
                "https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd", List.of("hype", "workout")),
            new PlaylistEntry("pl-2", "Anime OSTs That Hit Different (Test: Anime On Replay)", "Anime · Emotional",
                "Verified official Spotify Anime Hub playlist — swap with your custom playlist in Admin.",
                "https://open.spotify.com/playlist/37i9dQZF1DX0hAXqBDwvwI", List.of("hype", "sad")),
            new PlaylistEntry("pl-3", "Late Night Beats (Test: lofi beats)", "Chill · Late Night",
                "Verified chill instrumental rotation — swap with your personal Spotify link in Admin.",
                "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn", List.of("chill", "late-night", "sad")),
            new PlaylistEntry("pl-4", "Night Drive (Test: Retrowave // Outrun)", "Night Drive · Cars",
                "The bridge between Music and Cars — edit link & notes anytime in Admin.",
                "https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM", List.of("late-night", "hype"))
        );
        s.cars = List.of(
            new CarEntry("car-1", 1, "Nissan Skyline GT-R (R34)", "jdm", "JDM", "/assets/cars/skyline_gtr.jpg", "To be filled by me — JDM icon slot.", List.of("late-night", "hype")),
            new CarEntry("car-2", 2, "Toyota GR Supra", "jdm", "JDM", "/assets/cars/supra.png", "To be filled by me — pure coupe proportions.", List.of("hype", "workout")),
            new CarEntry("car-3", 3, "Mazda RX-7 (FD3S)", "classics", "Classics · JDM", "/assets/cars/rx7.jpg", "To be filled by me — rotary icon.", List.of("chill", "late-night")),
            new CarEntry("car-4", 4, "Dream Daily / Supercar — To be filled by me", "daily", "Dream Daily", "/src/assets/images/anibeats_car_visual_1795278851586.jpg", "To be filled by me", List.of("chill", "late-night"))
        );
        s.travelTrips = List.of(
            new TravelDestination("trip-1", 1, "Japan", "Tokyo & Hakone", "anime", "Anime Dream", "To be filled by me — walking Shibuya & Akihabara at night.", "To be filled by me"),
            new TravelDestination("trip-2", 2, "Germany", "Nürburgring & Stuttgart", "cars", "Car Dream", "To be filled by me — pure automotive history.", "To be filled by me"),
            new TravelDestination("trip-3", 3, "USA", "New York / Atlanta", "rap", "Rap / Music Dream", "To be filled by me — standing where the music came from.", "To be filled by me"),
            new TravelDestination("trip-4", 4, "UAE", "Dubai", "cars", "Car Dream", "To be filled by me — supercars & skyline nights.", "To be filled by me")
        );
        s.journalEntries = List.of(
            new JournalEntry("entry-02", "Entry 02 · Dec 2026", "Rebuilt ANIBEATS with Spatial 3D & Spring Boot API", "Interactive Three.js 3D vinyl sculpture, 3D Travel Globe, smart world color palette, and REST backend.", "I wanted opening ANIBEATS to feel effortless, vibrant, and crafted — where content is the star."),
            new JournalEntry("entry-01", "Entry 01 · Nov 2026", "WEB1 Assignment 2 — Where It Started", "The first hobby site about Anime and Rap Music for Internet and Web Programming 1.", "Once I submitted it, I realized I wasn’t building it for a grade anymore — I was building it for me.")
        );
        s.pollState = new PollState(List.of(0, 0, 0), null);
        s.storyPersonalNote = "This isn’t a portfolio, a CV, or a page trying to sound corporate. It’s simply my personal corner on the internet — a vision board of what moves me and where I want to go in life.";
        return s;
    }
}
