import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quizzesTable } from "@/db/schema";

export async function GET() {
  const quizzes = await db
    .select()
    .from(quizzesTable)
    .orderBy(quizzesTable.createdAt);
  return NextResponse.json({ quizzes });
}
