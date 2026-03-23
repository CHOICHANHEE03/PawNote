package com.pawnote.recipe.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RecipeCreateRequest {

    private String title;
    private String subtitle;
    private Integer servings;
    private String videoLink;

    private List<IngredientRequest> ingredients;
    private List<StepRequest> steps;

    @Getter
    @Setter
    public static class IngredientRequest {
        private String name;
        private String amount;
        private String unit;
        private String category;
    }

    @Getter
    @Setter
    public static class StepRequest {
        private Integer stepOrder;
        private String content;
    }
}