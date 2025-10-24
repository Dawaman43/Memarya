// /src/app/api/admin/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";
import { db } from "@/db";
import * as auth from "@/auth-schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { hash as argon2Hash } from "@node-rs/argon2";

// Input validation
const bodySchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    inviteCode: z.string().min(1),
  })
  .strict();

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { name, email, password, inviteCode } = bodySchema.parse(json);

    // Check invite code
    const expected = process.env.ADMIN_INVITE_CODE;
    if (!expected) {
      return NextResponse.json(
        { error: "Server misconfigured: ADMIN_INVITE_CODE not set" },
        { status: 500 }
      );
    }
    if (inviteCode !== expected) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 401 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1️⃣ Create user via BetterAuth
    const { data, error } = await authClient.signUp.email({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data || !data.user) throw new Error("Unknown signup error");

    const userId = data.user.id;

    // 2️⃣ Promote user to admin
    await db
      .update(auth.user)
      .set({ role: "admin" })
      .where(eq(auth.user.id, userId));

    // Do NOT override the password stored by Better Auth; it already hashed and created the credential account.
    return NextResponse.json({ ok: true, userId });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    console.error("/api/admin/register error", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
