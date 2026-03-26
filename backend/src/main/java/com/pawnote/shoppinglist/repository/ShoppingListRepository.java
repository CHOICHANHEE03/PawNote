package com.pawnote.shoppinglist.repository;

import com.pawnote.shoppinglist.entity.ShoppingList;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShoppingListRepository extends JpaRepository<ShoppingList, Long> {
}
