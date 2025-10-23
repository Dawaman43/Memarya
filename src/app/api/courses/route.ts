import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coursesTable } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  const rows = await db
    .select()
    .from(coursesTable)
    .orderBy(desc(coursesTable.createdAt));
  return NextResponse.json({ courses: rows });
}
