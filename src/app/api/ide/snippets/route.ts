import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snippetsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

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

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select()
    .from(snippetsTable)
    .where(eq(snippetsTable.userId, user.id));
  return NextResponse.json({ snippets: rows });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { title, language, version, files, isPublic } = body ?? {};
  if (!language || !Array.isArray(files))
    return NextResponse.json(
      { error: "language and files[] required" },
      { status: 400 }
    );
  const shareId = isPublic ? Math.random().toString(36).slice(2, 10) : null;
  const [created] = await db
    .insert(snippetsTable)
    .values({
      userId: user.id,
      title: title ?? null,
      language,
      version: version ?? null,
      files: JSON.stringify(files),
      isPublic: !!isPublic,
      shareId,
    })
    .returning();
  return NextResponse.json({ snippet: created }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, title, language, version, files, isPublic } = body ?? {};
  const [updated] = await db
    .update(snippetsTable)
    .set({
      title,
      language,
      version,
      files: files ? JSON.stringify(files) : undefined,
      isPublic,
    })
    .where(
      and(eq(snippetsTable.id, Number(id)), eq(snippetsTable.userId, user.id))
    )
    .returning();
  return NextResponse.json({ snippet: updated });
}
