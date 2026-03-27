package com.pawnote.calendar.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record CalendarEntryResponse(
        Long id,
        LocalDate date,
        String companion,
        List<Long> recipeIds,
        String memoTitle,
        String memoContent,
        List<String> imageUrls,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
