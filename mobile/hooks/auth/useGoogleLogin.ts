import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { ENV } from "../../constants/env";
import { loginWithGoogle } from "@/services/auth/authApi";
import { saveAccessToken } from "@/utils/storage";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/authStore";

export function useGoogleLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  const onGoogleLogin = async () => {
    try {
      setLoading(true);

      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      console.log("google userInfo:", userInfo);
      console.log("google idToken:", idToken);

      if (!idToken) {
        Alert.alert("로그인 실패", "Google ID 토큰을 받지 못했습니다.");
        return;
      }

      const auth = await loginWithGoogle({ idToken });

      console.log("backend auth result:", auth);
      console.log("받은 accessToken:", auth.accessToken);

      await saveAccessToken(auth.accessToken);

      setAccessToken(auth.accessToken);

      router.replace("/recipe");
    } catch (error) {
      console.error("구글 로그인 오류:", error);
      Alert.alert("로그인 오류", "구글 로그인 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    onGoogleLogin,
  };
}