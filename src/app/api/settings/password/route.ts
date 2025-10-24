import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { account, user as authUser } from "../../../../../auth-schema";
import { and, eq } from "drizzle-orm";
import { verify as argon2Verify, hash as argon2Hash } from "@node-rs/argon2";

async function getSessionUser(req: NextRequest) {
  const url = new URL("/api/auth/get-session", req.url);
  const res = await fetch(url, {
    headers: { cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  try {
    const data = await res.json();
    return data?.user ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const oldPassword: string = body?.oldPassword || "";
  const newPassword: string = body?.newPassword || "";
  if (newPassword.length < 8)
    return NextResponse.json({ error: "Password too short" }, { status: 400 });

  // Better Auth stores email/password in account table when using email+password mode
  const [acc] = await db
    .select()
    .from(account)
    .where(
      and(eq(account.userId, user.id), eq(account.providerId, "credential"))
    );
  if (!acc || !acc.password)
    return NextResponse.json(
      { error: "No password set for this account" },
      { status: 400 }
    );

  const ok = await argon2Verify(acc.password, oldPassword);
  if (!ok)
    return NextResponse.json(
      { error: "Current password incorrect" },
      { status: 400 }
    );

  const hash = await argon2Hash(newPassword);
  await db
    .update(account)
    .set({ password: hash })
    .where(eq(account.id, acc.id));
  return NextResponse.json({ ok: true });
}
