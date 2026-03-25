package com.pawnote.recipe.dto;

import java.util.List;

public record RecipeDetailResponse(
        Long id,
        String title,
        String subtitle,
        String imageUrl,
        String videoLink,
        Integer servings,
        List<IngredientItem> ingredients,
        List<StepItem> steps
) {
    public record IngredientItem(
            String name,
            String amount,
            String unit,
            String category
    ) {
    }

    public record StepItem(
            Integer stepOrder,
            String content
    ) {
    }
}
