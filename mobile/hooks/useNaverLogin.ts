import { useState, useRef } from "react";
import { Alert, AppState, AppStateStatus } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { ENV } from "../constants/env";
import { loginWithNaver } from "@/services/auth/authApi";
import { saveAccessToken } from "@/utils/storage";
import { useRouter } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

const APP_REDIRECT_URI = Linking.createURL("auth/naver/callback");

export function useNaverLogin() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const pendingRoute = useRef<string | null>(null);

    const navigateAfterForeground = (route: string) => {
        const current = AppState.currentState;

        if (current === "active") {
            // 이미 포그라운드 → 바로 이동
            router.replace(route as any);
        } else {
            // 아직 전환 중 → active 될 때까지 기다렸다가 이동
            pendingRoute.current = route;
            const sub = AppState.addEventListener(
                "change",
                (nextState: AppStateStatus) => {
                    if (nextState === "active" && pendingRoute.current) {
                        const target = pendingRoute.current;
                        pendingRoute.current = null;
                        sub.remove();
                        // 포그라운드 전환 직후 레이아웃이 그려질 시간을 확보
                        setTimeout(() => router.replace(target as any), 50);
                    }
                }
            );
        }
    };

    const onNaverLogin = async () => {
        try {
            setLoading(true);

            const startUrl = `${ENV.API_BASE_URL}/auth/naver/start`;
            console.log("ENV.API_BASE_URL =", ENV.API_BASE_URL);
            console.log("startUrl =", startUrl);

            const result = await WebBrowser.openAuthSessionAsync(
                startUrl,
                APP_REDIRECT_URI
            );

            console.log("naver auth result:", result);

            if (result.type !== "success") {
                Alert.alert("로그인 실패", "네이버 로그인이 취소되었거나 실패했습니다.");
                return;
            }

            const parsed = Linking.parse(result.url);
            const loginToken = parsed.queryParams?.loginToken;
            const error = parsed.queryParams?.error;

            console.log("naver callback url:", result.url);
            console.log("naver loginToken:", loginToken);

            if (typeof error === "string" && error) {
                Alert.alert("로그인 실패", error);
                return;
            }

            if (typeof loginToken !== "string" || !loginToken) {
                Alert.alert("로그인 실패", "네이버 로그인 토큰을 받지 못했습니다.");
                return;
            }

            const auth = await loginWithNaver({ loginToken });

            console.log("backend auth result:", auth);

            await saveAccessToken(auth.accessToken);

            navigateAfterForeground("/recipe");
        } catch (error) {
            console.error("네이버 로그인 오류:", error);
            Alert.alert("로그인 오류", "네이버 로그인 중 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        onNaverLogin,
    };
}