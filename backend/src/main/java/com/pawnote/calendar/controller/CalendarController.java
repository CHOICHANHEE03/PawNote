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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestParam;
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
            @AuthenticationPrincipal JwtAuthenticationFilter.JwtUserPrincipal principal,
            @RequestParam int year,
            @RequestParam int month
    ) {
        Long userId = extractUserId(principal);
        return calendarService.getByMonth(userId, year, month);
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

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Long> updateCalendarEntry(
            @AuthenticationPrincipal JwtAuthenticationFilter.JwtUserPrincipal principal,
            @PathVariable Long id,
            @RequestPart("request") String requestJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) throws Exception {
        Long userId = extractUserId(principal);
        CalendarCreateRequest request = objectMapper.readValue(requestJson, CalendarCreateRequest.class);
        Long updatedId = calendarService.update(userId, id, request, images);
        return Map.of("id", updatedId);
    }

    @DeleteMapping("/{id}")
    public void deleteCalendarEntry(
            @AuthenticationPrincipal JwtAuthenticationFilter.JwtUserPrincipal principal,
            @PathVariable Long id
    ) {
        Long userId = extractUserId(principal);
        calendarService.delete(userId, id);
    }

    private Long extractUserId(JwtAuthenticationFilter.JwtUserPrincipal principal) {
        if (principal == null || principal.userId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 정보가 없습니다.");
        }
        return principal.userId();
    }
}
