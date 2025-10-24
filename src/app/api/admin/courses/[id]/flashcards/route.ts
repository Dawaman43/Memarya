import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { flashcardsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const p = await params;
  const courseId = Number.parseInt(p.id ?? "", 10);
  if (!Number.isFinite(courseId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const rows = await db
    .select()
    .from(flashcardsTable)
    .where(eq(flashcardsTable.courseId, courseId));
  return NextResponse.json({ flashcards: rows });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const p = await params;
  const courseId = Number.parseInt(p.id ?? "", 10);
  if (!Number.isFinite(courseId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const body = await req.json();
  const cards = Array.isArray(body) ? body : [body];
  if (!cards.length)
    return NextResponse.json({ error: "No flashcards" }, { status: 400 });
  const values = cards.map((c: any) => ({
    courseId,
    front: String(c.front || ""),
    back: String(c.back || ""),
  }));
  await db.insert(flashcardsTable).values(values);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const p = await params;
  const courseId = Number.parseInt(p.id ?? "", 10);
  if (!Number.isFinite(courseId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const { id } = await req.json();
  if (!id)
    return NextResponse.json(
      { error: "Missing flashcard id" },
      { status: 400 }
    );
  await db
    .delete(flashcardsTable)
    .where(
      and(
        eq(flashcardsTable.courseId, courseId),
        eq(flashcardsTable.id, Number(id))
      )
    );
  return NextResponse.json({ ok: true });
}
