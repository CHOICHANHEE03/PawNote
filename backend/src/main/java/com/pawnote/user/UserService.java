package com.pawnote.user;

import com.pawnote.calendar.entity.CalendarEntry;
import com.pawnote.calendar.entity.CalendarEntryImage;
import com.pawnote.calendar.repository.CalendarEntryRepository;
import com.pawnote.common.file.FileStorageService;
import com.pawnote.recipe.entity.Recipe;
import com.pawnote.recipe.repository.RecipeRepository;
import com.pawnote.shoppinglist.repository.ShoppingListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ShoppingListRepository shoppingListRepository;
    private final CalendarEntryRepository calendarEntryRepository;
    private final RecipeRepository recipeRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public void deleteCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        List<CalendarEntry> calendarEntries = calendarEntryRepository.findAllByUserId(userId);
        List<String> imagePaths = calendarEntries.stream()
                .flatMap(entry -> entry.getImages().stream())
                .map(CalendarEntryImage::getImagePath)
                .toList();
        List<String> recipeImagePaths = recipeRepository.findAllByUserId(userId).stream()
                .map(Recipe::getImageUrl)
                .toList();

        shoppingListRepository.deleteByUserId(userId);
        calendarEntryRepository.deleteByUserId(userId);
        recipeRepository.deleteByUserId(userId);
        userRepository.delete(user);

        imagePaths.forEach(fileStorageService::deleteFile);
        recipeImagePaths.forEach(fileStorageService::deleteFile);
    }
}
