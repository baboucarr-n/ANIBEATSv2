package com.anibeats.model;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class AnimeUniverseModels {

    public static class CompletedAnimeItem {
        public String id;
        public int rank;
        @NotBlank public String title;
        public String posterUrl;
        public List<String> genres = new ArrayList<>();
        public String demographic;
        public String frontNote;
        public String lifeLesson;

        public CompletedAnimeItem() {}

        public CompletedAnimeItem(
            String id,
            int rank,
            String title,
            String posterUrl,
            List<String> genres,
            String demographic,
            String frontNote,
            String lifeLesson
        ) {
            this.id = id;
            this.rank = rank;
            this.title = title;
            this.posterUrl = posterUrl;
            this.genres = new ArrayList<>(genres);
            this.demographic = demographic;
            this.frontNote = frontNote;
            this.lifeLesson = lifeLesson;
        }
    }

    public static class CurrentlyWatchingItem {
        public String id;
        @NotBlank public String title;
        public String posterUrl;
        public List<String> genres = new ArrayList<>();
        public String demographic;
        public String note;
        public String statusLabel;
        public int currentEp;
        public int totalEp;

        public CurrentlyWatchingItem() {}

        public CurrentlyWatchingItem(
            String id,
            String title,
            String posterUrl,
            List<String> genres,
            String demographic,
            String note,
            String statusLabel,
            int currentEp,
            int totalEp
        ) {
            this.id = id;
            this.title = title;
            this.posterUrl = posterUrl;
            this.genres = new ArrayList<>(genres);
            this.demographic = demographic;
            this.note = note;
            this.statusLabel = statusLabel;
            this.currentEp = currentEp;
            this.totalEp = totalEp;
        }
    }

    public static class DiscoveryAnimeItem {
        public String id;
        @NotBlank public String title;
        public String posterUrl;
        public String category;
        public List<String> genres = new ArrayList<>();
        public String demographic;
        public String synopsis;
        public String whyOnList;
        public String watchlistStatus;

        public DiscoveryAnimeItem() {}

        public DiscoveryAnimeItem(
            String id,
            String title,
            String posterUrl,
            String category,
            List<String> genres,
            String demographic,
            String synopsis,
            String whyOnList,
            String watchlistStatus
        ) {
            this.id = id;
            this.title = title;
            this.posterUrl = posterUrl;
            this.category = category;
            this.genres = new ArrayList<>(genres);
            this.demographic = demographic;
            this.synopsis = synopsis;
            this.whyOnList = whyOnList;
            this.watchlistStatus = watchlistStatus;
        }
    }

    public static class AnimeUniverseState {
        public List<CompletedAnimeItem> collection = new ArrayList<>();
        public List<CurrentlyWatchingItem> watching = new ArrayList<>();
        public List<DiscoveryAnimeItem> discovery = new ArrayList<>();
    }

    public record PromoteDiscoveryRequest(
        boolean confirmedWatched,
        Integer rank,
        String frontNote,
        String lifeLesson
    ) {}

    public record ReorderRequest(List<String> orderedIds) {}
}
