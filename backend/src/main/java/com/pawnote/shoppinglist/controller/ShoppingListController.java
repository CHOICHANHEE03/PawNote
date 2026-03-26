package com.pawnote.shoppinglist.controller;

import com.pawnote.auth.jwt.JwtAuthenticationFilter;
import com.pawnote.shoppinglist.dto.ShoppingListCreateRequest;
import com.pawnote.shoppinglist.dto.ShoppingListCreateResponse;
import com.pawnote.shoppinglist.service.ShoppingListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/shopping-lists")
@RequiredArgsConstructor
public class ShoppingListController {

    private final ShoppingListService shoppingListService;

    @PostMapping
    public ShoppingListCreateResponse createShoppingList(
            @AuthenticationPrincipal JwtAuthenticationFilter.JwtUserPrincipal principal,
            @RequestBody(required = false) ShoppingListCreateRequest request
    ) {
        if (principal == null || principal.userId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication information is missing.");
        }

        return shoppingListService.create(principal.userId(), request);
    }
}
