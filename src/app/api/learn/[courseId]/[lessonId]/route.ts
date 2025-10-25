import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  coursesTable,
  lessonsTable,
  progressTable,
  enrollmentsTable,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Next.js 16: params is a Promise; unwrap it before use
  const p = await params;
  // Be resilient to stray/invisible characters by using parseInt
  const courseId = Number.parseInt(p.courseId ?? "", 10);
  const lessonId = Number.parseInt(p.lessonId ?? "", 10);

  if (!Number.isFinite(courseId) || !Number.isFinite(lessonId)) {
    return NextResponse.json({ error: "Invalid lesson URL" }, { status: 400 });
  }

  try {
    // Get enrollment for this user and course
    const [enrollment] = await db
      .select()
      .from(enrollmentsTable)
      .where(
        and(
          eq(enrollmentsTable.userId, user.id),
          eq(enrollmentsTable.courseId, courseId)
        )
      );

    const [courseResult] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.id, courseId));

    const [lessonResult] = await db
      .select({
        id: lessonsTable.id,
        courseId: lessonsTable.courseId,
        title: lessonsTable.title,
        content: lessonsTable.content,
        videoUrl: lessonsTable.videoUrl,
        duration: lessonsTable.duration,
        hasQuiz: lessonsTable.hasQuiz,
        quizPassingScore: lessonsTable.quizPassingScore,
        createdAt: lessonsTable.createdAt,
        order: lessonsTable.order,
      })
      .from(lessonsTable)
      .where(eq(lessonsTable.id, lessonId));

    // Get completion status separately
    const [progressResult] = enrollment
      ? await db
          .select({ completed: progressTable.completed })
          .from(progressTable)
          .where(
            and(
              eq(progressTable.enrollmentId, enrollment.id),
              eq(progressTable.lessonId, lessonId)
            )
          )
      : [];

    // Get all lessons
    const lessonsResult = await db
      .select({
        id: lessonsTable.id,
        courseId: lessonsTable.courseId,
        title: lessonsTable.title,
        content: lessonsTable.content,
        videoUrl: lessonsTable.videoUrl,
        duration: lessonsTable.duration,
        hasQuiz: lessonsTable.hasQuiz,
        quizPassingScore: lessonsTable.quizPassingScore,
        createdAt: lessonsTable.createdAt,
        order: lessonsTable.order,
      })
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, courseId))
      .orderBy(lessonsTable.order);

    // Get completion status for all lessons
    const progressResults = enrollment
      ? await db
          .select({
            lessonId: progressTable.lessonId,
            completed: progressTable.completed,
          })
          .from(progressTable)
          .where(eq(progressTable.enrollmentId, enrollment.id))
      : [];

    // Create a map of lessonId to completion status
    const progressMap = new Map(
      progressResults.map((p) => [p.lessonId, p.completed === 1])
    );

    const course = courseResult;
    const lesson = lessonResult
      ? {
          ...lessonResult,
          completed: progressResult ? progressResult.completed === 1 : false,
        }
      : null;
    const lessons = lessonsResult.map((l) => ({
      ...l,
      completed: progressMap.get(l.id) || false,
    }));

    if (!course || !lesson || lesson.courseId !== course.id) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json({ course, lesson, lessons });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: "Failed to load lesson" },
      { status: 500 }
    );
  }
}
