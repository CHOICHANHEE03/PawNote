import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CATEGORIES } from "./create.types";
import { styles } from "./create.styles";

interface CategoryGroup {
    category: string;
}

interface Props {
    visible: boolean;
    categoryGroups: CategoryGroup[];
    onSelectCategory: (category: string) => void;
    onClose: () => void;
}

export default function CategoryModal({
    visible,
    categoryGroups,
    onSelectCategory,
    onClose,
}: Props) {
    const insets = useSafeAreaInsets();
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 24 }]}>
                    <View style={styles.modalHandle} />
                    <Text style={styles.modalTitle}>카테고리 선택</Text>
                    <Text style={styles.modalSubtitle}>재료의 종류를 선택해 주세요.</Text>

                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map((cat) => {
                            const already = categoryGroups.some(
                                (g) => g.category === cat.label
                            );
                            return (
                                <TouchableOpacity
                                    key={cat.label}
                                    style={[
                                        styles.categoryCard,
                                        already && styles.categoryCardActive,
                                    ]}
                                    onPress={() => onSelectCategory(cat.label)}
                                    activeOpacity={0.75}
                                >
                                    <Text style={styles.categoryCardEmoji}>{cat.emoji}</Text>
                                    <Text style={styles.categoryCardLabel}>{cat.label}</Text>
                                    {"sub" in cat && (
                                        <Text style={styles.categoryCardSub}>{cat.sub}</Text>
                                    )}
                                    {already && (
                                        <Text style={styles.categoryCardBadge}>추가됨</Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
}
