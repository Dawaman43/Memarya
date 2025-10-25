import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lessonComponentsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  const p = await params;
  const lessonId = Number(p.lessonId);
  const rows = await db
    .select()
    .from(lessonComponentsTable)
    .where(eq(lessonComponentsTable.lessonId, lessonId))
    .orderBy(lessonComponentsTable.order || undefined);
  return NextResponse.json({ components: rows });
}
