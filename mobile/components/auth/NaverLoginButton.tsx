import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useNaverLogin } from "@/hooks/useNaverLogin";

function NaverLogo({ size = 22 }: { size?: number }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      {/* 네이버 'N' 로고 */}
      <Path
        fill="#FFFFFF"
        d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"
      />
    </Svg>
  );
}

export default function NaverLoginButton() {
  const { loading, onNaverLogin } = useNaverLogin();

  return (
    <TouchableOpacity
      onPress={onNaverLogin}
      disabled={loading}
      activeOpacity={0.8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 52,
        borderRadius: 10,
        backgroundColor: "#03C75A",
        width: "100%",
        maxWidth: 340,
        paddingHorizontal: 20,
        opacity: loading ? 0.5 : 1,
        elevation: 2,
        shadowColor: "#03C75A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      }}
    >
      {/* 네이버 N 로고 */}
      <NaverLogo size={22} />

      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" style={{ marginLeft: 12 }} />
      ) : (
        <Text
          style={{
            marginLeft: 12,
            color: "#ffffff",
            fontSize: 16,
            fontWeight: "700",
            letterSpacing: 0.25,
          }}
        >
          네이버 계정 로그인
        </Text>
      )}
    </TouchableOpacity>
  );
}
