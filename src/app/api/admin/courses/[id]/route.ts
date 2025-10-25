import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  coursesTable,
  lessonsTable,
  quizzesTable,
  quizQuestionsTable,
  quizResultsTable,
  flashcardsTable,
  lessonComponentsTable,
  progressTable,
  enrollmentsTable,
  certificatesTable,
} from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import fs from "fs";
import path from "path";

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
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const p = await params;
  const id = Number(p.id);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, id));
  if (!course)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const lessons = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, id))
    .orderBy(lessonsTable.order);
  return NextResponse.json({ course, lessons });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const p = await params;
  const id = Number(p.id);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    const body = await req.json();
    const { title, description, thumbnailUrl, category } = body ?? {};
    const [updated] = await db
      .update(coursesTable)
      .set({
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(thumbnailUrl !== undefined ? { thumbnailUrl } : {}),
        ...(category !== undefined
          ? {
              category:
                typeof category === "string" && category.trim()
                  ? category.trim().slice(0, 64)
                  : "General",
            }
          : {}),
      })
      .where(eq(coursesTable.id, id))
      .returning();
    return NextResponse.json({ course: updated });
  } catch (e) {
    console.error("/api/admin/courses/[id] PUT", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const p = await params;
  const id = Number(p.id);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    // Fetch course to inspect thumbnail / related files
    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.id, id));

    // Delete dependent data in a safe order
    // quizzes -> quiz_questions, quiz_results
    const quizzes = await db
      .select()
      .from(quizzesTable)
      .where(eq(quizzesTable.courseId, id));
    const quizIds = quizzes.map((q: any) => q.id).filter(Boolean as any);
    if (quizIds.length) {
      await db
        .delete(quizQuestionsTable)
        .where(inArray(quizQuestionsTable.quizId, quizIds));
    }
    await db.delete(quizResultsTable).where(eq(quizResultsTable.courseId, id));
    await db.delete(quizzesTable).where(eq(quizzesTable.courseId, id));

    // flashcards
    await db.delete(flashcardsTable).where(eq(flashcardsTable.courseId, id));

    // lesson components attached to lessons
    const lessons = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, id));
    const lessonIds = lessons.map((l: any) => l.id).filter(Boolean as any);
    if (lessonIds.length) {
      await db
        .delete(lessonComponentsTable)
        .where(inArray(lessonComponentsTable.lessonId, lessonIds));
    }

    // progress entries referencing enrollments
    const enrollments = await db
      .select()
      .from(enrollmentsTable)
      .where(eq(enrollmentsTable.courseId, id));
    const enrollmentIds = enrollments
      .map((e: any) => e.id)
      .filter(Boolean as any);
    if (enrollmentIds.length) {
      await db
        .delete(progressTable)
        .where(inArray(progressTable.enrollmentId, enrollmentIds));
    }

    // delete lessons, enrollments, certificates
    await db.delete(lessonsTable).where(eq(lessonsTable.courseId, id));
    await db.delete(enrollmentsTable).where(eq(enrollmentsTable.courseId, id));
    await db
      .delete(certificatesTable)
      .where(eq(certificatesTable.courseId, id));

    // finally delete the course row
    await db.delete(coursesTable).where(eq(coursesTable.id, id));

    // Remove public thumbnail/file if present and points to /courses/
    try {
      const thumbUrl = course?.thumbnailUrl as string | undefined;
      if (thumbUrl && typeof thumbUrl === "string") {
        const rel = thumbUrl.replace(/^\//, "");
        const abs = path.join(process.cwd(), "public", rel);
        if (fs.existsSync(abs)) {
          fs.unlinkSync(abs);
          console.log("Removed public file:", abs);
        }
      }
    } catch (fileErr) {
      console.warn("Failed to remove public course file:", fileErr);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("/api/admin/courses/[id] DELETE", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
