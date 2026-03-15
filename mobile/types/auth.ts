export type GoogleLoginRequest = {
  idToken: string;
};

export type NaverLoginRequest = {
  loginToken: string;
};

export type KakaoLoginRequest = {
  loginToken: string;
};

export type AuthResponse = {
  accessToken: string;
  userId: number;
  email: string;
  name: string;
};