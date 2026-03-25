import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useDeleteRecipe } from "@/hooks/recipe/useDeleteRecipe";

interface Props {
  recipeId: number;
  showEdit?: boolean;
}

export default function MenuButton({ recipeId, showEdit = true }: Props) {
  const [visible, setVisible] = useState(false);
  const deleteMutation = useDeleteRecipe();

  const handleEdit = () => {
    setVisible(false);
    router.push(`/recipe/edit/${recipeId}` as any);
  };

  const handleDelete = () => {
    setVisible(false);
    Alert.alert(
      "레시피 삭제",
      "정말로 이 레시피를 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(recipeId);
              router.replace("/(tabs)/recipe");
            } catch (err) {
              Alert.alert("삭제 실패", "레시피 삭제에 실패했습니다.");
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity style={styles.btn} onPress={() => setVisible(true)}>
        <MaterialIcons name="more-vert" size={24} color="#1a1a1a" />
      </TouchableOpacity>

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <View style={styles.menu}>
          {showEdit && (
            <>
              <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                <MaterialIcons name="edit" size={18} color="#333" />
                <Text style={styles.menuText}>수정</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
            </>
          )}

          <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
            <MaterialIcons name="delete-outline" size={18} color="#333" />
            <Text style={styles.menuText}>삭제</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 10 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  menu: {
    position: "absolute",
    top: 52,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 120,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 12,
  },
  menuText: { fontSize: 15, color: "#1a1a1a", fontWeight: "500" },
});
