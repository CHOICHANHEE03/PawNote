package com.pawnote.calendar.repository;

import com.pawnote.calendar.entity.CalendarEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CalendarEntryRepository extends JpaRepository<CalendarEntry, Long> {
    List<CalendarEntry> findAllByUserIdOrderByDateDescCreatedAtDesc(Long userId);

    List<CalendarEntry> findAllByUserIdAndDateOrderByCreatedAtDesc(Long userId, LocalDate date);

    List<CalendarEntry> findByUserIdAndDateBetweenOrderByDate(Long userId, LocalDate startDate, LocalDate endDate);
}
