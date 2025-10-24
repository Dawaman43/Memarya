import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coursesTable } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  let rows;
  if (category && category !== "all") {
    const { eq } = await import("drizzle-orm");
    rows = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.category, category))
      .orderBy(desc(coursesTable.createdAt));
  } else {
    rows = await db
      .select()
      .from(coursesTable)
      .orderBy(desc(coursesTable.createdAt));
  }
  return NextResponse.json({ courses: rows });
}
