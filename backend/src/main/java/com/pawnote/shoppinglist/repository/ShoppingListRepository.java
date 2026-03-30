package com.pawnote.shoppinglist.repository;

import com.pawnote.shoppinglist.entity.ShoppingList;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShoppingListRepository extends JpaRepository<ShoppingList, Long> {
    List<ShoppingList> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteByUserId(Long userId);

    @EntityGraph(attributePaths = "items")
    Optional<ShoppingList> findByIdAndUserId(Long id, Long userId);
}
