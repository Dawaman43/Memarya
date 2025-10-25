import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quizzesTable, quizQuestionsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

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

// POST /api/admin/courses/[id]/quiz/questions - Add a question to course quiz
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const p = await params;
  const courseId = Number(p.id);
  if (!Number.isFinite(courseId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json();
  const { question, optionsJson, answerIndex } = body;

  // Get or create quiz for course
  let [quiz] = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.courseId, courseId));

  if (!quiz) {
    const [created] = await db
      .insert(quizzesTable)
      .values({ courseId, title: `Course ${courseId} Quiz` })
      .returning();
    quiz = created;
  }

  const [created] = await db
    .insert(quizQuestionsTable)
    .values({
      quizId: quiz.id,
      question,
      optionsJson,
      answerIndex,
    })
    .returning();

  return NextResponse.json({ question: created }, { status: 201 });
}

// DELETE /api/admin/courses/[id]/quiz/questions - Delete a question
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const p = await params;
  const courseId = Number(p.id);
  if (!Number.isFinite(courseId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json();
  const { id } = body;

  await db.delete(quizQuestionsTable).where(eq(quizQuestionsTable.id, id));

  return NextResponse.json({ ok: true });
}
