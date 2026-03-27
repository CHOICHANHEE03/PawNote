import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const DAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

export type DayRecipe = {
  id: number;
  title: string;
  subtitle?: string;
  thumbnailUrl?: string;
};

export type DayMemo = {
  title: string;
  content: string;
};

export type DayEntry = {
  photos?: string[];
  companion?: string;
  recipes?: DayRecipe[];
  memo?: DayMemo;
};

interface Props {
  date: Date;
  entry?: DayEntry;
  entryId?: number;
  loading?: boolean;
  onRecipePress?: (id: number) => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
}

function formatDateTitle(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${DAY_KO[date.getDay()]}요일`;
}

// 섹션 헤더 
function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.sectionHeader}>
      <MaterialIcons name={icon as any} size={15} color="#F5A54C" />
      <Text style={styles.sectionLabel}>{label}</Text>
    </View>
  );
}

// 구분선 
function Divider() {
  return <View style={styles.divider} />;
}

// 메인 
export default function DayContent({ date, entry, entryId, loading, onRecipePress, onEditPress, onDeletePress }: Props) {
  const hasPhotos = (entry?.photos?.length ?? 0) > 0;
  const hasCompanion = !!entry?.companion;
  const hasRecipes = (entry?.recipes?.length ?? 0) > 0;
  const hasMemo = !!entry?.memo?.content?.trim();
  const hasAny = hasPhotos || hasCompanion || hasRecipes || hasMemo;

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#F5A54C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 날짜 헤더 */}
      <View style={styles.dateHeader}>
        <View style={styles.dateDot} />
        <Text style={styles.dateTitle}>{formatDateTitle(date)}</Text>
        {hasAny && (
          <View style={styles.dateActions}>
            <TouchableOpacity style={styles.editBtn} onPress={onEditPress}>
              <MaterialIcons name="edit" size={13} color="#888" />
              <Text style={styles.editBtnText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={onDeletePress}>
              <MaterialIcons name="delete-outline" size={13} color="#e57373" />
              <Text style={styles.deleteBtnText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!hasAny ? (
        // 빈 상태 
        <View style={styles.emptyWrap}>
          <MaterialIcons name="edit-calendar" size={52} color="#e8e0d5" />
          <Text style={styles.emptyTitle}>아직 저장된 내용이 없어요.</Text>
          <Text style={styles.emptyDesc}>
            얼른 요리했던 내용을{"\n"}캘린더에 추가해보세요!
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          {/* 음식 사진 섹션 */}
          {hasPhotos && (
            <>
              <View style={styles.section}>
                <SectionHeader icon="photo-camera" label="오늘의 사진" />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photoRow}
                >
                  {entry!.photos!.map((uri, i) => (
                    <Image
                      key={i}
                      source={{ uri }}
                      style={styles.foodPhoto}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              </View>
              <Divider />
            </>
          )}

          {/* 누구랑 섹션 */}
          {hasCompanion && (
            <>
              <View style={styles.section}>
                <SectionHeader icon="people" label="누구랑" />
                <Text style={styles.companionText}>{entry!.companion}</Text>
              </View>
              <Divider />
            </>
          )}

          {/* 레시피 섹션 */}
          {hasRecipes && (
            <>
              <View style={styles.section}>
                <SectionHeader icon="restaurant-menu" label="요리한 레시피" />
                {entry!.recipes!.map((r, i) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.recipeRow, i > 0 && styles.recipeRowBorder]}
                    activeOpacity={0.75}
                    onPress={() => onRecipePress?.(r.id)}
                  >
                    {r.thumbnailUrl ? (
                      <Image
                        source={{ uri: r.thumbnailUrl }}
                        style={styles.recipeThumbnail}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.recipeThumbnailEmpty}>
                        <MaterialIcons name="restaurant" size={20} color="#ddd" />
                      </View>
                    )}
                    <View style={styles.recipeInfo}>
                      <Text style={styles.recipeTitle} numberOfLines={1}>
                        {r.title}
                      </Text>
                      {r.subtitle ? (
                        <Text style={styles.recipeSubtitle} numberOfLines={1}>
                          {r.subtitle}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.recipeGoBtn}>
                      <Text style={styles.recipeGoBtnText}>보기</Text>
                      <MaterialIcons name="chevron-right" size={16} color="#F5A54C" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              {hasMemo && <Divider />}
            </>
          )}

          {/* 메모 섹션 */}
          {hasMemo && (
            <View style={styles.section}>
              <SectionHeader icon="notes" label="메모" />
              <Text style={styles.memoTitle}>{entry!.memo!.title}</Text>
              <Text style={styles.memoContent}>{entry!.memo!.content}</Text>
            </View>
          )}
        </View>
      )}

      <View style={{ height: 100 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  // 날짜 헤더 
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  dateDot: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: "#F5A54C",
  },
  dateTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
  },
  dateActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0dcd6",
    backgroundColor: "#fff",
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f5c6c6",
    backgroundColor: "#fff9f9",
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#e57373",
  },

  // 빈 상태 
  emptyWrap: {
    alignItems: "center",
    paddingTop: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#bbb",
  },
  emptyDesc: {
    fontSize: 13,
    color: "#ccc",
    textAlign: "center",
    lineHeight: 20,
  },

  // 흰 카드 컨테이너 
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },

  // 섹션 
  section: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#aaa",
    letterSpacing: 0.3,
  },

  // 구분선 
  divider: {
    height: 1,
    backgroundColor: "#f0ede8",
    marginHorizontal: 16,
  },

  // 음식 사진 
  photoRow: {
    gap: 8,
  },
  foodPhoto: {
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: "#f0ede8",
  },

  // 누구랑 함께 텍스트 
  companionText: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },

  // 레시피 행 
  recipeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  recipeRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "#f5f2ed",
  },
  recipeThumbnail: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#f0ede8",
  },
  recipeThumbnailEmpty: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#f5f0ea",
    justifyContent: "center",
    alignItems: "center",
  },
  recipeInfo: {
    flex: 1,
    gap: 3,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  recipeSubtitle: {
    fontSize: 12,
    color: "#aaa",
  },
  recipeGoBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  recipeGoBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F5A54C",
  },

  // 메모 
  memoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  memoContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },

  // 로딩 
  loadingWrap: {
    paddingTop: 48,
    alignItems: "center",
  },
});
