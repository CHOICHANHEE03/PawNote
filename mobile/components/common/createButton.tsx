import { TouchableOpacity, Text, StyleSheet } from "react-native";

type Props = {
    onPress: () => void;
    icon?: string; // 기본 "+"
};

export default function CreateButton({ onPress, icon = "+" }: Props) {
    return (
        <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
            <Text style={styles.fabText}>{icon}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        right: 20,
        bottom: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#ff8a3d",
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    fabText: {
        color: "#fff",
        fontSize: 32,
        fontWeight: "700",
        lineHeight: 34,
    },
});