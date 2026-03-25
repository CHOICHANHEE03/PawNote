import { Pressable, Text, TextInput, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { CATEGORY_UNITS, ORANGE, GRAY, getCategoryEmoji, IngredientItem, IngredientUnit } from "./create.types";
import { styles } from "./create.styles";

interface CategoryGroup {
    category: string;
    items: IngredientItem[];
}

interface Props {
    categoryGroups: CategoryGroup[];
    focusedInput: string;
    onOpenCategoryModal: () => void;
    onAddToCategory: (category: string) => void;
    onIngredientChange: (id: number, field: "name" | "amount", text: string) => void;
    onIngredientUnitChange: (id: number, unit: IngredientUnit) => void;
    onRemoveIngredient: (id: number) => void;
    onFocus: (key: string) => void;
    onBlur: () => void;
    onInputFocusEvent: (target: number, offset?: number) => void;
    servings: string;
    onServingsChange: (text: string) => void;
    errorMessage?: string;
    servingsError?: string;
    invalidIngredientIds?: string[];
}

export default function IngredientSection({
    categoryGroups,
    focusedInput,
    onOpenCategoryModal,
    onAddToCategory,
    onIngredientChange,
    onIngredientUnitChange,
    onRemoveIngredient,
    onFocus,
    onBlur,
    onInputFocusEvent,
    servings,
    onServingsChange,
    errorMessage,
    servingsError,
    invalidIngredientIds = [],
}: Props) {
    return (
        <>
            {/* 섹션 헤더 */}
            <View style={styles.sectionHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.sectionTitle}>재료</Text>

                    {/* 몇 인분 입력 */}
                    <View style={{ marginLeft: 16 }}>
                        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                            <TextInput
                                style={[
                                    { width: 45, borderBottomWidth: 1.5, borderBottomColor: GRAY, paddingVertical: 4, fontSize: 16, color: ORANGE, textAlign: "center", fontWeight: "700" },
                                    servingsError ? { borderBottomColor: "red" } : {}
                                ]}
                                value={servings}
                                onChangeText={(t) => onServingsChange(t.replace(/[^0-9]/g, ''))}
                                keyboardType="numeric"
                                placeholder="2"
                                placeholderTextColor="#ccc"
                            />
                            <Text style={{ fontSize: 13, color: "#222", marginLeft: 4, marginBottom: 6 }}>인분</Text>
                        </View>
                    </View>
                </View>

                <Pressable onPress={onOpenCategoryModal}>
                    <Text style={styles.addText}>+ 카테고리 추가</Text>
                </Pressable>
            </View>

            {(servingsError || errorMessage) && (
                <View style={{ marginBottom: 12 }}>
                    {servingsError && <Text style={{ color: "red", fontSize: 12, marginLeft: 4 }}>{servingsError}</Text>}
                    {errorMessage && <Text style={{ color: "red", fontSize: 12, marginLeft: 4, marginTop: servingsError ? 4 : 0 }}>{errorMessage}</Text>}
                </View>
            )}

            {/* 빈 상태 or 카테고리 그룹 목록 */}
            {categoryGroups.length === 0 ? (
                <Text style={styles.emptyText}>재료를 추가해 주세요.</Text>
            ) : (
                categoryGroups.map((group) => {
                    const unitOptions = CATEGORY_UNITS[group.category] ?? ["개"];
                    const fixedUnit = unitOptions.length === 1;

                    return (
                        <View key={group.category} style={styles.categoryGroup}>
                            {/* 카테고리 헤더 */}
                            <View style={styles.categoryHeader}>
                                <Text style={styles.categoryEmoji}>
                                    {getCategoryEmoji(group.category)}
                                </Text>
                                <Text style={styles.categoryLabel}>{group.category}</Text>
                            </View>

                            {/* 재료 행들 */}
                            {group.items.map((item) => (
                                <View key={item.id} style={styles.ingredientRow}>
                                    {/* 재료명 */}
                                    <TextInput
                                        style={[
                                            styles.ingredientNameInput,
                                            focusedInput === `name-${item.id}` && styles.fieldActive,
                                            invalidIngredientIds.includes(String(item.id)) && !item.name.trim() ? { borderBottomColor: "red" } : {}
                                        ]}
                                        placeholder="재료명"
                                        placeholderTextColor="#bbb"
                                        value={item.name}
                                        onChangeText={(t) => onIngredientChange(item.id, "name", t)}
                                        onFocus={(e) => { onFocus(`name-${item.id}`); onInputFocusEvent(e.nativeEvent.target, 120); }}
                                        onBlur={onBlur}
                                    />

                                    {/* 수량 */}
                                    <TextInput
                                        style={[
                                            styles.ingredientAmountInput,
                                            focusedInput === `amount-${item.id}` && styles.fieldActive,
                                            invalidIngredientIds.includes(String(item.id)) && !item.amount.trim() ? { borderBottomColor: "red" } : {}
                                        ]}
                                        placeholder="수량"
                                        placeholderTextColor="#bbb"
                                        value={item.amount}
                                        onChangeText={(t) => onIngredientChange(item.id, "amount", t)}
                                        onFocus={(e) => { onFocus(`amount-${item.id}`); onInputFocusEvent(e.nativeEvent.target, 120); }}
                                        onBlur={onBlur}
                                        keyboardType="numeric"
                                    />

                                    {/* 단위: 고정 텍스트 or Picker */}
                                    {fixedUnit ? (
                                        <View style={styles.unitFixed}>
                                            <Text style={styles.unitFixedText}>{unitOptions[0]}</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.unitPickerWrapper}>
                                            <Picker
                                                selectedValue={item.unit}
                                                onValueChange={(val) =>
                                                    onIngredientUnitChange(item.id, val as IngredientUnit)
                                                }
                                                style={styles.unitPicker}
                                                dropdownIconColor={ORANGE}
                                                mode="dropdown"
                                            >
                                                {unitOptions.map((u) => (
                                                    <Picker.Item key={u} label={u} value={u} />
                                                ))}
                                            </Picker>
                                        </View>
                                    )}

                                    {/* 삭제 */}
                                    <Pressable onPress={() => onRemoveIngredient(item.id)}>
                                        <Text style={styles.deleteText}>✕</Text>
                                    </Pressable>
                                </View>
                            ))}

                            {/* 카테고리 내 재료 추가 */}
                            <Pressable
                                style={styles.inlineAddButton}
                                onPress={() => onAddToCategory(group.category)}
                            >
                                <Text style={styles.inlineAddText}>
                                    + {group.category} 재료 추가
                                </Text>
                            </Pressable>
                        </View>
                    );
                })
            )}
        </>
    );
}
