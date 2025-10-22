// lib/auth-client.ts
import { createAuthClient } from "better-auth/client";
import { useAtomValue } from "jotai";

export const authClient = createAuthClient({
  // Use a relative URL so it works both locally and in production without requiring an env var
  baseURL: "/api/auth",
});

// Re-export client helpers
export const { signIn, signOut, signUp } = authClient;

// Derive the value type from the Better Auth session atom
export type UseSessionResult = {
  data: {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } | null;
    session?: unknown;
  } | null;
  error: unknown | null;
  isPending: boolean;
};

// Provide a React hook wrapper around the Better Auth session atom
export function useSession(): UseSessionResult {
  // better-auth exposes a Jotai ReadableAtom; useAtomValue subscribes to it
  // and returns the current value { data, error, isPending }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useAtomValue(authClient.useSession as any) as UseSessionResult;
}
