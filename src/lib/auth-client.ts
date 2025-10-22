// lib/auth-client.ts
import { createAuthClient } from "better-auth/client";
import { useAtomValue, type Atom } from "jotai";

export const authClient = createAuthClient({
  // Use a relative URL so it works both locally and in production without requiring an env var
  baseURL: "/api/auth",
});

// Re-export client helpers
export const { signIn, signOut, signUp } = authClient;

// Wrap the Better Auth session atom in a React hook for convenient usage
const sessionAtom = authClient.useSession;
export function useSession(): UseSessionResult {
  // better-auth exposes a Jotai ReadableAtom; useAtomValue subscribes to it
  // and returns the current value { data, error, isPending }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useAtomValue(sessionAtom as any) as UseSessionResult;
}

// If you need the return type of the hook elsewhere, you can import this type
type AtomValue<T> = T extends Atom<infer V> ? V : never;
export type UseSessionResult = AtomValue<typeof sessionAtom>;
