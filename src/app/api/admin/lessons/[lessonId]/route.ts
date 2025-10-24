import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lessonsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const p = await params;
  const id = Number(p.lessonId);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const body = await req.json();
  const { title, content, videoUrl, order, duration } = body ?? {};
  const [updated] = await db
    .update(lessonsTable)
    .set({ title, content, videoUrl, order, duration })
    .where(eq(lessonsTable.id, id))
    .returning();
  return NextResponse.json({ lesson: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const p = await params;
  const id = Number(p.lessonId);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await db.delete(lessonsTable).where(eq(lessonsTable.id, id));
  return NextResponse.json({ ok: true });
}
