import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
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
  { params }: { params: Promise<{ courseId: string }> }
) {
  const user = await getSessionUser(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const p = await params;
  const courseId = Number.parseInt(p.courseId ?? "", 10);
  if (!Number.isFinite(courseId))
    return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });

  const body = await req.json();
  const answers: Record<number, number> = body?.answers || {};

  const [quiz] = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.courseId, courseId));
  if (!quiz)
    return NextResponse.json({ error: "No quiz for course" }, { status: 404 });

  const questions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, quiz.id));
  if (!questions.length)
    return NextResponse.json({ error: "No questions" }, { status: 404 });

  let correct = 0;
  for (const q of questions) {
    if (answers[q.id] === q.answerIndex) correct += 1;
  }
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= 80;

  await db.insert(quizResultsTable).values({
    userId: user.id,
    courseId,
    quizId: quiz.id,
    score,
    passed,
  });

  return NextResponse.json({ score, passed });
}
