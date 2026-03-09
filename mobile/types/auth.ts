export type GoogleLoginRequest = {
    idToken: string;
  };
  
  export type AuthResponse = {
    accessToken: string;
    userId: number;
    email: string;
    name: string;
  };