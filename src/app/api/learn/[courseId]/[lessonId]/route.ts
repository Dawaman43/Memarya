import { NextResponse } from "next/server";
import { db } from "@/db";
import { coursesTable, lessonsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  // Next.js 16: params is a Promise; unwrap it before use
  const p = await params;
  // Be resilient to stray/invisible characters by using parseInt
  const courseId = Number.parseInt(p.courseId ?? "", 10);
  const lessonId = Number.parseInt(p.lessonId ?? "", 10);

  if (!Number.isFinite(courseId) || !Number.isFinite(lessonId)) {
    return NextResponse.json({ error: "Invalid lesson URL" }, { status: 400 });
  }

  try {
    const [courseResult, lessonResult] = await Promise.all([
      db.select().from(coursesTable).where(eq(coursesTable.id, courseId)),
      db.select().from(lessonsTable).where(eq(lessonsTable.id, lessonId)),
    ]);

    const course = courseResult[0];
    const lesson = lessonResult[0];

    if (!course || !lesson || lesson.courseId !== course.id) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json({ course, lesson });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: "Failed to load lesson" },
      { status: 500 }
    );
  }
}
