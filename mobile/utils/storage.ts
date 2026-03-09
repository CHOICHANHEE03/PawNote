import * as SecureStore from "expo-secure-store";

export async function saveAccessToken(token: string) {
  await SecureStore.setItemAsync("accessToken", token);
}

export async function getAccessToken() {
  return SecureStore.getItemAsync("accessToken");
}

export async function removeAccessToken() {
  await SecureStore.deleteItemAsync("accessToken");
}