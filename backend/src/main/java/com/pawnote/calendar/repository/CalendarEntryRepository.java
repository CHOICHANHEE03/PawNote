package com.pawnote.calendar.repository;

import com.pawnote.calendar.entity.CalendarEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalendarEntryRepository extends JpaRepository<CalendarEntry, Long> {
}
