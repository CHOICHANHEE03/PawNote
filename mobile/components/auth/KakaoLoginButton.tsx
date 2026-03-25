import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, Alert } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useKakaoLogin } from "@/hooks/auth/useKakaoLogin";

function KakaoLogo({ size = 22 }: { size?: number }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        fill="#3C1E1E"
        d="M12 3C6.477 3 2 6.477 2 10.8c0 2.736 1.635 5.14 4.09 6.57L5.1 21l4.57-2.99C10.37 18.12 11.17 18.2 12 18.2c5.523 0 10-3.477 10-7.8S17.523 3 12 3z"
      />
    </Svg>
  );
}

export default function KakaoLoginButton() {
  const { loading, signInWithKakao } = useKakaoLogin();

  const handlePress = async () => {
    try {
      const loginResult = await signInWithKakao();
      console.log("kakao login success:", loginResult);
    } catch (error) {
      console.error("kakao login error:", error);
      Alert.alert(
        "카카오 로그인 실패",
        error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
      );
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 52,
        borderRadius: 10,
        backgroundColor: "#FEE500",
        width: "100%",
        maxWidth: 340,
        paddingHorizontal: 20,
        opacity: loading ? 0.5 : 1,
        elevation: 2,
        shadowColor: "#FEE500",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      }}
    >
      <KakaoLogo size={22} />

      {loading ? (
        <ActivityIndicator size="small" color="#3C1E1E" style={{ marginLeft: 12 }} />
      ) : (
        <Text
          style={{
            marginLeft: 12,
            color: "#3C1E1E",
            fontSize: 16,
            fontWeight: "700",
            letterSpacing: 0.25,
          }}
        >
          카카오 계정 로그인
        </Text>
      )}
    </TouchableOpacity>
  );
}