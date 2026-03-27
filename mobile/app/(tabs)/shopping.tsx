import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import CreateButton from "@/components/common/createButton";
import { useShoppingLists } from "@/hooks/shopping/useShoppingLists";

function formatDate(isoString: string): string {
    const d = new Date(isoString);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function ShoppingScreen() {
    const router = useRouter();
    const { data: lists, isLoading } = useShoppingLists();

    const isEmpty = !lists || lists.length === 0;

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View style={styles.empty}>
                    <ActivityIndicator size="large" color="#F5A54C" />
                </View>
            ) : isEmpty ? (
                <View style={styles.empty}>
                    <MaterialIcons name="shopping-cart" size={56} color="#e0d8ce" />
                    <Text style={styles.emptyText}>아직 만든 장보기 목록이 없어요.</Text>
                    <Text style={styles.emptySubText}>새 목록을 만들어보세요!</Text>
                </View>
            ) : (
                <FlatList
                    data={lists}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            activeOpacity={0.75}
                            onPress={() => router.push(`/shopping/${item.id}` as any)}
                        >
                            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                            <View style={styles.cardMeta}>
                                <Text style={styles.cardDate}>{formatDate(item.updatedAt)}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}

            <View style={styles.fabArea}>
                <CreateButton onPress={() => router.push("/shopping/create" as any)} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#faf8f5",
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 100,
        gap: 10,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 4,
    },
    cardMeta: {
        flexDirection: "row",
        alignItems: "center",
    },
    cardDate: {
        fontSize: 13,
        color: "#999",
    },
    empty: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
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
