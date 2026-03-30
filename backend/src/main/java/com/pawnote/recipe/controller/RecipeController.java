package com.pawnote.recipe.controller;

import com.pawnote.auth.jwt.JwtAuthenticationFilter;
import com.pawnote.recipe.dto.RecipeCreateRequest;
import com.pawnote.recipe.dto.RecipeDetailResponse;
import com.pawnote.recipe.dto.RecipeListItemResponse;
import com.pawnote.recipe.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
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
    public RecipeDetailResponse getRecipe(
            @AuthenticationPrincipal JwtAuthenticationFilter.JwtUserPrincipal principal,
            @PathVariable Long id
    ) {
        Long userId = extractUserId(principal);
        return recipeService.getRecipe(userId, id);
    }

    @GetMapping
    public List<RecipeListItemResponse> getRecipes(
            @AuthenticationPrincipal JwtAuthenticationFilter.JwtUserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = extractUserId(principal);
        return recipeService.getRecipes(userId, page, size);
    }

    @GetMapping("/search")
    public List<RecipeListItemResponse> searchRecipes(
            @AuthenticationPrincipal JwtAuthenticationFilter.JwtUserPrincipal principal,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = extractUserId(principal);
        return recipeService.searchRecipes(userId, keyword, page, size);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Long> createRecipe(
            @AuthenticationPrincipal JwtAuthenticationFilter.JwtUserPrincipal principal,
            @RequestPart("request") String requestJson,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws Exception {
        Long userId = extractUserId(principal);
        RecipeCreateRequest request = objectMapper.readValue(requestJson, RecipeCreateRequest.class);
        Long id = recipeService.createRecipe(userId, request, image);
        return Map.of("id", id);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Long> updateRecipe(
            @AuthenticationPrincipal JwtAuthenticationFilter.JwtUserPrincipal principal,
            @PathVariable Long id,
            @RequestPart("request") String requestJson,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws Exception {
        Long userId = extractUserId(principal);
        RecipeCreateRequest request = objectMapper.readValue(requestJson, RecipeCreateRequest.class);
        Long updatedId = recipeService.updateRecipe(userId, id, request, image);
        return Map.of("id", updatedId);
    }

    @DeleteMapping("/{id}")
    public void deleteRecipe(
            @AuthenticationPrincipal JwtAuthenticationFilter.JwtUserPrincipal principal,
            @PathVariable Long id
    ) {
        Long userId = extractUserId(principal);
        recipeService.deleteRecipe(userId, id);
    }

    private Long extractUserId(JwtAuthenticationFilter.JwtUserPrincipal principal) {
        if (principal == null || principal.userId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication information is missing.");
        }
        return principal.userId();
    }
}
