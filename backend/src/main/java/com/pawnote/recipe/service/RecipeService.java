package com.pawnote.recipe.service;

import com.pawnote.common.file.FileStorageService;
import com.pawnote.recipe.dto.RecipeCreateRequest;
import com.pawnote.recipe.dto.RecipeDetailResponse;
import com.pawnote.recipe.dto.RecipeListItemResponse;
import com.pawnote.recipe.entity.*;
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
    public RecipeDetailResponse getRecipe(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "레시피를 찾을 수 없습니다."));

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
    public List<RecipeListItemResponse> getRecipes(int page, int size) {
        return recipeRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id")))
                .stream()
                .map(this::toListItemResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RecipeListItemResponse> searchRecipes(String keyword, int page, int size) {
        String trimmedKeyword = keyword == null ? "" : keyword.trim();

        if (trimmedKeyword.isEmpty()) {
            return getRecipes(page, size);
        }

        return recipeRepository.findByTitleContainingIgnoreCaseOrSubtitleContainingIgnoreCase(
                        trimmedKeyword,
                        trimmedKeyword,
                        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"))
                )
                .stream()
                .map(this::toListItemResponse)
                .toList();
    }

    @Transactional
    public Long createRecipe(RecipeCreateRequest request, MultipartFile image) throws Exception {

        boolean hasImage = image != null && !image.isEmpty();
        boolean hasVideo = request.getVideoLink() != null && !request.getVideoLink().isBlank();

        if (hasImage && hasVideo) {
            throw new IllegalArgumentException("이미지와 영상 중 하나만 등록할 수 있습니다.");
        }

        if (!hasImage && !hasVideo) {
            throw new IllegalArgumentException("이미지 또는 영상 중 하나는 필수입니다.");
        }

        String imageUrl = fileStorageService.saveFile(image);

        Recipe recipe = Recipe.builder()
                .title(request.getTitle())
                .subtitle(request.getSubtitle())
                .servings(request.getServings())
                .videoLink(request.getVideoLink())
                .imageUrl(imageUrl)
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
    public Long updateRecipe(Long id, RecipeCreateRequest request, MultipartFile image) throws Exception {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "레시피를 찾을 수 없습니다."));

        boolean hasImage = image != null && !image.isEmpty();
        boolean hasVideo = request.getVideoLink() != null && !request.getVideoLink().isBlank();

        if (hasImage && hasVideo) {
            throw new IllegalArgumentException("이미지와 영상 중 하나만 등록할 수 있습니다.");
        }

        recipe.setTitle(request.getTitle());
        recipe.setSubtitle(request.getSubtitle());
        recipe.setServings(request.getServings());

        if (hasImage) {
            recipe.setImageUrl(fileStorageService.saveFile(image));
            recipe.setVideoLink(null);
        } else if (hasVideo) {
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

    private String resolveImageUrl(String imageUrl, String videoLink) {
        if (imageUrl != null && !imageUrl.isBlank()) {
            return imageUrl;
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