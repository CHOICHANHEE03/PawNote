package com.pawnote.recipe.repository;

import com.pawnote.recipe.entity.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    @EntityGraph(attributePaths = {"ingredients", "steps"})
    Optional<Recipe> findByIdAndUserId(Long id, Long userId);

    Page<Recipe> findAllByUserId(Long userId, Pageable pageable);

    Page<Recipe> findByUserIdAndTitleContainingIgnoreCaseOrUserIdAndSubtitleContainingIgnoreCase(
            Long titleUserId,
            String titleKeyword,
            Long subtitleUserId,
            String subtitleKeyword,
            Pageable pageable
    );

    List<Recipe> findAllByUserId(Long userId);

    void deleteByUserId(Long userId);
}
