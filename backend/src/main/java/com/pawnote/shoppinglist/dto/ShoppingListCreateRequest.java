package com.pawnote.shoppinglist.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ShoppingListCreateRequest {
    private String title;
    private List<ShoppingListItemRequest> items;
}
