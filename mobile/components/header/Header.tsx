import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSegments } from "expo-router";

export default function Header() {
    const segments = useSegments();

    type TabKey = "recipe" | "shopping" | "calendar" | "mypage";

    const current = segments[1] as TabKey;


    const titles = {
        recipe: "레시피",
        shopping: "장보기",
        calendar: "캘린더",
        mypage: "마이페이지",
    };

    const title = titles[current] || "레시피";

    return (
        <SafeAreaView edges={["top"]} style={{ backgroundColor: "#fff" }}>
            <View
                style={{
                    height: 64,
                    paddingHorizontal: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontSize: 22, fontWeight: "700" }}>{title}</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}