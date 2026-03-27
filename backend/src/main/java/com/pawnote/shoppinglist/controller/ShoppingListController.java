package com.pawnote.shoppinglist.controller;

import com.pawnote.auth.jwt.JwtAuthenticationFilter;
import com.pawnote.shoppinglist.dto.ShoppingListCreateRequest;
import com.pawnote.shoppinglist.dto.ShoppingListCreateResponse;
import com.pawnote.shoppinglist.dto.ShoppingListDetailResponse;
import com.pawnote.shoppinglist.dto.ShoppingListSummaryResponse;
import com.pawnote.shoppinglist.dto.ShoppingListUpdateRequest;
import com.pawnote.shoppinglist.service.ShoppingListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/shopping-lists")
@RequiredArgsConstructor
public class ShoppingListController {

    private final ShoppingListService shoppingListService;

    @GetMapping
    public List<ShoppingListSummaryResponse> getShoppingLists(
            @AuthenticationPrincipal JwtAuthenticationFilter.JwtUserPrincipal principal
    ) {
        Long userId = extractUserId(principal);
        return shoppingListService.getAll(userId);
    }

    @GetMapping("/{id}")
    public ShoppingListDetailResponse getShoppingListDetail(
            @AuthenticationPrincipal JwtAuthenticationFilter.JwtUserPrincipal principal,
            @PathVariable Long id
    ) {
        Long userId = extractUserId(principal);
        return shoppingListService.getDetail(userId, id);
    }

    @PutMapping("/{id}")
    public ShoppingListDetailResponse updateShoppingList(
            @AuthenticationPrincipal JwtAuthenticationFilter.JwtUserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) ShoppingListUpdateRequest request
    ) {
        Long userId = extractUserId(principal);
        return shoppingListService.update(userId, id, request);
    }

    @PostMapping
    public ShoppingListCreateResponse createShoppingList(
            @AuthenticationPrincipal JwtAuthenticationFilter.JwtUserPrincipal principal,
            @RequestBody(required = false) ShoppingListCreateRequest request
    ) {
        Long userId = extractUserId(principal);
        return shoppingListService.create(userId, request);
    }

    private Long extractUserId(JwtAuthenticationFilter.JwtUserPrincipal principal) {
        if (principal == null || principal.userId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication information is missing.");
        }
        return principal.userId();
    }
}
