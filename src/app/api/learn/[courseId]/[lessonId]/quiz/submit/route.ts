import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  lessonsTable,
  quizzesTable,
  quizQuestionsTable,
  quizResultsTable,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";

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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  const user = await getSessionUser(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const p = await params;
  const courseId = Number.parseInt(p.courseId ?? "", 10);
  const lessonId = Number.parseInt(p.lessonId ?? "", 10);
  if (!Number.isFinite(courseId) || !Number.isFinite(lessonId)) {
    return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
  }

  const body = await req.json();
  const answers: number[] = body?.answers || [];

  // verify lesson exists, belongs to course, and has quiz enabled
  const [lesson] = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.id, lessonId));
  if (!lesson || lesson.courseId !== courseId || !lesson.hasQuiz) {
    return NextResponse.json(
      { error: "Lesson not found or no quiz enabled" },
      { status: 404 }
    );
  }

  // get quiz for this course
  const [quiz] = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.courseId, courseId));
  if (!quiz) {
    return NextResponse.json(
      { error: "No quiz configured for this course" },
      { status: 404 }
    );
  }

  const questions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, quiz.id));
  if (!questions.length) {
    return NextResponse.json(
      { error: "No questions in quiz" },
      { status: 404 }
    );
  }

  // calculate score
  let correct = 0;
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === questions[i].answerIndex) correct += 1;
  }
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= (lesson.quizPassingScore || 80);

  // save result
  await db.insert(quizResultsTable).values({
    userId: user.id,
    courseId,
    quizId: quiz.id,
    score,
    passed,
  });

  return NextResponse.json({
    result: {
      score,
      passed,
      answers,
      passingScore: lesson.quizPassingScore || 80,
    },
  });
}
