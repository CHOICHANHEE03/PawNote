package com.pawnote.calendar.service;

import com.pawnote.calendar.dto.CalendarCreateRequest;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarEntryRepository calendarEntryRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public Long create(Long userId, CalendarCreateRequest request, List<MultipartFile> images) throws IOException {
        if (request == null || request.getDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date is required.");
        }

        List<Long> recipeIds = request.getRecipeIds() == null ? Collections.emptyList() : request.getRecipeIds();
        List<MultipartFile> imageFiles = images == null ? Collections.emptyList() : images;

        CalendarEntry entry = CalendarEntry.builder()
                .userId(userId)
                .date(request.getDate())
                .withWhom(trimToNull(request.getWithWhom()))
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

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
