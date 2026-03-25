package com.pawnote.recipe.repository;

import com.pawnote.recipe.entity.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    Page<Recipe> findByTitleContainingIgnoreCaseOrSubtitleContainingIgnoreCase(
            String titleKeyword,
            String subtitleKeyword,
            Pageable pageable
    );
}
