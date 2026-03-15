import { useState, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { loginWithKakao } from "@/services/auth/authApi";
import type { AuthResponse } from "@/types/auth";
import { saveAccessToken } from "@/utils/storage";
import { useRouter } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export function useKakaoLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pendingRoute = useRef<string | null>(null);

  const navigateAfterForeground = (route: string) => {
    const current = AppState.currentState;

    if (current === "active") {
      router.replace(route as any);
    } else {
      pendingRoute.current = route;
      const sub = AppState.addEventListener(
        "change",
        (nextState: AppStateStatus) => {
          if (nextState === "active" && pendingRoute.current) {
            const target = pendingRoute.current;
            pendingRoute.current = null;
            sub.remove();
            setTimeout(() => router.replace(target as any), 50);
          }
        }
      );
    }
  };

  const signInWithKakao = async (): Promise<AuthResponse | undefined> => {
    setLoading(true);

    try {
      const clientId = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;
      const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

      if (!clientId) {
        throw new Error("카카오 REST API 키가 없습니다.");
      }

      if (!apiBaseUrl) {
        throw new Error("백엔드 API 주소가 없습니다.");
      }

      // 앱 복귀용
      const appRedirectUri = Linking.createURL("auth/kakao/callback");

      // 카카오가 실제로 돌아갈 백엔드 callback 주소
      const kakaoRedirectUri = `${apiBaseUrl}/auth/kakao/callback`;

      const authUrl =
        `https://kauth.kakao.com/oauth/authorize` +
        `?client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(kakaoRedirectUri)}` +
        `&response_type=code`;

      console.log("appRedirectUri =", appRedirectUri);
      console.log("kakaoRedirectUri =", kakaoRedirectUri);
      console.log("authUrl =", authUrl);

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        appRedirectUri
      );

      if (result.type !== "success" || !result.url) {
        throw new Error("카카오 로그인 취소 또는 실패");
      }

      const parsed = Linking.parse(result.url);

      const loginToken =
        typeof parsed.queryParams?.loginToken === "string"
          ? parsed.queryParams.loginToken
          : null;

      if (!loginToken) {
        throw new Error("loginToken을 받지 못했습니다.");
      }

      const response = await loginWithKakao({ loginToken });

      // 토큰 저장 및 메인화면으로 이동
      await saveAccessToken(response.accessToken);
      navigateAfterForeground("/home");

      return response;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    signInWithKakao,
  };
}