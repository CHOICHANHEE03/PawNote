import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import CreateButton from "@/components/common/createButton";

type ShoppingNote = {
    id: number;
    title: string;
    preview: string;
    date: string;
};

const DUMMY: ShoppingNote[] = [
    { id: 1, title: "이번 주 장보기", preview: "닭가슴살, 브로콜리, 고구마, 두유...", date: "3월 25일" },
    { id: 2, title: "간식 재료", preview: "그릭요거트, 견과류 믹스, 바나나", date: "3월 22일" },
    { id: 3, title: "소스류 채우기", preview: "간장, 참기름, 굴소스, 올리브오일", date: "3월 18일" },
];

export default function ShoppingScreen() {
    const isEmpty = DUMMY.length === 0;

    return (
        <View style={styles.container}>
            {isEmpty ? (
                <View style={styles.empty}>
                    <MaterialIcons name="shopping-cart" size={56} color="#e0d8ce" />
                    <Text style={styles.emptyText}>아직 만든 장보기 목록이 없어요.</Text>
                    <Text style={styles.emptySubText}>새 목록을 만들어보세요!</Text>
                </View>
            ) : (
                <FlatList
                    data={DUMMY}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.card} activeOpacity={0.75}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                            <View style={styles.cardMeta}>
                                <Text style={styles.cardDate}>{item.date}</Text>
                                <Text style={styles.cardDot}>  ·  </Text>
                                <Text style={styles.cardPreview} numberOfLines={1}>{item.preview}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}

            <View style={styles.fabArea}>
                <CreateButton onPress={() => { }} />
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
    cardDot: {
        fontSize: 13,
        color: "#ccc",
    },
    cardPreview: {
        flex: 1,
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
