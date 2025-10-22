import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: "/api/auth",
});

export const { signIn, signOut, signUp, useSession } = authClient;
