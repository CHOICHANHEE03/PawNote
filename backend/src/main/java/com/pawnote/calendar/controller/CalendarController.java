package com.pawnote.calendar.controller;

import com.pawnote.auth.jwt.JwtAuthenticationFilter;
import com.pawnote.calendar.dto.CalendarCreateRequest;
import com.pawnote.calendar.dto.CalendarEntryResponse;
import com.pawnote.calendar.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public List<CalendarEntryResponse> getCalendarEntries(
            @AuthenticationPrincipal JwtAuthenticationFilter.JwtUserPrincipal principal
    ) {
        Long userId = extractUserId(principal);
        return calendarService.getAll(userId);
    }

    @GetMapping("/date/{date}")
    public List<CalendarEntryResponse> getCalendarEntriesByDate(
            @AuthenticationPrincipal JwtAuthenticationFilter.JwtUserPrincipal principal,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        Long userId = extractUserId(principal);
        return calendarService.getByDate(userId, date);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Long> createCalendarEntry(
            @AuthenticationPrincipal JwtAuthenticationFilter.JwtUserPrincipal principal,
            @RequestPart("request") String requestJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) throws Exception {
        Long userId = extractUserId(principal);
        CalendarCreateRequest request = objectMapper.readValue(requestJson, CalendarCreateRequest.class);
        Long id = calendarService.create(userId, request, images);
        return Map.of("id", id);
    }

    private Long extractUserId(JwtAuthenticationFilter.JwtUserPrincipal principal) {
        if (principal == null || principal.userId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication information is missing.");
        }
        return principal.userId();
    }
}
