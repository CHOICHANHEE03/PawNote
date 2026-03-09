import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image } from "react-native";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

export default function Login() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <View style={{ alignItems: "center", width: "100%", gap: 40 }}>
          <Image
            source={require("@/assets/images/login.png")}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />

          <GoogleLoginButton />
        </View>
      </View>
    </SafeAreaView>
  );
}