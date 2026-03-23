package com.pawnote.recipe.controller;

import tools.jackson.databind.ObjectMapper;
import com.pawnote.recipe.dto.RecipeCreateRequest;
import com.pawnote.recipe.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;
    private final ObjectMapper objectMapper;

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
}