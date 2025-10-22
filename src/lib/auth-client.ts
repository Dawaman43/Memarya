import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL + "/api/auth",
});

export const { signIn, signOut, signUp, useSession } = authClient;
