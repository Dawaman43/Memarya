import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lessonComponentsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const p = await params;
  const lessonId = Number(p.lessonId);
  const body = await req.json();
  const { type, configJson } = body;
  if (!type)
    return NextResponse.json({ error: "Missing type" }, { status: 400 });
  // Normalize configJson: if it's an object, stringify it; if it's a string, try to parse and re-stringify
  let cfg: string | null = null;
  if (configJson) {
    if (typeof configJson === "string") {
      try {
        const parsed = JSON.parse(configJson);
        cfg = JSON.stringify(parsed);
      } catch (e) {
        // it's a plain string, store as-is
        cfg = configJson;
      }
    } else {
      cfg = JSON.stringify(configJson);
    }
  }

  const result = await db
    .insert(lessonComponentsTable)
    .values({
      lessonId,
      type,
      configJson: cfg,
    })
    .returning({ id: lessonComponentsTable.id });
  return NextResponse.json({ id: result[0].id });
}

export async function PATCH(req: NextRequest) {
  // Used for bulk reorder: { ids: [id...] }
  const body = await req.json();
  const ids: number[] = body.ids || [];
  if (!Array.isArray(ids))
    return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    await db
      .update(lessonComponentsTable)
      .set({ order: i + 1 })
      .where(eq(lessonComponentsTable.id, id));
  }
  return NextResponse.json({ ok: true });
}
