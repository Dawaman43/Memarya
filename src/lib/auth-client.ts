// lib/auth-client.ts
import { createAuthClient } from "better-auth/client";
import { useAtomValue } from "jotai";

// Compute an absolute base URL for Better Auth (required)
function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // Fallback for SSR/bundling context
  const env =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BETTER_AUTH_URL;
  if (env) return env.replace(/\/$/, "");
  // Sensible default for local dev
  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: `${getBaseUrl()}/api/auth`,
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
