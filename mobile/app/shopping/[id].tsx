import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    BackHandler,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import BackHeader from "@/components/header/BackHeader";
import { useShoppingListDetail } from "@/hooks/shopping/useShoppingListDetail";
import { useUpdateShoppingList } from "@/hooks/shopping/useUpdateShoppingList";
import RecipeImportModal from "@/components/shopping/RecipeImportModal";

type ItemType = "check" | "category";

type ShoppingItem = {
    id: number;
    text: string;
    checked: boolean;
    type: ItemType;
};

let nextItemId = 10000;

type Section = {
    categoryId: number | null;
    categoryText: string;
    items: ShoppingItem[];
};

function buildSections(flatItems: ShoppingItem[]): Section[] {
    const sections: Section[] = [];
    let current: Section = { categoryId: null, categoryText: "", items: [] };
    for (const item of flatItems) {
        if (item.type === "category") {
            if (current.categoryId !== null || current.items.length > 0) sections.push(current);
            current = { categoryId: item.id, categoryText: item.text, items: [] };
        } else {
            current.items.push(item);
        }
    }
    sections.push(current);
    return sections;
}

export default function ShoppingDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const listId = Number(id);

    const { data, isLoading } = useShoppingListDetail(listId);
    const { mutateAsync } = useUpdateShoppingList();
    const insets = useSafeAreaInsets();

    const [initialized, setInitialized] = useState(false);
    const [title, setTitle] = useState("");
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [pendingFocusId, setPendingFocusId] = useState<number | null>(null);
    const inputRefs = useRef<Map<number, TextInput>>(new Map());

    const titleRef = useRef(title);
    const itemsRef = useRef(items);
    useEffect(() => { titleRef.current = title; }, [title]);
    useEffect(() => { itemsRef.current = items; }, [items]);

    // 백엔드 데이터 로드되면 초기화
    useEffect(() => {
        if (data && !initialized) {
            setTitle(data.title);
            const loaded: ShoppingItem[] = data.items
                .slice()
                .sort((a, b) => a.itemOrder - b.itemOrder)
                .map((item) => ({
                    id: nextItemId++,
                    text: item.text,
                    checked: item.checked,
                    type: item.type as ItemType,
                }));
            setItems(loaded.length > 0 ? loaded : [
                { id: nextItemId++, text: "", checked: false, type: "category" },
                { id: nextItemId++, text: "", checked: false, type: "check" },
            ]);
            setInitialized(true);
        }
    }, [data, initialized]);

    useEffect(() => {
        if (pendingFocusId !== null) {
            inputRefs.current.get(pendingFocusId)?.focus();
            setPendingFocusId(null);
        }
    }, [pendingFocusId, items]);

    const saveAndLeave = async () => {
        try {
            await mutateAsync({
                id: listId,
                payload: {
                    title: titleRef.current.trim() || "새로운 장보기",
                    items: itemsRef.current
                        .filter((i) => i.text.trim().length > 0)
                        .map(({ text, checked, type }) => ({ text, checked, type })),
                },
            });
        } catch { }
        router.back();
    };

    useEffect(() => {
        const sub = BackHandler.addEventListener("hardwareBackPress", () => { saveAndLeave(); return true; });
        return () => sub.remove();
    }, []);

    const setRef = (id: number) => (ref: TextInput | null) => {
        if (ref) inputRefs.current.set(id, ref);
        else inputRefs.current.delete(id);
    };

    const handleCheckBackspace = (id: number) => {
        setItems((prev) => {
            const idx = prev.findIndex((i) => i.id === id);
            if (idx === -1 || prev[idx].text !== "") return prev;

            let removeFrom = idx;
            let removeTo = idx;

            let catIdx = -1;
            for (let i = idx - 1; i >= 0; i--) {
                if (prev[i].type === "category") { catIdx = i; break; }
            }

            if (catIdx !== -1) {
                const nextCatIdx = prev.findIndex((i, ii) => ii > catIdx && i.type === "category");
                const end = nextCatIdx === -1 ? prev.length : nextCatIdx;
                const checkItemsInCat = prev.slice(catIdx + 1, end).filter((i) => i.type === "check");
                if (checkItemsInCat.length <= 1) {
                    removeFrom = catIdx;
                    removeTo = idx;
                }
            }

            const afterDelete = prev.filter((_, ii) => ii < removeFrom || ii > removeTo);
            if (afterDelete.length === 0) return prev;

            const prevFocusItem = prev[removeFrom - 1];
            if (prevFocusItem) setPendingFocusId(prevFocusItem.id);

            return afterDelete;
        });
    };

    const handleCategoryBackspace = (categoryId: number) => {
        setItems((prev) => {
            const catIdx = prev.findIndex((i) => i.id === categoryId);
            if (catIdx === -1 || prev[catIdx].text !== "") return prev;
            const nextCatIdx = prev.findIndex((i, ii) => ii > catIdx && i.type === "category");
            const end = nextCatIdx === -1 ? prev.length : nextCatIdx;
            const afterDelete = prev.filter((_, ii) => ii < catIdx || ii >= end);
            if (afterDelete.length === 0) return prev;
            const prevFocusItem = prev[catIdx - 1];
            if (prevFocusItem) setPendingFocusId(prevFocusItem.id);
            return afterDelete;
        });
    };

    const handleToggleCheck = (id: number) =>
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));

    const handleTextChange = (id: number, text: string) =>
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, text } : i)));

    const handleAddItem = () => {
        const newId = nextItemId++;
        setItems((prev) => [...prev, { id: newId, text: "", checked: false, type: "check" }]);
        setPendingFocusId(newId);
    };

    const handleAddCategory = () => {
        const catId = nextItemId++;
        const checkId = nextItemId++;
        setItems((prev) => [
            ...prev,
            { id: catId, text: "", checked: false, type: "category" },
            { id: checkId, text: "", checked: false, type: "check" },
        ]);
        setPendingFocusId(catId);
    };

    const handleImportIngredients = (texts: string[], recipeTitle: string) => {
        if (recipeTitle) setTitle(recipeTitle);
        const newItems: ShoppingItem[] = texts.map((text) => ({
            id: nextItemId++,
            text,
            checked: false,
            type: (text.startsWith("[") && text.endsWith("]") ? "category" : "check") as ItemType,
        }));
        setItems((prev) => {
            const hasContent = prev.some((i) => i.text.trim().length > 0);
            return hasContent ? [...prev, ...newItems] : newItems;
        });
    };

    if (isLoading || !initialized) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#F5A54C" />
            </View>
        );
    }

    const sections = buildSections(items);

    return (
        <View style={styles.container}>
            <BackHeader
                onBack={saveAndLeave}
                right={
                    <TouchableOpacity onPress={() => setImportModalVisible(true)} style={styles.importIconBtn}>
                        <MaterialIcons name="file-download" size={20} color="#F5A54C" />
                        <Text style={styles.importIconLabel}>레시피 가져오기</Text>
                    </TouchableOpacity>
                }
            />
            <RecipeImportModal
                visible={importModalVisible}
                onClose={() => setImportModalVisible(false)}
                onImport={handleImportIngredients}
            />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) + 20 }]}
                    keyboardShouldPersistTaps="handled"
                >
                    <TextInput
                        style={styles.titleInput}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="새로운 장보기"
                        placeholderTextColor="#bbb"
                        returnKeyType="done"
                    />
                    <View style={styles.divider} />

                    {sections.map((section, si) => (
                        <View key={section.categoryId ?? `s${si}`}>
                            {section.categoryId !== null && (
                                <TextInput
                                    ref={setRef(section.categoryId)}
                                    style={styles.categoryInput}
                                    value={section.categoryText}
                                    onChangeText={(text) => handleTextChange(section.categoryId!, text)}
                                    onKeyPress={({ nativeEvent }) => {
                                        if (nativeEvent.key === "Backspace") handleCategoryBackspace(section.categoryId!);
                                    }}
                                    placeholder="[카테고리]"
                                    placeholderTextColor="#bbb"
                                    returnKeyType="next"
                                    submitBehavior="submit"
                                    onSubmitEditing={() => {
                                        const firstCheck = section.items[0];
                                        if (firstCheck) setPendingFocusId(firstCheck.id);
                                    }}
                                />
                            )}

                            {section.items.map((item) => (
                                <View key={item.id} style={styles.itemRow}>
                                    <TouchableOpacity onPress={() => handleToggleCheck(item.id)} style={styles.checkbox}>
                                        <MaterialIcons
                                            name={item.checked ? "check-box" : "check-box-outline-blank"}
                                            size={22}
                                            color={item.checked ? "#F5A54C" : "#ccc"}
                                        />
                                    </TouchableOpacity>
                                    <TextInput
                                        ref={setRef(item.id)}
                                        style={[styles.itemInput, item.checked && styles.itemChecked]}
                                        value={item.text}
                                        onChangeText={(text) => handleTextChange(item.id, text)}
                                        onKeyPress={({ nativeEvent }) => {
                                            if (nativeEvent.key === "Backspace") handleCheckBackspace(item.id);
                                        }}
                                        placeholder="재료 또는 항목"
                                        placeholderTextColor="#bbb"
                                        returnKeyType="done"
                                    />
                                </View>
                            ))}
                        </View>
                    ))}

                    <View style={styles.addBtnRow}>
                        <TouchableOpacity style={styles.addBtn} onPress={handleAddCategory}>
                            <MaterialIcons name="add" size={16} color="#F5A54C" />
                            <Text style={styles.addBtnText}>카테고리 추가</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}>
                            <MaterialIcons name="add" size={16} color="#F5A54C" />
                            <Text style={styles.addBtnText}>항목 추가</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#faf8f5" },
    centered: { justifyContent: "center", alignItems: "center" },
    scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24 },
    titleInput: {
        fontSize: 22, fontWeight: "700", color: "#1a1a1a",
        paddingVertical: 4, marginBottom: 16,
    },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#ddd", marginBottom: 16 },
    categoryInput: {
        fontSize: 13, fontWeight: "700", color: "#888",
        paddingVertical: 4, marginTop: 16, marginBottom: 6,
        letterSpacing: 0.5,
    },
    itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 8 },
    checkbox: { padding: 2 },
    itemInput: { flex: 1, fontSize: 16, color: "#333", paddingVertical: 4 },
    itemChecked: { textDecorationLine: "line-through", color: "#bbb" },
    addBtnRow: { flexDirection: "row", gap: 12, marginTop: 20 },
    addBtn: {
        flexDirection: "row", alignItems: "center", gap: 4,
        paddingVertical: 8, paddingHorizontal: 12,
        backgroundColor: "#fff", borderRadius: 8,
        borderWidth: 1, borderColor: "#f0ece6",
    },
    addBtnText: { fontSize: 14, color: "#F5A54C", fontWeight: "600" },
    importIconBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 6, paddingHorizontal: 10, marginRight: 4 },
    importIconLabel: { fontSize: 13, color: "#F5A54C", fontWeight: "600" },
});
