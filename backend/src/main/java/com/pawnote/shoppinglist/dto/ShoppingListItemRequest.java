package com.pawnote.shoppinglist.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShoppingListItemRequest {
    private String text;
    private boolean checked;
    private String type;
}
