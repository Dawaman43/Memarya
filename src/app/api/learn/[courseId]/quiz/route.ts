import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quizzesTable, quizQuestionsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const p = await params;
  const courseId = Number.parseInt(p.courseId ?? "", 10);
  if (!Number.isFinite(courseId)) {
    return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
  }

  const [quiz] = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.courseId, courseId));

  if (!quiz) return NextResponse.json({ courseId, questions: [] });

  const rows = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, quiz.id));

  const questions = rows.map((r) => ({
    id: r.id,
    question: r.question,
    options: JSON.parse(r.optionsJson || "[]"),
    answerIndex: r.answerIndex,
  }));

  return NextResponse.json({ courseId, quizId: quiz.id, questions });
}
