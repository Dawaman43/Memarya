import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coursesTable, lessonsTable, enrollmentsTable } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");

  let courseRows;
  if (category && category !== "all") {
    courseRows = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.category, category))
      .orderBy(desc(coursesTable.createdAt));
  } else {
    courseRows = await db
      .select()
      .from(coursesTable)
      .orderBy(desc(coursesTable.createdAt));
  }

  // Aggregate lesson durations per course
  const durations = await db
    .select({
      courseId: lessonsTable.courseId,
      total: sql<number>`COALESCE(SUM(${lessonsTable.duration}), 0)`,
    })
    .from(lessonsTable)
    .groupBy(lessonsTable.courseId);

  // Aggregate enrollment counts per course
  const students = await db
    .select({
      courseId: enrollmentsTable.courseId,
      count: sql<number>`COUNT(*)`,
    })
    .from(enrollmentsTable)
    .groupBy(enrollmentsTable.courseId);

  const durationMap = new Map<number, number>();
  durations.forEach((d: any) =>
    durationMap.set(Number(d.courseId), Number(d.total || 0))
  );

  const studentMap = new Map<number, number>();
  students.forEach((s: any) =>
    studentMap.set(Number(s.courseId), Number(s.count || 0))
  );

  // Attach aggregates to course rows
  const coursesWithMeta = courseRows.map((r: any) => ({
    ...r,
    durationMinutes: durationMap.get(Number(r.id)) ?? 0,
    studentCount: studentMap.get(Number(r.id)) ?? 0,
  }));

  return NextResponse.json({ courses: coursesWithMeta });
}
