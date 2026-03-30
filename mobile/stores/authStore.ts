import { create } from "zustand";

type Provider = "google" | "kakao" | "naver";

type AuthState = {
    accessToken: string | null;
    name: string | null;
    email: string | null;
    provider: Provider | null;
    setAccessToken: (token: string | null) => void;
    setUser: (user: { name: string; email: string; provider: Provider }) => void;
    clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    name: null,
    email: null,
    provider: null,
    setAccessToken: (token) => set({ accessToken: token }),
    setUser: ({ name, email, provider }) => set({ name, email, provider }),
    clearAuth: () => set({ accessToken: null, name: null, email: null, provider: null }),
}));