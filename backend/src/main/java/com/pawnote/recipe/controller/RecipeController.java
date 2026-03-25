package com.pawnote.recipe.controller;

import com.pawnote.recipe.dto.RecipeCreateRequest;
import com.pawnote.recipe.dto.RecipeDetailResponse;
import com.pawnote.recipe.dto.RecipeListItemResponse;
import com.pawnote.recipe.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;
    private final ObjectMapper objectMapper;

    @GetMapping("/{id}")
    public RecipeDetailResponse getRecipe(@PathVariable Long id) {
        return recipeService.getRecipe(id);
    }

    @GetMapping
    public List<RecipeListItemResponse> getRecipes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return recipeService.getRecipes(page, size);
    }

    @GetMapping("/search")
    public List<RecipeListItemResponse> searchRecipes(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return recipeService.searchRecipes(keyword, page, size);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Long> createRecipe(
            @RequestPart("request") String requestJson,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws Exception {

        RecipeCreateRequest request =
                objectMapper.readValue(requestJson, RecipeCreateRequest.class);

        Long id = recipeService.createRecipe(request, image);

        return Map.of("id", id);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Long> updateRecipe(
            @PathVariable Long id,
            @RequestPart("request") String requestJson,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws Exception {

        RecipeCreateRequest request =
                objectMapper.readValue(requestJson, RecipeCreateRequest.class);

        Long updatedId = recipeService.updateRecipe(id, request, image);

        return Map.of("id", updatedId);
    }

    @DeleteMapping("/{id}")
    public void deleteRecipe(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
    }
}
