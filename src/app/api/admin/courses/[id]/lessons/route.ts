import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lessonsTable } from "@/db/schema";
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const p = await params;
  const courseId = Number(p.id);
  const rows = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, courseId))
    .orderBy(lessonsTable.order);
  return NextResponse.json({ lessons: rows });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const p = await params;
  const courseId = Number(p.id);
  const body = await req.json();
  const {
    title,
    content = "",
    videoUrl = null,
    order = null,
    duration = null,
  } = body ?? {};
  if (!title)
    return NextResponse.json({ error: "title required" }, { status: 400 });
  const [created] = await db
    .insert(lessonsTable)
    .values({ courseId, title, content, videoUrl, order, duration })
    .returning();
  return NextResponse.json({ lesson: created }, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // Reorder: expects { ids: number[] } representing desired order
  const body = await req.json();
  const ids: number[] = Array.isArray(body?.ids) ? body.ids : [];
  let order = 1;
  for (const id of ids) {
    await db.update(lessonsTable).set({ order }).where(eq(lessonsTable.id, id));
    order += 1;
  }
  return NextResponse.json({ ok: true });
}
