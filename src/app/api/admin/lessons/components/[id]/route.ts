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
  await db
    .update(lessonComponentsTable)
    .set({ configJson: configJson ? JSON.stringify(configJson) : null, type })
    .where(eq(lessonComponentsTable.id, id));
  return NextResponse.json({ ok: true });
}
