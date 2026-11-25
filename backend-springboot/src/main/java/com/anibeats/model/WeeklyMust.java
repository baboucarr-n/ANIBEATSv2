package com.anibeats.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "weekly_must")
public class WeeklyMust {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 240)
    private String title;

    @Column(nullable = false, length = 160)
    private String creator;

    @Column(nullable = false, length = 500)
    private String youtubeUrl;

    @Column(nullable = false, length = 32)
    private String youtubeVideoId;

    @Column(columnDefinition = "TEXT")
    private String whyThisWeek;

    @Column(nullable = false, length = 32)
    private String tag; // ANIME / RAP / CAR / TRAVEL

    @Column(length = 32)
    private String moodTag; // Hype / Chill / Late Night / Sad / Workout (optional)

    @Column(nullable = false, length = 80)
    private String weekLabel; // e.g. "Week 48 — 2026"

    @Column(nullable = false)
    private boolean isCurrent;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public WeeklyMust() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getYoutubeUrl() {
        return youtubeUrl;
    }

    public void setYoutubeUrl(String youtubeUrl) {
        this.youtubeUrl = youtubeUrl;
    }

    public String getYoutubeVideoId() {
        return youtubeVideoId;
    }

    public void setYoutubeVideoId(String youtubeVideoId) {
        this.youtubeVideoId = youtubeVideoId;
    }

    public String getWhyThisWeek() {
        return whyThisWeek;
    }

    public void setWhyThisWeek(String whyThisWeek) {
        this.whyThisWeek = whyThisWeek;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public String getMoodTag() {
        return moodTag;
    }

    public void setMoodTag(String moodTag) {
        this.moodTag = moodTag;
    }

    public String getWeekLabel() {
        return weekLabel;
    }

    public void setWeekLabel(String weekLabel) {
        this.weekLabel = weekLabel;
    }

    public boolean isCurrent() {
        return isCurrent;
    }

    public void setCurrent(boolean current) {
        isCurrent = current;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
