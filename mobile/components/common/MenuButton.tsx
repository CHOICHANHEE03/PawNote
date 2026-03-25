import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";

interface Props {
  recipeId: number;
}

export default function MenuButton({ recipeId }: Props) {
  const [visible, setVisible] = useState(false);

  const handleEdit = () => {
    setVisible(false);
    router.push(`/recipe/edit/${recipeId}` as any);
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
          <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
            <MaterialIcons name="edit" size={18} color="#333" />
            <Text style={styles.menuText}>수정</Text>
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
  menuText: { fontSize: 15, color: "#1a1a1a", fontWeight: "500" },
});
