package com.pawnote.calendar.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "calendar_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "entry_date", nullable = false)
    private LocalDate date;

    @Column(name = "companion", length = 100)
    private String companion;

    @Column(name = "memo_title", length = 120)
    private String memoTitle;

    @Column(name = "memo_content", length = 5000)
    private String memoContent;

    @OneToMany(mappedBy = "calendarEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("recipeOrder ASC")
    @Builder.Default
    private List<CalendarEntryRecipe> recipes = new ArrayList<>();

    @OneToMany(mappedBy = "calendarEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("imageOrder ASC")
    @Builder.Default
    private List<CalendarEntryImage> images = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void addRecipe(CalendarEntryRecipe recipe) {
        recipes.add(recipe);
        recipe.setCalendarEntry(this);
    }

    public void addImage(CalendarEntryImage image) {
        images.add(image);
        image.setCalendarEntry(this);
    }
}
