import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useRecipeList } from "@/hooks/recipe/useRecipeList";
import RecipeCard from "@/components/recipe/form/RecipeCard";
import CreateButton from "@/components/common/createButton";
import { RecipeListItem } from "@/services/api/recipeApi";

const CARD_MARGIN = 12;

export default function RecipeScreen() {
  const router = useRouter();
  const { data: recipes, isLoading, isError, refetch } = useRecipeList();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!recipes) return [];
    const q = query.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.subtitle ?? "").toLowerCase().includes(q)
    );
  }, [recipes, query]);

  const renderItem = ({ item, index }: { item: RecipeListItem; index: number }) => {
    const isLeft = index % 2 === 0;
    return (
      <View style={[styles.cardWrapper, isLeft ? { marginRight: CARD_MARGIN / 2 } : { marginLeft: CARD_MARGIN / 2 }]}>
        <RecipeCard
          item={item}
          onPress={() => router.push(`/recipe/${item.id}` as any)}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 검색창 */}
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#aaa" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="레시피 검색..."
          placeholderTextColor="#bbb"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")} hitSlop={8}>
            <MaterialIcons name="close" size={18} color="#aaa" />
          </Pressable>
        )}
      </View>

      {/* 본문 */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#F5A54C" />
          <Text style={styles.loadingText}>레시피 불러오는 중...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <MaterialIcons name="error-outline" size={48} color="#e57373" />
          <Text style={styles.errorText}>목록을 불러오지 못했어요.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <MaterialIcons name="restaurant-menu" size={56} color="#e0d8ce" />
              <Text style={styles.emptyText}>
                {query ? "검색 결과가 없어요." : "저장된 레시피가 없어요."}
              </Text>
              {!query && (
                <Text style={styles.emptySubText}>
                  아래 + 버튼으로 첫 레시피를 추가해보세요!
                </Text>
              )}
            </View>
          }
        />
      )}

      {/* 작성 버튼 */}
      <View style={styles.fabArea}>
        <CreateButton onPress={() => router.push("/recipe/create")} icon="add" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf8f5",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: CARD_MARGIN,
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: CARD_MARGIN,
    paddingTop: 4,
    paddingBottom: 100,
  },
  cardWrapper: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    gap: 10,
  },
  loadingText: {
    marginTop: 10,
    color: "#aaa",
    fontSize: 13,
  },
  errorText: {
    color: "#e57373",
    fontSize: 15,
    fontWeight: "600",
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: "#F5A54C",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  emptyText: {
    fontSize: 15,
    color: "#aaa",
    fontWeight: "600",
  },
  emptySubText: {
    fontSize: 12,
    color: "#ccc",
  },
  fabArea: {
    position: "absolute",
    right: 16,
    bottom: 20,
  },
});
