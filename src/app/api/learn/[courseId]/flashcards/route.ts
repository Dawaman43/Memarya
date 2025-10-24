import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { flashcardsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const p = await params;
  const courseId = Number.parseInt(p.courseId ?? "", 10);
  if (!Number.isFinite(courseId)) {
    return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
  }

  const flashcards = await db
    .select()
    .from(flashcardsTable)
    .where(eq(flashcardsTable.courseId, courseId));

  return NextResponse.json({ courseId, flashcards });
}
