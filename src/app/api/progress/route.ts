import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  enrollmentsTable,
  lessonsTable,
  progressTable,
  certificatesTable,
  quizResultsTable,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

async function getSessionUser(req: NextRequest) {
  const url = new URL("/api/auth/get-session", req.url);
  const res = await fetch(url, {
    headers: { cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  try {
    const data = await res.json();
    return data?.user ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { lessonId, completed } = body ?? {};
  const lid = Number(lessonId);
  if (!Number.isInteger(lid))
    return NextResponse.json({ error: "Invalid lessonId" }, { status: 400 });

  // find courseId from lesson
  const [lesson] = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.id, lid));
  if (!lesson)
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  // If lesson has quiz and user is trying to complete it, check quiz results
  if (lesson.hasQuiz && completed) {
    const [quizResult] = await db
      .select()
      .from(quizResultsTable)
      .where(
        and(
          eq(quizResultsTable.userId, user.id),
          eq(quizResultsTable.courseId, lesson.courseId),
          eq(quizResultsTable.passed, true)
        )
      );
    if (!quizResult) {
      return NextResponse.json(
        {
          error: "Quiz must be passed to complete this lesson",
          requiresQuiz: true,
          quizPassingScore: lesson.quizPassingScore,
        },
        { status: 400 }
      );
    }
  }

  // enrollment for user/course
  const [enrollment] = await db
    .select()
    .from(enrollmentsTable)
    .where(
      and(
        eq(enrollmentsTable.userId, user.id),
        eq(enrollmentsTable.courseId, lesson.courseId)
      )
    );
  if (!enrollment)
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });

  // upsert progress row
  const existing = await db
    .select()
    .from(progressTable)
    .where(
      and(
        eq(progressTable.enrollmentId, enrollment.id),
        eq(progressTable.lessonId, lid)
      )
    );
  if (existing.length) {
    await db
      .update(progressTable)
      .set({ completed: completed ? 1 : 0, updatedAt: sql`now()` })
      .where(eq(progressTable.id, existing[0].id));
  } else {
    await db.insert(progressTable).values({
      enrollmentId: enrollment.id,
      lessonId: lid,
      completed: completed ? 1 : 0,
    });
  }

  // recompute overall progress and issue certificate if complete
  const totalLessons = await db
    .select({ count: sql<number>`count(*)` })
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, lesson.courseId));
  const completedLessons = await db
    .select({ count: sql<number>`count(*)` })
    .from(progressTable)
    .where(
      and(
        eq(progressTable.enrollmentId, enrollment.id),
        eq(progressTable.completed, 1)
      )
    );
  const total = Number(totalLessons[0]?.count || 0);
  const done = Number(completedLessons[0]?.count || 0);
  const percent = total > 0 ? Math.floor((done / total) * 100) : 0;
  await db
    .update(enrollmentsTable)
    .set({ progress: percent })
    .where(eq(enrollmentsTable.id, enrollment.id));

  let certificateUrl: string | null = null;
  if (total > 0 && done >= total) {
    // issue a simple certificate record; in production, generate a PDF and store URL
    const [cert] = await db
      .insert(certificatesTable)
      .values({
        userId: user.id,
        courseId: lesson.courseId,
        certificateUrl: null,
      })
      .onConflictDoNothing()
      .returning();
    if (cert) certificateUrl = cert.certificateUrl ?? null;
  }

  return NextResponse.json({
    progress: percent,
    completed: !!completed,
    certificateUrl,
  });
}
