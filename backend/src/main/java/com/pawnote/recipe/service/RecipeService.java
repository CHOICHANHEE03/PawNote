package com.pawnote.recipe.service;

import com.pawnote.common.file.FileStorageService;
import com.pawnote.recipe.dto.RecipeCreateRequest;
import com.pawnote.recipe.dto.RecipeListItemResponse;
import com.pawnote.recipe.entity.*;
import com.pawnote.recipe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final FileStorageService fileStorageService;

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
            throw new IllegalArgumentException("이미지와 영상 중 하나만 등록 가능");
        }

        if (!hasImage && !hasVideo) {
            throw new IllegalArgumentException("이미지 또는 영상 하나는 필요");
        }

        String imageUrl = fileStorageService.saveFile(image);

        Recipe recipe = Recipe.builder()
                .title(request.getTitle())
                .subtitle(request.getSubtitle())
                .servings(request.getServings())
                .videoLink(request.getVideoLink())
                .imageUrl(imageUrl)
                .build();

        // 재료 저장
        request.getIngredients().forEach(item -> {
            RecipeIngredient ingredient = RecipeIngredient.builder()
                    .name(item.getName())
                    .amount(item.getAmount())
                    .unit(item.getUnit())
                    .category(item.getCategory())
                    .build();
            recipe.addIngredient(ingredient);
        });

        // 스텝 저장
        request.getSteps().forEach(item -> {
            RecipeStep step = RecipeStep.builder()
                    .stepOrder(item.getStepOrder())
                    .content(item.getContent())
                    .build();
            recipe.addStep(step);
        });

        return recipeRepository.save(recipe).getId();
    }

    private RecipeListItemResponse toListItemResponse(Recipe recipe) {
        return new RecipeListItemResponse(
                recipe.getId(),
                recipe.getTitle(),
                recipe.getSubtitle(),
                recipe.getImageUrl(),
                recipe.getVideoLink(),
                recipe.getServings()
        );
    }
}
