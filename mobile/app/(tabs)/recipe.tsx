import { View, Text } from "react-native";
import CreateButton from "@/components/common/createButton";
import { useRouter } from "expo-router";

export default function RecipeScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>레시피 화면</Text>
      <CreateButton onPress={() => router.push("/recipe/create")} />
    </View>
  );
}