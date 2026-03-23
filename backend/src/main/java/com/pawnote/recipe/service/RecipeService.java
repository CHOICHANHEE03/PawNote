package com.pawnote.recipe.service;

import com.pawnote.common.file.FileStorageService;
import com.pawnote.recipe.dto.RecipeCreateRequest;
import com.pawnote.recipe.entity.*;
import com.pawnote.recipe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final FileStorageService fileStorageService;

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
}