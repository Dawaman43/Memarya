"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchParams, useRouter } from "next/navigation";

type Course = {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams?.get("category") ?? "all";

  useEffect(() => {
    (async () => {
      const qs =
        category && category !== "all"
          ? `?category=${encodeURIComponent(category)}`
          : "";
      const res = await fetch(`/api/courses${qs}`, { cache: "no-store" });
      const data = await res.json();
      setCourses(data.courses || []);
      setLoading(false);
    })();
  }, [category]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Courses</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filter:</span>
          <Button
            variant={category === "all" ? "default" : "secondary"}
            size="sm"
            onClick={() => router.push("/courses?category=all")}
          >
            All
          </Button>
        </div>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{c.title}</CardTitle>
                  <Badge variant="secondary">{c.category}</Badge>
                </div>
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
