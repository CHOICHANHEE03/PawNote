package com.pawnote.calendar.repository;

import com.pawnote.calendar.entity.CalendarEntry;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CalendarEntryRepository extends JpaRepository<CalendarEntry, Long> {
    @EntityGraph(attributePaths = "images")
    List<CalendarEntry> findAllByUserId(Long userId);

    void deleteByUserId(Long userId);

    List<CalendarEntry> findAllByUserIdAndDateOrderByCreatedAtDesc(Long userId, LocalDate date);

    List<CalendarEntry> findByUserIdAndDateBetweenOrderByDate(Long userId, LocalDate startDate, LocalDate endDate);

    Optional<CalendarEntry> findByIdAndUserId(Long id, Long userId);
}
