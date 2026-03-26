package com.pawnote.shoppinglist.service;

import com.pawnote.shoppinglist.dto.ShoppingListCreateResponse;
import com.pawnote.shoppinglist.entity.ShoppingList;
import com.pawnote.shoppinglist.repository.ShoppingListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ShoppingListService {

    private static final String DEFAULT_TITLE = "새 장보기 목록";

    private final ShoppingListRepository shoppingListRepository;

    @Transactional
    public ShoppingListCreateResponse create(Long userId, String title) {
        String normalizedTitle = title == null || title.isBlank() ? DEFAULT_TITLE : title.trim();

        ShoppingList shoppingList = ShoppingList.builder()
                .userId(userId)
                .title(normalizedTitle)
                .build();

        ShoppingList saved = shoppingListRepository.save(shoppingList);
        return new ShoppingListCreateResponse(
                saved.getId(),
                saved.getUserId(),
                saved.getTitle(),
                saved.getCreatedAt(),
                saved.getUpdatedAt()
        );
    }
}
