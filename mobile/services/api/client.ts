import { ENV } from "@/constants/env";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${ENV.API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "API 오류");
  }

  return data;
}