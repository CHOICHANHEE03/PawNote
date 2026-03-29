import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { UtensilsCrossed } from "lucide-react-native";
import { styles } from "./detail.styles";
import { IngredientGroup, scaleAmount } from "./detail.types";

interface Props {
  groups: IngredientGroup[];
  baseServings: number;
}

export default function IngredientsSection({ groups, baseServings }: Props) {
  const [viewServings, setViewServings] = useState<number | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");

  const currentServings = viewServings ?? baseServings;
  const ratio = currentServings / baseServings;

  const servingOptions = [baseServings, baseServings + 1, baseServings + 2];
  const isCustomSelected = !servingOptions.includes(currentServings);

  const handleCustomSubmit = () => {
    const n = parseInt(customText, 10);
    if (!isNaN(n) && n > 0) setViewServings(n);
    setShowCustomInput(false);
    setCustomText("");
  };

  return (
    <View style={styles.section}>
      {/* 제목 + 인분 선택 */}
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <UtensilsCrossed size={18} color="#1a1a1a" />
            <Text style={styles.sectionTitle}>재료</Text>
          </View>
        <View style={styles.servingsRow}>
          {servingOptions.map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.servingsBtn, currentServings === n && styles.servingsBtnActive]}
              onPress={() => { setViewServings(n); setShowCustomInput(false); }}
            >
              <Text style={[styles.servingsBtnText, currentServings === n && styles.servingsBtnTextActive]}>
                {n}인분
              </Text>
            </TouchableOpacity>
          ))}

          {showCustomInput ? (
            <TextInput
              style={styles.customInput}
              value={customText}
              onChangeText={setCustomText}
              keyboardType="number-pad"
              placeholder="인분"
              autoFocus
              onSubmitEditing={handleCustomSubmit}
              onBlur={handleCustomSubmit}
              maxLength={3}
            />
          ) : (
            <TouchableOpacity
              style={[styles.servingsBtn, isCustomSelected && styles.servingsBtnActive]}
              onPress={() => { setShowCustomInput(true); setCustomText(""); }}
            >
              <Text style={[styles.servingsBtnText, isCustomSelected && styles.servingsBtnTextActive]}>
                {isCustomSelected ? `${currentServings}인분` : "+"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 재료 목록 */}
      {groups.map(({ category, items }) => (
        <View key={category} style={styles.categoryBlock}>
          <Text style={styles.categoryLabel}>{category}</Text>
          {items.map((ing, idx) => (
            <View key={idx} style={styles.ingredientRow}>
              <Text style={styles.ingredientName}>{ing.name}</Text>
              <Text style={styles.ingredientAmount}>
                {scaleAmount(ing.amount, ratio)} {ing.unit}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
