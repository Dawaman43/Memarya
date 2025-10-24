"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function CertificatePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [downloading, setDownloading] = useState(false);
  const courseId = Number.parseInt(id ?? "", 10);

  const download = async () => {
    if (!Number.isFinite(courseId)) return;
    try {
      setDownloading(true);
      const res = await fetch(`/api/certificates/${courseId}/pdf`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to download certificate");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-course-${courseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/courses/${id}`}>Back to Course</Link>
          </Button>
          <span className="text-muted-foreground">/</span>
          <Badge variant="secondary">Certificate</Badge>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Certificate of Completion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            If you have completed this course, you can download an official PDF
            certificate. Your enrollment progress must be 100%.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={download}
              disabled={downloading || !Number.isFinite(courseId)}
            >
              {downloading ? "Preparing…" : "Download Certificate"}
            </Button>
            <Button asChild variant="outline">
              <Link href={`/learn/${id}`}>Continue Learning</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
