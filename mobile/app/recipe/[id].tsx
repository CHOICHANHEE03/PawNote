import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BackHeader from "@/components/header/BackHeader";
import { useRecipeDetail } from "@/hooks/useRecipeDetail";
import { styles, ORANGE } from "@/components/recipe/detail/detail.styles";
import { extractYouTubeId, groupIngredients } from "@/components/recipe/detail/detail.types";
import MediaSection from "@/components/recipe/detail/MediaSection";
import IngredientsSection from "@/components/recipe/detail/IngredientsSection";
import StepsSection from "@/components/recipe/detail/StepsSection";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: recipe, isLoading, isError, refetch } = useRecipeDetail(Number(id));
  const [playing, setPlaying] = useState(false);

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") setPlaying(false);
  }, []);

  // 로딩
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ORANGE} />
        <Text style={styles.loadingText}>레시피 불러오는 중...</Text>
      </View>
    );
  }

  // 에러
  if (isError || !recipe) {
    return (
      <View style={styles.center}>
        <MaterialIcons name="error-outline" size={52} color="#e57373" />
        <Text style={styles.errorText}>레시피를 불러오지 못했어요.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const videoId = recipe.videoLink ? extractYouTubeId(recipe.videoLink) : null;
  const ingredientGroups = groupIngredients(recipe.ingredients);

  return (
    <View style={styles.root}>
      <BackHeader />

      {/* 영상 또는 이미지 (헤더 아래 고정) */}
      <MediaSection
        videoId={videoId}
        imageUrl={recipe.imageUrl}
        playing={playing}
        onPlayPress={() => setPlaying(true)}
        onStateChange={onStateChange}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* 제목 */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{recipe.title}</Text>
          {!!recipe.subtitle && (
            <Text style={styles.subtitle}>{recipe.subtitle}</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* 재료 + 인분 선택 */}
        <IngredientsSection
          groups={ingredientGroups}
          baseServings={recipe.servings}
        />

        <View style={styles.divider} />

        {/* 조리 순서 */}
        <StepsSection steps={recipe.steps} />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
