import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRecipeList } from "@/hooks/recipe/useRecipeList";
import { useAuthStore } from "@/stores/authStore";
import { getRecipeDetail } from "@/services/api/recipeApi";
import { groupIngredients } from "@/components/recipe/detail/detail.types";

const ORANGE = "#F5A54C";

type Props = {
    visible: boolean;
    onClose: () => void;
    onImport: (items: string[], recipeTitle: string) => void;
};

export default function RecipeImportModal({ visible, onClose, onImport }: Props) {
    const insets = useSafeAreaInsets();
    const { data: recipes, isLoading } = useRecipeList();
    const { accessToken } = useAuthStore();

    const handleSelectRecipe = async (id: number, recipeTitle: string) => {
        if (!accessToken) return;
        try {
            const detail = await getRecipeDetail({ id, accessToken });
            const groups = groupIngredients(detail.ingredients);
            const items: string[] = [];
            for (const group of groups) {
                items.push(`[${group.category}]`);
                for (const ing of group.items) {
                    items.push([ing.name, ing.amount, ing.unit].filter(Boolean).join(" "));
                }
            }
            onImport(items, recipeTitle);
            onClose();
        } catch {
            // 실패 시 무시
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <MaterialIcons name="close" size={22} color="#1a1a1a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>레시피에서 가져오기</Text>
                    <View style={styles.closeBtn} />
                </View>

                {isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={ORANGE} />
                    </View>
                ) : !recipes?.length ? (
                    <View style={styles.center}>
                        <MaterialIcons name="menu-book" size={48} color="#ddd" />
                        <Text style={styles.emptyText}>저장된 레시피가 없어요</Text>
                    </View>
                ) : (
                    <FlatList
                        data={recipes}
                        keyExtractor={(item) => String(item.id)}
                        contentContainerStyle={styles.listContent}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.recipeRow}
                                onPress={() => handleSelectRecipe(item.id, item.title)}
                            >
                                <View style={styles.recipeInfo}>
                                    <Text style={styles.recipeTitle}>{item.title}</Text>
                                    {!!item.subtitle && (
                                        <Text style={styles.recipeSubtitle} numberOfLines={1}>
                                            {item.subtitle}
                                        </Text>
                                    )}
                                </View>
                                <MaterialIcons name="chevron-right" size={22} color="#ccc" />
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#faf8f5",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        height: 52,
        backgroundColor: "#fff",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#e0dcd6",
        paddingHorizontal: 4,
    },
    closeBtn: {
        width: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        color: "#1a1a1a",
        textAlign: "center",
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    emptyText: {
        fontSize: 15,
        color: "#aaa",
    },
    listContent: {
        paddingVertical: 8,
    },
    recipeRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#fff",
    },
    recipeInfo: {
        flex: 1,
        gap: 3,
    },
    recipeTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1a1a1a",
    },
    recipeSubtitle: {
        fontSize: 13,
        color: "#888",
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#e0dcd6",
        marginLeft: 20,
    },
});
