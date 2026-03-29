package com.pawnote.recipe.service;

import com.pawnote.common.file.FileStorageService;
import com.pawnote.recipe.dto.RecipeCreateRequest;
import com.pawnote.recipe.dto.RecipeDetailResponse;
import com.pawnote.recipe.dto.RecipeListItemResponse;
import com.pawnote.recipe.entity.Recipe;
import com.pawnote.recipe.entity.RecipeIngredient;
import com.pawnote.recipe.entity.RecipeStep;
import com.pawnote.recipe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public RecipeDetailResponse getRecipe(Long userId, Long id) {
        Recipe recipe = recipeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found."));

        return new RecipeDetailResponse(
                recipe.getId(),
                recipe.getTitle(),
                recipe.getSubtitle(),
                resolveImageUrl(recipe.getImageUrl(), recipe.getVideoLink()),
                recipe.getVideoLink(),
                recipe.getServings(),
                recipe.getIngredients().stream()
                        .map(ingredient -> new RecipeDetailResponse.IngredientItem(
                                ingredient.getName(),
                                ingredient.getAmount(),
                                ingredient.getUnit(),
                                ingredient.getCategory()
                        ))
                        .toList(),
                recipe.getSteps().stream()
                        .map(step -> new RecipeDetailResponse.StepItem(
                                step.getStepOrder(),
                                step.getContent()
                        ))
                        .toList()
        );
    }

    @Transactional(readOnly = true)
    public List<RecipeListItemResponse> getRecipes(Long userId, int page, int size) {
        return recipeRepository.findAllByUserId(userId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id")))
                .stream()
                .map(this::toListItemResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RecipeListItemResponse> searchRecipes(Long userId, String keyword, int page, int size) {
        String trimmedKeyword = keyword == null ? "" : keyword.trim();

        if (trimmedKeyword.isEmpty()) {
            return getRecipes(userId, page, size);
        }

        return recipeRepository.findByUserIdAndTitleContainingIgnoreCaseOrUserIdAndSubtitleContainingIgnoreCase(
                        userId,
                        trimmedKeyword,
                        userId,
                        trimmedKeyword,
                        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"))
                )
                .stream()
                .map(this::toListItemResponse)
                .toList();
    }

    @Transactional
    public Long createRecipe(Long userId, RecipeCreateRequest request, MultipartFile image) throws Exception {
        boolean hasImage = image != null && !image.isEmpty();
        boolean hasVideo = request.getVideoLink() != null && !request.getVideoLink().isBlank();

        if (hasImage && hasVideo) {
            throw new IllegalArgumentException("Only one of image or video can be registered.");
        }

        if (!hasImage && !hasVideo) {
            throw new IllegalArgumentException("Either image or video is required.");
        }

        String imagePath = fileStorageService.saveFile(image);

        Recipe recipe = Recipe.builder()
                .userId(userId)
                .title(request.getTitle())
                .subtitle(request.getSubtitle())
                .servings(request.getServings())
                .videoLink(request.getVideoLink())
                .imageUrl(imagePath)
                .build();

        if (request.getIngredients() != null) {
            request.getIngredients().forEach(item -> {
                RecipeIngredient ingredient = RecipeIngredient.builder()
                        .name(item.getName())
                        .amount(item.getAmount())
                        .unit(item.getUnit())
                        .category(item.getCategory())
                        .build();
                recipe.addIngredient(ingredient);
            });
        }

        if (request.getSteps() != null) {
            request.getSteps().forEach(item -> {
                RecipeStep step = RecipeStep.builder()
                        .stepOrder(item.getStepOrder())
                        .content(item.getContent())
                        .build();
                recipe.addStep(step);
            });
        }

        return recipeRepository.save(recipe).getId();
    }

    @Transactional
    public Long updateRecipe(Long userId, Long id, RecipeCreateRequest request, MultipartFile image) throws Exception {
        Recipe recipe = recipeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found."));

        boolean hasImage = image != null && !image.isEmpty();
        boolean hasVideo = request.getVideoLink() != null && !request.getVideoLink().isBlank();

        if (hasImage && hasVideo) {
            throw new IllegalArgumentException("Only one of image or video can be registered.");
        }

        recipe.setTitle(request.getTitle());
        recipe.setSubtitle(request.getSubtitle());
        recipe.setServings(request.getServings());

        if (hasImage) {
            fileStorageService.deleteFile(recipe.getImageUrl());
            recipe.setImageUrl(fileStorageService.saveFile(image));
            recipe.setVideoLink(null);
        } else if (hasVideo) {
            fileStorageService.deleteFile(recipe.getImageUrl());
            recipe.setVideoLink(request.getVideoLink());
            recipe.setImageUrl(null);
        }

        recipe.getIngredients().clear();
        if (request.getIngredients() != null) {
            request.getIngredients().forEach(item -> {
                RecipeIngredient ingredient = RecipeIngredient.builder()
                        .name(item.getName())
                        .amount(item.getAmount())
                        .unit(item.getUnit())
                        .category(item.getCategory())
                        .build();
                recipe.addIngredient(ingredient);
            });
        }

        recipe.getSteps().clear();
        if (request.getSteps() != null) {
            request.getSteps().forEach(item -> {
                RecipeStep step = RecipeStep.builder()
                        .stepOrder(item.getStepOrder())
                        .content(item.getContent())
                        .build();
                recipe.addStep(step);
            });
        }

        return recipe.getId();
    }

    @Transactional
    public void deleteRecipe(Long userId, Long id) {
        Recipe recipe = recipeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found."));

        fileStorageService.deleteFile(recipe.getImageUrl());
        recipeRepository.delete(recipe);
    }

    private RecipeListItemResponse toListItemResponse(Recipe recipe) {
        return new RecipeListItemResponse(
                recipe.getId(),
                recipe.getTitle(),
                recipe.getSubtitle(),
                resolveImageUrl(recipe.getImageUrl(), recipe.getVideoLink()),
                recipe.getVideoLink(),
                recipe.getServings()
        );
    }

    private String resolveImageUrl(String imagePath, String videoLink) {
        if (imagePath != null && !imagePath.isBlank()) {
            return fileStorageService.toPublicUrl(imagePath);
        }
        return extractYoutubeThumbnailUrl(videoLink);
    }

    private String extractYoutubeThumbnailUrl(String videoLink) {
        return extractYoutubeVideoId(videoLink)
                .map(videoId -> "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg")
                .orElse(null);
    }

    private Optional<String> extractYoutubeVideoId(String videoLink) {
        if (videoLink == null || videoLink.isBlank()) {
            return Optional.empty();
        }

        try {
            URI uri = URI.create(videoLink.trim());
            String host = Optional.ofNullable(uri.getHost()).orElse("").toLowerCase();
            String path = Optional.ofNullable(uri.getPath()).orElse("");

            if (host.contains("youtu.be")) {
                String videoId = path.startsWith("/") ? path.substring(1) : path;
                return Optional.of(videoId).filter(id -> !id.isBlank());
            }

            if (!host.contains("youtube.com")) {
                return Optional.empty();
            }

            Map<String, String> queryParams = parseQueryParams(uri.getQuery());
            if (queryParams.containsKey("v")) {
                String videoId = queryParams.get("v");
                return Optional.ofNullable(videoId).filter(id -> !id.isBlank());
            }

            if (path.startsWith("/shorts/")) {
                String videoId = path.substring("/shorts/".length());
                return Optional.of(videoId).filter(id -> !id.isBlank());
            }

            if (path.startsWith("/embed/")) {
                String videoId = path.substring("/embed/".length());
                return Optional.of(videoId).filter(id -> !id.isBlank());
            }
        } catch (IllegalArgumentException ignored) {
            return Optional.empty();
        }

        return Optional.empty();
    }

    private Map<String, String> parseQueryParams(String query) {
        if (query == null || query.isBlank()) {
            return Map.of();
        }

        return Arrays.stream(query.split("&"))
                .map(param -> param.split("=", 2))
                .filter(parts -> parts.length == 2)
                .collect(Collectors.toMap(parts -> parts[0], parts -> parts[1], (first, second) -> first));
    }
}
