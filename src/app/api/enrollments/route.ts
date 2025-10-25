import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { enrollmentsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

async function getSessionUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const courseId = Number(body?.courseId);
    if (!Number.isInteger(courseId))
      return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });

    // prevent duplicate enrollment
    const existing = await db
      .select()
      .from(enrollmentsTable)
      .where(
        and(
          eq(enrollmentsTable.userId, user.id),
          eq(enrollmentsTable.courseId, courseId)
        )
      );
    if (existing.length) {
      return NextResponse.json({ enrollment: existing[0] });
    }

    const [created] = await db
      .insert(enrollmentsTable)
      .values({ userId: user.id, courseId })
      .returning();

    return NextResponse.json({ enrollment: created }, { status: 201 });
  } catch (e) {
    console.error("/api/enrollments POST", e);
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
  }
}
