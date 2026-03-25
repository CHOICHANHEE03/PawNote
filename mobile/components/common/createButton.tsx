import { TouchableOpacity, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type Props = {
    onPress: () => void;
    icon?: keyof typeof MaterialIcons.glyphMap;
};

export default function CreateButton({ onPress, icon = "edit" }: Props) {
    return (
        <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
            <MaterialIcons name={icon} size={26} color="#fff" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#F5A54C",
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
});