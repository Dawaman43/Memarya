"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Course = {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/courses", { cache: "no-store" });
      const data = await res.json();
      setCourses(data.courses || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Courses</h1>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="text-lg">{c.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {c.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {c.description}
                  </p>
                )}
                <Button asChild size="sm">
                  <Link href={`/courses/${c.id}`}>View</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
