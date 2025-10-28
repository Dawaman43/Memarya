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
import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

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

  // Generate PDF using jsPDF
  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const title = "Certificate of Completion";
    const name = user.name ?? user.email ?? "Student";
    const courseTitle = course.title ?? "Course";
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }); // Matches "October 19, 2025" format
    const ceoName = "Dawit Worku";
    const ceoTitle = "Chief Executive Officer";

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Layout constants for landscape certificate
    const leftMargin = 28;
    const rightMargin = 28;
    const topMargin = 20;
    const bottomMargin = 28;
    const contentWidth = pageWidth - leftMargin - rightMargin;

    // Clean white background and navy border
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setDrawColor(18, 24, 72); // deep navy
    doc.setLineWidth(6);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

    // Large soft watermark letter centered behind content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(180);
    doc.setTextColor(235, 235, 240);
    const watermark = "U";
    doc.text(watermark, pageWidth / 2, pageHeight / 2 + 30, {
      align: "center",
      baseline: "middle",
    });

    // Starting Y for top content
    let cursorY = topMargin + 8;

    // Top center: small brand line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(18, 24, 72);
    const brandText = "MEMARYA";
    doc.text(brandText, pageWidth / 2, cursorY, { align: "center" });
    cursorY += 12;

    // Verified certificate subtitle
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(74, 85, 121);
    const certTitle = "Verified Certificate Of Nanodegree Program Completion";
    doc.text(certTitle, pageWidth / 2, cursorY, { align: "center" });
    cursorY += 18;

    // Large course title centered near top
    doc.setFont("times", "bold");
    doc.setFontSize(42);
    doc.setTextColor(20, 20, 20);
    // If too long, split into two lines within content width
    const titleLines = doc.splitTextToSize(courseTitle, contentWidth - 40);
    for (let i = 0; i < titleLines.length; i++) {
      doc.text(titleLines[i], pageWidth / 2, cursorY + i * 20, {
        align: "center",
      });
    }
    cursorY += Math.max(40, titleLines.length * 20) + 6;

    // Left column: Awarded to, name and date
    const leftColumnX = leftMargin + 18;
    const leftColumnY = Math.max(cursorY + 10, pageHeight / 2 - 20);

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(80, 92, 140);
    doc.text("Awarded to", leftColumnX, leftColumnY);

    // Recipient name (large, blue)
    let nameFont = 36;
    doc.setFont("times", "bold");
    doc.setFontSize(nameFont);
    // reduce font if too wide for left column area
    const leftColumnWidth = contentWidth * 0.45;
    while (doc.getTextWidth(name) > leftColumnWidth - 10 && nameFont > 18) {
      nameFont -= 2;
      doc.setFontSize(nameFont);
    }
    doc.setTextColor(24, 52, 150);
    const nameY = leftColumnY + 18;
    doc.text(name, leftColumnX, nameY);

    // Date below
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(90, 102, 128);
    doc.text(dateStr, leftColumnX, nameY + 12);

    // Footer and bottom-left logo/text
    const footerY = pageHeight - bottomMargin - 30;
    const footerTextY = footerY + 6;

    // Attempt to draw logo at bottom-left (public/logo.png or public/logo-small.png)
    try {
      let logoPath = path.join(process.cwd(), "public", "logo-small.png");
      const altLogo = path.join(process.cwd(), "public", "logo.png");
      if (!fs.existsSync(logoPath) && fs.existsSync(altLogo))
        logoPath = altLogo;
      if (fs.existsSync(logoPath)) {
        const logoBuf = fs.readFileSync(logoPath);
        const logoBase64 = logoBuf.toString("base64");
        const logoData = `data:image/png;base64,${logoBase64}`;
        // draw small logo
  // addImage with data URL (jsPDF typings are acceptable here)
  doc.addImage(logoData, "PNG", leftMargin, footerY - 6, 28, 14);
      } else {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(18, 24, 72);
        doc.text("MEMARYA", leftMargin, footerY);
      }
    } catch (logoErr) {
      console.warn("Logo load error:", logoErr);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 102, 128);
    const footerText =
      "Memarya has confirmed participation of this individual in this program. Confirmation at www.memarya.com/certificate/e/cf81df2";
    const footerLines = doc.splitTextToSize(footerText, contentWidth * 0.6);
    for (let i = 0; i < footerLines.length; i++) {
      doc.text(footerLines[i], leftMargin + 36, footerTextY + i * 4.5);
    }

    // Signature area bottom-right
    const sigW = 64;
    const sigH = 28;
    const sigX = pageWidth - rightMargin - sigW - 6;
    const sigY = footerY - 8;
    try {
      const primarySig = path.join(
        process.cwd(),
        "public",
        "signatures",
        "dawit-worku.png"
      );
      const fallbackSig = path.join(process.cwd(), "public", "signature.png");
      let sigPath = primarySig;
      if (!fs.existsSync(primarySig) && fs.existsSync(fallbackSig))
        sigPath = fallbackSig;

      if (fs.existsSync(sigPath)) {
        const sigBuf = fs.readFileSync(sigPath);
        const sigBase64 = sigBuf.toString("base64");
        const imgData = `data:image/png;base64,${sigBase64}`;
  // addImage with data URL (jsPDF typings are acceptable here)
  doc.addImage(imgData, "PNG", sigX, sigY, sigW, sigH);
      } else {
        doc.setDrawColor(18, 24, 72);
        doc.setLineWidth(0.6);
        doc.line(sigX, sigY + sigH / 2, sigX + sigW, sigY + sigH / 2);
      }
    } catch (imgError) {
      console.warn("Error loading signature image:", imgError);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(sigX, sigY + sigH / 2, sigX + sigW, sigY + sigH / 2);
    }

    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(24, 24, 24);
    // center CEO name under signature
    doc.text(ceoName, sigX + sigW / 2, sigY + sigH + 8, { align: "center" });
    doc.setFont("times", "normal");
    doc.setFontSize(8);
    doc.text(ceoTitle, sigX + sigW / 2, sigY + sigH + 14, { align: "center" });

    // Export
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    console.log("PDF generated, size:", pdfBuffer.length);
    const filename = `certificate-course-${courseId}.pdf`;
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate certificate" }),
      { status: 500 }
    );
  }
}
