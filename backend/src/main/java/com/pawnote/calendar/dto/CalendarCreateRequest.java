package com.pawnote.calendar.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class CalendarCreateRequest {
    private LocalDate date;
    private String companion;
    private List<Long> recipeIds;
    private List<String> existingImageUrls;
    private String memoTitle;
    private String memoContent;
}
