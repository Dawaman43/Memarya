// lib/auth-client.ts
import { createAuthClient } from "better-auth/client";
import { useAtomValue } from "jotai";

export const authClient = createAuthClient({
  // Use a relative URL so it works both locally and in production without requiring an env var
  baseURL: "/api/auth",
});

// Re-export client helpers
export const { signIn, signOut, signUp } = authClient;

// Provide a React hook wrapper around the Better Auth session atom
export function useSession() {
  // better-auth exposes a Jotai ReadableAtom; useAtomValue subscribes to it
  // and returns the current value { data, error, isPending }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useAtomValue(authClient.useSession as any);
}

// If you need the return type of the hook elsewhere, you can import this type
export type UseSessionResult = ReturnType<typeof useSession>;
