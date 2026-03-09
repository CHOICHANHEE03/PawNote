import { apiFetch } from "../api/client";
import type { GoogleLoginRequest, AuthResponse } from "../../types/auth";

export async function loginWithGoogle(
  request: GoogleLoginRequest
): Promise<AuthResponse> {
  return apiFetch("/auth/google", {
    method: "POST",
    body: JSON.stringify(request),
  });
}