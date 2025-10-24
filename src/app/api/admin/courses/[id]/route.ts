import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coursesTable, lessonsTable } from "@/db/schema";
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
  const id = Number(p.id);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, id));
  if (!course)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const lessons = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, id))
    .orderBy(lessonsTable.order);
  return NextResponse.json({ course, lessons });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const p = await params;
  const id = Number(p.id);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    const body = await req.json();
    const { title, description, thumbnailUrl, category } = body ?? {};
    const [updated] = await db
      .update(coursesTable)
      .set({
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(thumbnailUrl !== undefined ? { thumbnailUrl } : {}),
        ...(category !== undefined
          ? {
              category:
                typeof category === "string" && category.trim()
                  ? category.trim().slice(0, 64)
                  : "General",
            }
          : {}),
      })
      .where(eq(coursesTable.id, id))
      .returning();
    return NextResponse.json({ course: updated });
  } catch (e) {
    console.error("/api/admin/courses/[id] PUT", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const p = await params;
  const id = Number(p.id);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    await db.delete(lessonsTable).where(eq(lessonsTable.courseId, id));
    await db.delete(coursesTable).where(eq(coursesTable.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("/api/admin/courses/[id] DELETE", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
