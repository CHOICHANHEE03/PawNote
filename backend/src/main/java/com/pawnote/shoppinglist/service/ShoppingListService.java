package com.pawnote.shoppinglist.service;

import com.pawnote.shoppinglist.dto.ShoppingListCreateRequest;
import com.pawnote.shoppinglist.dto.ShoppingListCreateResponse;
import com.pawnote.shoppinglist.dto.ShoppingListDetailResponse;
import com.pawnote.shoppinglist.dto.ShoppingListItemRequest;
import com.pawnote.shoppinglist.dto.ShoppingListItemResponse;
import com.pawnote.shoppinglist.dto.ShoppingListSummaryResponse;
import com.pawnote.shoppinglist.dto.ShoppingListUpdateRequest;
import com.pawnote.shoppinglist.entity.ShoppingList;
import com.pawnote.shoppinglist.entity.ShoppingListItem;
import com.pawnote.shoppinglist.repository.ShoppingListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShoppingListService {

    private static final String DEFAULT_TITLE = "Shopping List";
    private static final String DEFAULT_ITEM_TYPE = "check";

    private final ShoppingListRepository shoppingListRepository;

    @Transactional
    public ShoppingListCreateResponse create(Long userId, ShoppingListCreateRequest request) {
        String title = request == null ? null : request.getTitle();
        String normalizedTitle = title == null || title.isBlank() ? DEFAULT_TITLE : title.trim();
        List<ShoppingListItemRequest> itemRequests =
                request == null || request.getItems() == null ? Collections.emptyList() : request.getItems();

        ShoppingList shoppingList = ShoppingList.builder()
                .userId(userId)
                .title(normalizedTitle)
                .build();

        for (int i = 0; i < itemRequests.size(); i++) {
            ShoppingListItemRequest itemRequest = itemRequests.get(i);
            if (itemRequest == null) {
                continue;
            }

            String text = itemRequest.getText() == null ? "" : itemRequest.getText().trim();
            if (text.isEmpty()) {
                continue;
            }

            String type = itemRequest.getType() == null || itemRequest.getType().isBlank()
                    ? DEFAULT_ITEM_TYPE
                    : itemRequest.getType().trim();

            shoppingList.addItem(ShoppingListItem.builder()
                    .text(text)
                    .checked(itemRequest.isChecked())
                    .type(type)
                    .itemOrder(i)
                    .build());
        }

        ShoppingList saved = shoppingListRepository.save(shoppingList);
        return new ShoppingListCreateResponse(
                saved.getId(),
                saved.getUserId(),
                saved.getTitle(),
                toItemResponses(saved),
                saved.getCreatedAt(),
                saved.getUpdatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<ShoppingListSummaryResponse> getAll(Long userId) {
        return shoppingListRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(list -> new ShoppingListSummaryResponse(
                        list.getId(),
                        list.getTitle(),
                        list.getCreatedAt(),
                        list.getUpdatedAt()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public ShoppingListDetailResponse getDetail(Long userId, Long shoppingListId) {
        ShoppingList shoppingList = shoppingListRepository.findByIdAndUserId(shoppingListId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shopping list not found."));

        return new ShoppingListDetailResponse(
                shoppingList.getId(),
                shoppingList.getUserId(),
                shoppingList.getTitle(),
                toItemResponses(shoppingList),
                shoppingList.getCreatedAt(),
                shoppingList.getUpdatedAt()
        );
    }

    @Transactional
    public ShoppingListDetailResponse update(Long userId, Long shoppingListId, ShoppingListUpdateRequest request) {
        ShoppingList shoppingList = shoppingListRepository.findByIdAndUserId(shoppingListId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shopping list not found."));

        String title = request == null ? null : request.getTitle();
        String normalizedTitle = title == null || title.isBlank() ? DEFAULT_TITLE : title.trim();
        shoppingList.setTitle(normalizedTitle);

        shoppingList.getItems().clear();

        List<ShoppingListItemRequest> itemRequests =
                request == null || request.getItems() == null ? Collections.emptyList() : request.getItems();

        for (int i = 0; i < itemRequests.size(); i++) {
            ShoppingListItemRequest itemRequest = itemRequests.get(i);
            if (itemRequest == null) continue;

            String text = itemRequest.getText() == null ? "" : itemRequest.getText().trim();
            if (text.isEmpty()) continue;

            String type = itemRequest.getType() == null || itemRequest.getType().isBlank()
                    ? DEFAULT_ITEM_TYPE
                    : itemRequest.getType().trim();

            shoppingList.addItem(ShoppingListItem.builder()
                    .text(text)
                    .checked(itemRequest.isChecked())
                    .type(type)
                    .itemOrder(i)
                    .build());
        }

        ShoppingList saved = shoppingListRepository.save(shoppingList);
        return new ShoppingListDetailResponse(
                saved.getId(),
                saved.getUserId(),
                saved.getTitle(),
                toItemResponses(saved),
                saved.getCreatedAt(),
                saved.getUpdatedAt()
        );
    }

    private List<ShoppingListItemResponse> toItemResponses(ShoppingList shoppingList) {
        return shoppingList.getItems().stream()
                .map(item -> new ShoppingListItemResponse(
                        item.getId(),
                        item.getText(),
                        item.isChecked(),
                        item.getType(),
                        item.getItemOrder()
                ))
                .toList();
    }
}
