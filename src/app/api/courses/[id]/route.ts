import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coursesTable, lessonsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
