package com.pawnote.shoppinglist.dto;

import java.time.LocalDateTime;

public record ShoppingListSummaryResponse(
        Long id,
        String title,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
