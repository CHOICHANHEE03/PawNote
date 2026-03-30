package com.pawnote.calendar.service;

import com.pawnote.calendar.dto.CalendarCreateRequest;
import com.pawnote.calendar.dto.CalendarEntryResponse;
import com.pawnote.calendar.entity.CalendarEntry;
import com.pawnote.calendar.entity.CalendarEntryImage;
import com.pawnote.calendar.entity.CalendarEntryRecipe;
import com.pawnote.calendar.repository.CalendarEntryRepository;
import com.pawnote.common.file.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarEntryRepository calendarEntryRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<CalendarEntryResponse> getByMonth(Long userId, int year, int month) {
        LocalDate startDate;
        try {
            startDate = LocalDate.of(year, month, 1);
        } catch (DateTimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 연/월입니다.");
        }

        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        return calendarEntryRepository.findByUserIdAndDateBetweenOrderByDate(userId, startDate, endDate).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CalendarEntryResponse> getByDate(Long userId, LocalDate date) {
        return calendarEntryRepository.findAllByUserIdAndDateOrderByCreatedAtDesc(userId, date).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public Long create(Long userId, CalendarCreateRequest request, List<MultipartFile> images) throws IOException {
        if (request == null || request.getDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "날짜는 필수입니다.");
        }

        List<Long> recipeIds = request.getRecipeIds() == null ? Collections.emptyList() : request.getRecipeIds();
        List<MultipartFile> imageFiles = images == null ? Collections.emptyList() : images;

        CalendarEntry entry = CalendarEntry.builder()
                .userId(userId)
                .date(request.getDate())
                .companion(resolveCompanion(request))
                .memoTitle(trimToNull(request.getMemoTitle()))
                .memoContent(trimToNull(request.getMemoContent()))
                .build();

        for (int i = 0; i < recipeIds.size(); i++) {
            Long recipeId = recipeIds.get(i);
            if (recipeId == null) {
                continue;
            }
            entry.addRecipe(CalendarEntryRecipe.builder()
                    .recipeId(recipeId)
                    .recipeOrder(i)
                    .build());
        }

        List<String> uploadedPaths = new ArrayList<>();
        try {
            for (int i = 0; i < imageFiles.size(); i++) {
                MultipartFile image = imageFiles.get(i);
                if (image == null || image.isEmpty()) {
                    continue;
                }

                String imagePath = fileStorageService.saveFile(image, "calendar");
                uploadedPaths.add(imagePath);

                entry.addImage(CalendarEntryImage.builder()
                        .imagePath(imagePath)
                        .imageOrder(i)
                        .build());
            }
        } catch (IOException e) {
            uploadedPaths.forEach(fileStorageService::deleteFile);
            throw e;
        }

        return calendarEntryRepository.save(entry).getId();
    }

    @Transactional
    public Long update(Long userId, Long id, CalendarCreateRequest request, List<MultipartFile> images) throws IOException {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "요청 값이 없습니다.");
        }

        CalendarEntry entry = calendarEntryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "캘린더 기록을 찾을 수 없습니다."));

        List<Long> recipeIds = request.getRecipeIds() == null ? Collections.emptyList() : request.getRecipeIds();
        List<MultipartFile> imageFiles = images == null ? Collections.emptyList() : images;
        List<String> existingPaths = entry.getImages().stream().map(CalendarEntryImage::getImagePath).toList();
        List<String> keptPaths = request.getExistingImageUrls() == null
                ? Collections.emptyList()
                : request.getExistingImageUrls().stream()
                .map(fileStorageService::normalizeObjectPath)
                .map(this::trimToNull)
                .filter(path -> path != null && existingPaths.contains(path))
                .toList();

        entry.setDate(request.getDate() != null ? request.getDate() : entry.getDate());
        entry.setCompanion(resolveCompanion(request));
        entry.setMemoTitle(trimToNull(request.getMemoTitle()));
        entry.setMemoContent(trimToNull(request.getMemoContent()));

        entry.getRecipes().clear();
        for (int i = 0; i < recipeIds.size(); i++) {
            Long recipeId = recipeIds.get(i);
            if (recipeId == null) {
                continue;
            }
            entry.addRecipe(CalendarEntryRecipe.builder()
                    .recipeId(recipeId)
                    .recipeOrder(i)
                    .build());
        }

        entry.getImages().clear();
        int imageOrder = 0;
        for (String keptPath : keptPaths) {
            entry.addImage(CalendarEntryImage.builder()
                    .imagePath(keptPath)
                    .imageOrder(imageOrder++)
                    .build());
        }

        List<String> uploadedPaths = new ArrayList<>();
        try {
            for (MultipartFile image : imageFiles) {
                if (image == null || image.isEmpty()) {
                    continue;
                }

                String imagePath = fileStorageService.saveFile(image, "calendar");
                uploadedPaths.add(imagePath);

                entry.addImage(CalendarEntryImage.builder()
                        .imagePath(imagePath)
                        .imageOrder(imageOrder++)
                        .build());
            }
        } catch (IOException e) {
            uploadedPaths.forEach(fileStorageService::deleteFile);
            throw e;
        }

        Long savedId = calendarEntryRepository.save(entry).getId();
        List<String> retainedPathList = new ArrayList<>(keptPaths);
        retainedPathList.addAll(uploadedPaths);
        Set<String> retainedPaths = new HashSet<>(retainedPathList);

        existingPaths.stream()
                .filter(path -> !retainedPaths.contains(path))
                .forEach(fileStorageService::deleteFile);
        return savedId;
    }

    @Transactional
    public void delete(Long userId, Long id) {
        CalendarEntry entry = calendarEntryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "캘린더 기록을 찾을 수 없습니다."));

        List<String> imagePaths = entry.getImages().stream().map(CalendarEntryImage::getImagePath).toList();
        calendarEntryRepository.delete(entry);
        imagePaths.forEach(fileStorageService::deleteFile);
    }

    private CalendarEntryResponse toResponse(CalendarEntry entry) {
        return new CalendarEntryResponse(
                entry.getId(),
                entry.getDate(),
                entry.getCompanion(),
                entry.getRecipes().stream().map(CalendarEntryRecipe::getRecipeId).toList(),
                entry.getMemoTitle(),
                entry.getMemoContent(),
                entry.getImages().stream()
                        .map(CalendarEntryImage::getImagePath)
                        .map(fileStorageService::toPublicUrl)
                        .toList(),
                entry.getCreatedAt(),
                entry.getUpdatedAt()
        );
    }

    private String resolveCompanion(CalendarCreateRequest request) {
        return trimToNull(request.getCompanion());
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
