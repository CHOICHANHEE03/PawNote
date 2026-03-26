import { useEffect, useRef, useState } from "react";
import {
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
import { router } from "expo-router";
import BackHeader from "@/components/header/BackHeader";
import { useCreateShoppingList } from "@/hooks/shopping/useCreateShoppingList";

type ShoppingItem = {
    id: number;
    text: string;
    checked: boolean;
};

let nextItemId = 1;

export default function ShoppingCreateScreen() {
    const [title, setTitle] = useState("");
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const insets = useSafeAreaInsets();
    const { mutateAsync } = useCreateShoppingList();

    // 항상 최신 값을 ref에 동기화 
    const titleRef = useRef(title);
    const itemsRef = useRef(items);
    useEffect(() => { titleRef.current = title; }, [title]);
    useEffect(() => { itemsRef.current = items; }, [items]);

    const hasData = () =>
        titleRef.current.trim().length > 0 || itemsRef.current.length > 0;

    const saveAndLeave = async () => {
        if (hasData()) {
            try {
                await mutateAsync({
                    title: titleRef.current.trim() || "새로운 장보기",
                    items: itemsRef.current.map(({ text, checked }) => ({ text, checked })),
                });
            } catch {

            }
        }
        router.back();
    };

    useEffect(() => {
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            saveAndLeave();
            return true;
        });
        return () => sub.remove();
    }, []);

    const handleAddItem = () => {
        setItems((prev) => [...prev, { id: nextItemId++, text: "", checked: false }]);
    };

    const handleItemTextChange = (id: number, text: string) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));
    };

    const handleToggleCheck = (id: number) => {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
        );
    };

    const handleRemoveItem = (id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <View style={styles.container}>
            <BackHeader onBack={saveAndLeave} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: Math.max(insets.bottom, 16) + 20 },
                    ]}
                    keyboardShouldPersistTaps="handled"
                >
                    <TextInput
                        style={styles.titleInput}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="새로운 장보기"
                        placeholderTextColor="#bbb"
                        returnKeyType="done"
                        autoFocus
                    />

                    <View style={styles.divider} />

                    {items.map((item) => (
                        <View key={item.id} style={styles.itemRow}>
                            <TouchableOpacity onPress={() => handleToggleCheck(item.id)} style={styles.checkbox}>
                                <MaterialIcons
                                    name={item.checked ? "check-box" : "check-box-outline-blank"}
                                    size={22}
                                    color={item.checked ? "#F5A54C" : "#ccc"}
                                />
                            </TouchableOpacity>

                            <TextInput
                                style={[styles.itemInput, item.checked && styles.itemChecked]}
                                value={item.text}
                                onChangeText={(text) => handleItemTextChange(item.id, text)}
                                placeholder="재료 또는 항목 입력"
                                placeholderTextColor="#bbb"
                                returnKeyType="done"
                            />

                            <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.removeBtn}>
                                <MaterialIcons name="close" size={18} color="#ccc" />
                            </TouchableOpacity>
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addRow} onPress={handleAddItem}>
                        <MaterialIcons name="add" size={20} color="#F5A54C" />
                        <Text style={styles.addText}>항목 추가</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#faf8f5",
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    titleInput: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1a1a1a",
        paddingVertical: 4,
        marginBottom: 16,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#ddd",
        marginBottom: 16,
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 8,
    },
    checkbox: {
        padding: 2,
    },
    itemInput: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        paddingVertical: 4,
    },
    itemChecked: {
        textDecorationLine: "line-through",
        color: "#bbb",
    },
    removeBtn: {
        padding: 4,
    },
    addRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
        paddingVertical: 8,
    },
    addText: {
        fontSize: 15,
        color: "#F5A54C",
        fontWeight: "600",
    },
});
