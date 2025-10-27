import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lessonComponentsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const p = await params;
  const id = Number(p.id);
  await db
    .delete(lessonComponentsTable)
    .where(eq(lessonComponentsTable.id, id));
  return NextResponse.json({ ok: true });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const p = await params;
  const id = Number(p.id);
  const body = await req.json();
  const { configJson, type } = body;
  // Normalize incoming configJson (avoid double-serializing a stringified JSON)
  let cfg: string | null = null;
  if (configJson) {
    if (typeof configJson === "string") {
      try {
        const parsed = JSON.parse(configJson);
        cfg = JSON.stringify(parsed);
      } catch (e) {
        cfg = configJson;
      }
    } else {
      cfg = JSON.stringify(configJson);
    }
  }

  await db
    .update(lessonComponentsTable)
    .set({ configJson: cfg, type })
    .where(eq(lessonComponentsTable.id, id));
  return NextResponse.json({ ok: true });
}
