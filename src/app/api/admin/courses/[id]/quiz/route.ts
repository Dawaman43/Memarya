import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quizzesTable, quizQuestionsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const p = await params;
  const courseId = Number.parseInt(p.id ?? "", 10);
  if (!Number.isFinite(courseId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const [quiz] = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.courseId, courseId));
  if (!quiz) return NextResponse.json({ quiz: null, questions: [] });
  const questions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, quiz.id));
  return NextResponse.json({ quiz, questions });
}

// POST replaces questions for the course quiz
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const p = await params;
  const courseId = Number.parseInt(p.id ?? "", 10);
  if (!Number.isFinite(courseId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const body = await req.json();
  const { title, questions } = body || {};
  // If questions not provided, we'll still allow creating/updating the quiz metadata
  const hasQuestions = Array.isArray(questions) && questions.length > 0;

  let [quiz] = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.courseId, courseId));
  if (!quiz) {
    const inserted = await db
      .insert(quizzesTable)
      .values({ courseId, title: title || null })
      .returning();
    quiz = inserted[0];
  } else if (title) {
    await db
      .update(quizzesTable)
      .set({ title })
      .where(eq(quizzesTable.id, quiz.id));
  }

  // If questions were provided, replace them. Otherwise leave questions untouched.
  if (hasQuestions) {
    await db
      .delete(quizQuestionsTable)
      .where(eq(quizQuestionsTable.quizId, quiz.id));
    const values = questions.map((q: any) => ({
      quizId: quiz.id,
      question: String(q.question || ""),
      optionsJson: JSON.stringify(q.options || []),
      answerIndex: Number(q.answerIndex ?? 0),
    }));
    if (values.length) await db.insert(quizQuestionsTable).values(values);
  }

  // Return the quiz object so callers (UI) can know the quiz id
  return NextResponse.json({ ok: true, quiz });
}
