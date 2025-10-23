import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { user as authUser } from "../../../../../auth-schema";

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

export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = (await req.json()) as { email?: string };
    const nextEmail = (email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Enforce uniqueness
    const exists = await db
      .select({ id: authUser.id })
      .from(authUser)
      .where(eq(authUser.email, nextEmail));
    if (exists.length && exists[0].id !== sessionUser.id) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const [updated] = await db
      .update(authUser)
      .set({ email: nextEmail, emailVerified: false })
      .where(eq(authUser.id, sessionUser.id))
      .returning();

    // TODO: Trigger a verification email via your provider

    return NextResponse.json({ user: updated });
  } catch (e) {
    console.error("/api/settings/email PATCH error", e);
    return NextResponse.json(
      { error: "Failed to update email" },
      { status: 500 }
    );
  }
}
