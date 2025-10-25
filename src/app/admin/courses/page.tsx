"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Course = {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/courses", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load");
        setCourses(data.courses || []);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin • Courses</h1>
        <Button asChild>
          <Link href="/admin/courses/new">New Course</Link>
        </Button>
      </div>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle className="text-lg">{c.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {c.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {c.description}
                </p>
              )}
              <div className="flex gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/admin/courses/${c.id}/edit`}>Edit</Link>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deletingId === c.id}
                  onClick={async () => {
                    const ok = confirm(
                      `Delete course "${c.title}"? This will remove lessons and cannot be undone.`
                    );
                    if (!ok) return;
                    try {
                      setDeletingId(c.id);
                      const res = await fetch(`/api/admin/courses/${c.id}`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                      });
                      const data = await res.json();
                      if (!res.ok)
                        throw new Error(data?.error || "Failed to delete");
                      // remove from state
                      setCourses((prev) => prev.filter((x) => x.id !== c.id));
                    } catch (e: unknown) {
                      const msg = e instanceof Error ? e.message : String(e);
                      setError(msg);
                    } finally {
                      setDeletingId(null);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
