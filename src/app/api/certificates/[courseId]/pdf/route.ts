import { NextRequest } from "next/server";
import { db } from "@/db";
import {
  certificatesTable,
  coursesTable,
  enrollmentsTable,
  quizResultsTable,
  quizzesTable,
} from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
// Note: Import PDFKit dynamically inside the handler to avoid Turbopack bundling issues

export const runtime = "nodejs";

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
  // Dynamically import pdfkit to avoid build errors with @swc/helpers in Turbopack
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const PDFDocument = (await import("pdfkit")).default as any;
  const user = await getSessionUser(req);
  if (!user)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });

  const p = await params;
  const courseId = Number(p.courseId);
  if (!Number.isInteger(courseId))
    return new Response(JSON.stringify({ error: "Invalid courseId" }), {
      status: 400,
    });

  // Verify enrollment and completion
  const [enrollment] = await db
    .select()
    .from(enrollmentsTable)
    .where(
      and(
        eq(enrollmentsTable.userId, user.id),
        eq(enrollmentsTable.courseId, courseId)
      )
    );
  if (!enrollment)
    return new Response(JSON.stringify({ error: "Not enrolled" }), {
      status: 403,
    });
  if ((enrollment.progress ?? 0) < 100)
    return new Response(JSON.stringify({ error: "Course not completed" }), {
      status: 400,
    });

  // Require a passed quiz result (>= 80) if a quiz exists for this course
  const [quiz] = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.courseId, courseId));
  if (quiz) {
    const results = await db
      .select()
      .from(quizResultsTable)
      .where(
        and(
          eq(quizResultsTable.userId, user.id),
          eq(quizResultsTable.courseId, courseId),
          eq(quizResultsTable.quizId, quiz.id)
        )
      )
      .orderBy(desc(quizResultsTable.submittedAt));
    if (!results.length || !results[0].passed || (results[0].score ?? 0) < 80) {
      return new Response(
        JSON.stringify({ error: "Quiz requirement not met (>= 80% required)" }),
        { status: 400 }
      );
    }
  }

  // Get course details
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, courseId));
  if (!course)
    return new Response(JSON.stringify({ error: "Course not found" }), {
      status: 404,
    });

  // Ensure a certificate record exists (idempotent)
  const existing = await db
    .select()
    .from(certificatesTable)
    .where(
      and(
        eq(certificatesTable.userId, user.id),
        eq(certificatesTable.courseId, courseId)
      )
    );
  if (!existing.length) {
    try {
      await db.insert(certificatesTable).values({ userId: user.id, courseId });
    } catch {
      // ignore conflicts
    }
  }

  // Generate PDF into a Buffer
  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: any) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Simple certificate design
    const title = "Certificate of Completion";
    const name = user.name ?? user.email ?? "Student";
    const courseTitle = course.title;
    const dateStr = new Date().toLocaleDateString();

    // Border
    doc
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .strokeColor("#999999")
      .lineWidth(2)
      .stroke();

    // Header
    doc
      .fontSize(28)
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .text(title, { align: "center" })
      .moveDown(1.5);

    // Recipient
    doc
      .fontSize(20)
      .font("Helvetica")
      .fillColor("#374151")
      .text("This certifies that", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(26)
      .font("Helvetica-Bold")
      .fillColor("#111827")
      .text(name, { align: "center" })
      .moveDown(1);

    // Course title
    doc
      .fontSize(18)
      .font("Helvetica")
      .fillColor("#374151")
      .text("has successfully completed the course", { align: "center" })
      .moveDown(0.4);

    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .fillColor("#111827")
      .text(`“${courseTitle}”`, { align: "center" })
      .moveDown(1.5);

    // Date
    doc
      .fontSize(14)
      .font("Helvetica")
      .fillColor("#6B7280")
      .text(`Issued on ${dateStr}`, { align: "center" })
      .moveDown(2);

    // Signature placeholder
    const y = doc.y + 40;
    const leftX = 90;
    const rightX = doc.page.width - 250;
    doc
      .moveTo(leftX, y)
      .lineTo(leftX + 200, y)
      .strokeColor("#9CA3AF")
      .lineWidth(1)
      .stroke();
    doc
      .moveTo(rightX, y)
      .lineTo(rightX + 200, y)
      .strokeColor("#9CA3AF")
      .lineWidth(1)
      .stroke();
    doc
      .fontSize(12)
      .fillColor("#6B7280")
      .text("Instructor", leftX, y + 5, { width: 200, align: "center" });
    doc
      .fontSize(12)
      .fillColor("#6B7280")
      .text("Director", rightX, y + 5, { width: 200, align: "center" });

    doc.end();
  });

  const filename = `certificate-course-${courseId}.pdf`;
  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
