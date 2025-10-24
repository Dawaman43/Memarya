import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snippetsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const p = await params;
  const [row] = await db
    .select()
    .from(snippetsTable)
    .where(
      and(
        eq(snippetsTable.shareId, p.shareId),
        eq(snippetsTable.isPublic, true)
      )
    );
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ snippet: row });
}
