import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quizResultsTable } from "@/db/schema";
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const user = await getSessionUser(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const p = await params;
  const courseId = Number(p.courseId);

  if (!Number.isFinite(courseId)) {
    return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
  }

  try {
    const results = await db
      .select()
      .from(quizResultsTable)
      .where(eq(quizResultsTable.userId, user.id))
      .orderBy(quizResultsTable.submittedAt);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz results" },
      { status: 500 }
    );
  }
}
