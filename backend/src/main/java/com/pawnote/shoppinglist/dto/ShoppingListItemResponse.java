package com.pawnote.shoppinglist.dto;

public record ShoppingListItemResponse(
        Long id,
        String text,
        boolean checked,
        String type,
        Integer itemOrder
) {
}
