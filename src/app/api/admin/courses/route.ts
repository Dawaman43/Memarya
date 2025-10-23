import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coursesTable } from "@/db/schema";
import { desc } from "drizzle-orm";

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
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rows = await db
    .select()
    .from(coursesTable)
    .orderBy(desc(coursesTable.createdAt));
  return NextResponse.json({ courses: rows });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const { title, description, thumbnailUrl } = body ?? {};
    if (!title || typeof title !== "string")
      return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const [created] = await db
      .insert(coursesTable)
      .values({
        title,
        description: description ?? null,
        thumbnailUrl: thumbnailUrl ?? null,
      })
      .returning();

    return NextResponse.json({ course: created }, { status: 201 });
  } catch (e) {
    console.error("/api/admin/courses POST", e);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
