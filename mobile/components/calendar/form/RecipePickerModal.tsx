import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRecipeList } from "@/hooks/recipe/useRecipeList";
import { ORANGE, SelectedRecipe } from "./form.types";
import { rpStyles } from "./form.styles";

interface RecipePickerModalProps {
  visible: boolean;
  selectedIds: number[];
  onSelect: (r: SelectedRecipe) => void;
  onClose: () => void;
}

export default function RecipePickerModal({
  visible, selectedIds, onSelect, onClose,
}: RecipePickerModalProps) {
  const insets = useSafeAreaInsets();
  const { data: recipes, isLoading } = useRecipeList();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[rpStyles.container, { paddingTop: insets.top }]}>
        <View style={rpStyles.header}>
          <TouchableOpacity onPress={onClose} style={rpStyles.closeBtn}>
            <MaterialIcons name="close" size={22} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={rpStyles.headerTitle}>레시피 선택</Text>
          <View style={rpStyles.closeBtn} />
        </View>

        {isLoading ? (
          <View style={rpStyles.center}>
            <ActivityIndicator size="large" color={ORANGE} />
          </View>
        ) : !recipes?.length ? (
          <View style={rpStyles.center}>
            <MaterialIcons name="menu-book" size={48} color="#ddd" />
            <Text style={rpStyles.emptyText}>저장된 레시피가 없어요</Text>
          </View>
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingVertical: 8 }}
            ItemSeparatorComponent={() => (
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#e0dcd6", marginLeft: 20 }} />
            )}
            renderItem={({ item }) => {
              const selected = selectedIds.includes(item.id);
              return (
                <TouchableOpacity
                  style={rpStyles.recipeRow}
                  onPress={() => { onSelect({ id: item.id, title: item.title, subtitle: item.subtitle }); onClose(); }}
                  disabled={selected}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={[rpStyles.recipeTitle, selected && { color: "#bbb" }]}>{item.title}</Text>
                    {!!item.subtitle && (
                      <Text style={rpStyles.recipeSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                    )}
                  </View>
                  {selected
                    ? <MaterialIcons name="check" size={20} color={ORANGE} />
                    : <MaterialIcons name="chevron-right" size={22} color="#ccc" />
                  }
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}
