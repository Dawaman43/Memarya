import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

// Ensure a valid baseURL for the browser client. In dev, NEXT_PUBLIC_BASE_URL may be undefined.
// Fallback to relative '/api/auth' which works for same-origin apps.
const base = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
const baseURL = `${base}/api/auth` || "/api/auth";

export const authClient = createAuthClient({
  baseURL: base ? baseURL : "/api/auth",
  plugins: [adminClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
// admin APIs available via authClient.admin.* (createUser, setRole, listUsers, etc.)
