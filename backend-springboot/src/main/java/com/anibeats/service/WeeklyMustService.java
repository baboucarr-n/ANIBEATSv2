package com.anibeats.service;

import com.anibeats.model.WeeklyMust;
import com.anibeats.repository.WeeklyMustRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class WeeklyMustService {

    private static final Set<String> VALID_TAGS = Set.of("ANIME", "RAP", "CAR", "TRAVEL");
    private static final Pattern VIDEO_ID_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]{11}$");

    private final WeeklyMustRepository repository;

    public WeeklyMustService(WeeklyMustRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    @Transactional
    public void seedIfEmpty() {
        if (repository.count() == 0) {
            WeeklyMust placeholder = new WeeklyMust();
            placeholder.setTitle("To be filled — Weekly MUST coming soon");
            placeholder.setCreator("To be filled by me");
            placeholder.setYoutubeUrl("");
            placeholder.setYoutubeVideoId("");
            placeholder.setWhyThisWeek("To be filled by me — my own words on why this is the one video you have to watch this week.");
            placeholder.setTag("ANIME");
            placeholder.setMoodTag("");
            placeholder.setWeekLabel("Week 48 — 2026");
            placeholder.setCurrent(true);
            placeholder.setCreatedAt(LocalDateTime.now());
            repository.save(placeholder);
        }
    }

    public Optional<WeeklyMust> getCurrent() {
        return repository.findByIsCurrentTrue();
    }

    public List<WeeklyMust> getArchive() {
        return repository.findAllByIsCurrentFalseOrderByCreatedAtDesc();
    }

    public List<WeeklyMust> getAll() {
        return repository.findAll().stream()
            .sorted((a, b) -> {
                if (a.isCurrent() != b.isCurrent()) return a.isCurrent() ? -1 : 1;
                return b.getCreatedAt().compareTo(a.getCreatedAt());
            })
            .toList();
    }

    public WeeklyMust getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Weekly MUST not found"));
    }

    @Transactional
    public WeeklyMust create(WeeklyMustInput input) {
        String videoId = extractAndValidateYoutubeVideoId(input.youtubeUrl());
        String tag = normalizeTag(input.tag());
        String moodTag = normalizeMood(input.moodTag());

        if (input.isCurrent()) {
            clearAllCurrent();
        }

        WeeklyMust entity = new WeeklyMust();
        entity.setTitle(requireText(input.title(), "Title is required"));
        entity.setCreator(requireText(input.creator(), "Creator is required"));
        entity.setYoutubeUrl(input.youtubeUrl().trim());
        entity.setYoutubeVideoId(videoId);
        entity.setWhyThisWeek(safeText(input.whyThisWeek()));
        entity.setTag(tag);
        entity.setMoodTag(moodTag);
        entity.setWeekLabel(requireText(input.weekLabel(), "Week label is required"));
        entity.setCurrent(input.isCurrent());
        entity.setCreatedAt(LocalDateTime.now());

        return repository.save(entity);
    }

    @Transactional
    public WeeklyMust update(Long id, WeeklyMustInput input) {
        WeeklyMust existing = getById(id);
        String urlTrimmed = input.youtubeUrl() == null ? "" : input.youtubeUrl().trim();
        String videoId = urlTrimmed.isEmpty() ? "" : extractAndValidateYoutubeVideoId(urlTrimmed);

        if (input.isCurrent()) {
            clearAllCurrentExcept(id);
        }

        existing.setTitle(requireText(input.title(), "Title is required"));
        existing.setCreator(requireText(input.creator(), "Creator is required"));
        existing.setYoutubeUrl(urlTrimmed);
        existing.setYoutubeVideoId(videoId);
        existing.setWhyThisWeek(safeText(input.whyThisWeek()));
        existing.setTag(normalizeTag(input.tag()));
        existing.setMoodTag(normalizeMood(input.moodTag()));
        existing.setWeekLabel(requireText(input.weekLabel(), "Week label is required"));
        existing.setCurrent(input.isCurrent());

        return repository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        WeeklyMust existing = getById(id);
        repository.delete(existing);
    }

    @Transactional
    public WeeklyMust setCurrent(Long id) {
        WeeklyMust target = getById(id);
        clearAllCurrentExcept(id);
        target.setCurrent(true);
        return repository.save(target);
    }

    private void clearAllCurrent() {
        List<WeeklyMust> all = repository.findAll();
        for (WeeklyMust item : all) {
            if (item.isCurrent()) {
                item.setCurrent(false);
            }
        }
        repository.saveAll(all);
    }

    private void clearAllCurrentExcept(Long keepId) {
        List<WeeklyMust> all = repository.findAll();
        for (WeeklyMust item : all) {
            if (!item.getId().equals(keepId) && item.isCurrent()) {
                item.setCurrent(false);
            }
        }
        repository.saveAll(all);
    }

    public static String extractAndValidateYoutubeVideoId(String rawUrl) {
        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "YouTube URL is required");
        }
        URI uri;
        try {
            uri = URI.create(rawUrl.trim());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid YouTube URL");
        }

        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase();
        if (!scheme.equals("https") && !scheme.equals("http")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "YouTube URL must use http or https");
        }

        String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
        String videoId = null;

        if (host.equals("youtu.be")) {
            String path = uri.getPath() == null ? "" : uri.getPath().replaceAll("^/+", "");
            videoId = path.split("/")[0];
        } else if (host.equals("youtube.com") || host.equals("www.youtube.com") || host.equals("m.youtube.com")) {
            String path = uri.getPath() == null ? "" : uri.getPath();
            if (path.equals("/watch")) {
                String query = uri.getRawQuery();
                if (query != null) {
                    for (String pair : query.split("&")) {
                        int idx = pair.indexOf('=');
                        if (idx > 0 && pair.substring(0, idx).equals("v")) {
                            videoId = pair.substring(idx + 1);
                            break;
                        }
                    }
                }
            } else if (path.startsWith("/embed/") || path.startsWith("/shorts/")) {
                String[] parts = path.split("/");
                if (parts.length >= 3) {
                    videoId = parts[2];
                }
            }
        }

        if (videoId == null || !VIDEO_ID_PATTERN.matcher(videoId).matches()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Please provide a valid youtube.com/watch?v= or youtu.be/ link"
            );
        }
        return videoId;
    }

    private String normalizeTag(String raw) {
        String upper = raw == null ? "" : raw.trim().toUpperCase();
        if (!VALID_TAGS.contains(upper)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tag must be ANIME, RAP, CAR, or TRAVEL");
        }
        return upper;
    }

    private static final java.util.Map<String, String> VALID_MOOD_MAP = java.util.Map.of(
        "", "",
        "hype", "Hype",
        "chill", "Chill",
        "late night", "Late Night",
        "late_night", "Late Night",
        "sad", "Sad",
        "workout", "Workout"
    );

    private String normalizeMood(String raw) {
        String key = raw == null ? "" : raw.trim().toLowerCase();
        return VALID_MOOD_MAP.getOrDefault(key, "");
    }

    private String requireText(String val, String message) {
        if (val == null || val.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return val.trim();
    }

    private String safeText(String val) {
        return val == null ? "" : val.trim();
    }

    public record WeeklyMustInput(
        String title,
        String creator,
        String youtubeUrl,
        String whyThisWeek,
        String tag,
        String moodTag,
        String weekLabel,
        boolean isCurrent
    ) {}
}
