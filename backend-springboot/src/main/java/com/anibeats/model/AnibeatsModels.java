package com.anibeats.model;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class AnibeatsModels {

    public record AnimeEntry(
        String id,
        int rank,
        @NotBlank String title,
        String posterUrl,
        List<String> genres,
        String genreLabel,
        String rating,
        String year,
        String why,
        List<String> moods
    ) {}

    public record CurrentlyWatching(
        String title,
        int currentEp,
        int totalEp,
        String note
    ) {}

    public record SongOfTheWeek(
        String title,
        String artist,
        String spotifyUrl,
        String why
    ) {}

    public record PlaylistEntry(
        String id,
        @NotBlank String title,
        String moodLabel,
        String description,
        @NotBlank String spotifyUrl,
        List<String> moods
    ) {}

    public record CarEntry(
        String id,
        int rank,
        @NotBlank String name,
        String category,
        String categoryLabel,
        String imageUrl,
        String why,
        List<String> moods
    ) {}

    public record TravelDestination(
        String id,
        int rank,
        @NotBlank String country,
        @NotBlank String city,
        String whyKey,
        String whyLabel,
        String whyText,
        String dreamActivity
    ) {}

    public record JournalEntry(
        String id,
        String dateLabel,
        @NotBlank String title,
        String added,
        String why
    ) {}

    public record PollState(
        List<Integer> votes,
        Integer userChoice
    ) {}

    public record CommunityPlaylistPick(
        String id,
        @NotBlank String name,
        @NotBlank String link,
        String why
    ) {}

    public record FanSuggestion(
        String id,
        @NotBlank String category,
        @NotBlank String title,
        String link,
        String why
    ) {}

    public static class AnibeatsState {
        public List<AnimeEntry> animeWall = new ArrayList<>();
        public CurrentlyWatching currentlyWatching;
        public SongOfTheWeek songOfTheWeek;
        public List<PlaylistEntry> playlists = new ArrayList<>();
        public List<CarEntry> cars = new ArrayList<>();
        public List<TravelDestination> travelTrips = new ArrayList<>();
        public List<String> visitedTravelIds = new ArrayList<>();
        public String storyPersonalNote;
        public List<JournalEntry> journalEntries = new ArrayList<>();
        public PollState pollState;
        public List<CommunityPlaylistPick> communityPlaylists = new ArrayList<>();
        public List<FanSuggestion> suggestions = new ArrayList<>();
    }
}
