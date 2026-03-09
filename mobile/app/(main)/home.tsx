import { SafeAreaView, Text } from "react-native";

export default function Home() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>로그인 성공</Text>
    </SafeAreaView>
  );
}