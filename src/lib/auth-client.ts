// lib/auth-client.ts
import { useAtomValue } from "jotai";
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL + "/api/auth",
});

// Export methods and the underlying session atom
export const { signIn, signOut, signUp, useSession: sessionAtom } = authClient;

// Minimal shape used by the app
export type SessionUser = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
};

export type SessionInfo = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type UseSessionResult = {
  data: { user: SessionUser; session: SessionInfo } | null;
  error: unknown | null;
  isPending: boolean;
};

// React hook wrapper around the Better Auth session atom
// Casting bridges a minor type mismatch between Better Auth's ReadableAtom and Jotai's Atom types.
export function useSession(): UseSessionResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useAtomValue(sessionAtom as any) as UseSessionResult;
}
