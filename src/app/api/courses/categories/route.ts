import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coursesTable } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  // Distinct categories ordered by count desc then name
  const rows = await db.execute(
    sql`SELECT "category", COUNT(*) as count FROM "courses" GROUP BY "category" ORDER BY count DESC, "category" ASC`
  );
  const categories =
    rows.rows?.map((r: any) => ({
      category: r.category,
      count: Number(r.count),
    })) ?? [];
  return NextResponse.json({ categories });
}
