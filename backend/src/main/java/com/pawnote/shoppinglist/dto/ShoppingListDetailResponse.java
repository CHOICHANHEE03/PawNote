package com.pawnote.shoppinglist.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ShoppingListDetailResponse(
        Long id,
        Long userId,
        String title,
        List<ShoppingListItemResponse> items,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
