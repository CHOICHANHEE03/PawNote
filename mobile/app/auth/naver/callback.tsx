import { ActivityIndicator, View } from "react-native";

export default function NaverCallbackPage() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
      }
      }
    >
      <ActivityIndicator size="large" />
    </View>
  );
}