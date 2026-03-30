package com.pawnote.recipe.dto;

public record RecipeListItemResponse(
        Long id,
        String title,
        String subtitle,
        String imageUrl,
        String videoLink,
        Integer servings
) {
}
