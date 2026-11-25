package com.anibeats.repository;

import com.anibeats.model.WeeklyMust;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WeeklyMustRepository extends JpaRepository<WeeklyMust, Long> {
    Optional<WeeklyMust> findByIsCurrentTrue();
    List<WeeklyMust> findAllByIsCurrentFalseOrderByCreatedAtDesc();
}
