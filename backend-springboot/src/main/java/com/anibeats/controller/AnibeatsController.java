package com.anibeats.controller;

import com.anibeats.model.AnibeatsModels.*;
import com.anibeats.service.AnibeatsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/anibeats")
@CrossOrigin(origins = "*")
public class AnibeatsController {

    private final AnibeatsService service;

    public AnibeatsController(AnibeatsService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "engine", "spring-boot");
    }

    @GetMapping("/state")
    public AnibeatsState getState() {
        return service.getState();
    }

    @PutMapping("/state")
    public AnibeatsState replaceState(@RequestBody AnibeatsState next) throws IOException {
        return service.replaceState(next);
    }

    @PutMapping("/song")
    public AnibeatsState updateSong(@RequestBody SongOfTheWeek song) throws IOException {
        return service.updateSongOfTheWeek(song);
    }

    @PutMapping("/playlists")
    public AnibeatsState updatePlaylists(@Valid @RequestBody List<PlaylistEntry> playlists) throws IOException {
        return service.updatePlaylists(playlists);
    }

    @PutMapping("/anime")
    public AnibeatsState updateAnime(@Valid @RequestBody List<AnimeEntry> animeWall) throws IOException {
        return service.updateAnimeWall(animeWall);
    }

    @PutMapping("/watching")
    public AnibeatsState updateWatching(@RequestBody CurrentlyWatching watching) throws IOException {
        return service.updateCurrentlyWatching(watching);
    }

    @PutMapping("/cars")
    public AnibeatsState updateCars(@Valid @RequestBody List<CarEntry> cars) throws IOException {
        return service.updateCars(cars);
    }

    @PutMapping("/travel")
    public AnibeatsState updateTravel(@RequestBody TravelUpdateRequest req) throws IOException {
        return service.updateTravel(req.travelTrips(), req.visitedTravelIds());
    }

    @PostMapping("/poll/vote")
    public AnibeatsState votePoll(@RequestBody Map<String, Integer> payload) throws IOException {
        int optionIndex = payload.getOrDefault("optionIndex", 0);
        return service.votePoll(optionIndex);
    }

    @PostMapping("/community-playlists")
    public AnibeatsState addCommunityPlaylist(@Valid @RequestBody CommunityPlaylistPick pick) throws IOException {
        return service.addCommunityPlaylist(pick);
    }

    @PostMapping("/suggestions")
    public AnibeatsState addSuggestion(@Valid @RequestBody FanSuggestion suggestion) throws IOException {
        return service.addSuggestion(suggestion);
    }

    @PutMapping("/story-journal")
    public AnibeatsState updateStoryJournal(@RequestBody StoryJournalRequest req) throws IOException {
        return service.updateStoryAndJournal(req.storyPersonalNote(), req.journalEntries());
    }

    @PostMapping("/reset")
    public AnibeatsState resetDefaults() throws IOException {
        return service.resetDefaults();
    }

    public record TravelUpdateRequest(List<TravelDestination> travelTrips, List<String> visitedTravelIds) {}
    public record StoryJournalRequest(String storyPersonalNote, List<JournalEntry> journalEntries) {}
}
