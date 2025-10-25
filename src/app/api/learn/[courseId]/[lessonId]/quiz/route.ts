import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  lessonsTable,
  lessonComponentsTable,
  quizQuestionsTable,
  quizzesTable,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  const p = await params;
  const courseId = Number.parseInt(p.courseId ?? "", 10);
  const lessonId = Number.parseInt(p.lessonId ?? "", 10);
  if (!Number.isFinite(courseId) || !Number.isFinite(lessonId)) {
    return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
  }

  // verify lesson exists and belongs to course
  const [lesson] = await db
    .select()
    .from(lessonsTable)
    .where(
      and(eq(lessonsTable.id, lessonId), eq(lessonsTable.courseId, courseId))
    );
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // find quiz component attached to this lesson
  const [comp] = await db
    .select()
    .from(lessonComponentsTable)
    .where(
      and(
        eq(lessonComponentsTable.lessonId, lessonId),
        eq(lessonComponentsTable.type, "quiz")
      )
    );
  if (!comp) {
    return NextResponse.json(
      { error: "No quiz for this lesson" },
      { status: 404 }
    );
  }

  // get quizId from config
  let quizId: number | null = null;
  try {
    const cfg = comp.configJson ? JSON.parse(comp.configJson) : null;
    quizId = cfg?.quizId ?? null;
  } catch {
    quizId = null;
  }
  if (!quizId) {
    return NextResponse.json({ error: "Quiz not configured" }, { status: 500 });
  }

  // get quiz details
  const [quiz] = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.id, quizId));
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  // get questions
  const questions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, quizId));

  const formattedQuestions = questions.map((q) => ({
    id: q.id,
    question: q.question,
    options: JSON.parse(q.optionsJson || "[]"),
  }));

  return NextResponse.json({
    quiz: {
      id: quiz.id,
      title: quiz.title,
      description: comp.configJson
        ? JSON.parse(comp.configJson).description
        : null,
    },
    questions: formattedQuestions,
  });
}
