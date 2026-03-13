import { apiFetch } from "../api/client";
import type { GoogleLoginRequest, NaverLoginRequest, AuthResponse } from "../../types/auth";

export async function loginWithGoogle(
  request: GoogleLoginRequest
): Promise<AuthResponse> {
  return apiFetch("/auth/google", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function loginWithNaver(
  request: NaverLoginRequest
): Promise<AuthResponse> {
  return apiFetch("/auth/naver/exchange", {
    method: "POST",
    body: JSON.stringify(request),
  });
}