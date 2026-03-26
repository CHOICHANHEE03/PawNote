package com.pawnote.shoppinglist.dto;

import java.time.LocalDateTime;

public record ShoppingListCreateResponse(
        Long id,
        Long userId,
        String title,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
