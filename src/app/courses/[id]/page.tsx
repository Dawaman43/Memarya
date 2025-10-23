"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Lesson = { id: number; title: string };
type Course = { id: number; title: string; description: string | null };

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/courses/${id}`);
      const data: { course: Course; lessons: Lesson[] } = await res.json();
      if (res.ok) {
        setCourse(data.course);
        setLessons(data.lessons || []);
      }
    })();
  }, [id]);

  async function enroll() {
    setEnrolling(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: Number(id) }),
      });
      const data = await res.json();
      if (res.ok) {
        const firstLesson = lessons[0];
        if (firstLesson) router.push(`/learn/${id}/${firstLesson.id}`);
      }
    } finally {
      setEnrolling(false);
    }
  }

  if (!course) return <div className="container mx-auto p-4">Loading…</div>;

  return (
    <div className="container mx-auto p-4 max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {course.description && (
            <p className="text-muted-foreground">{course.description}</p>
          )}
          <Button onClick={enroll} disabled={enrolling}>
            {enrolling ? "Enrolling…" : "Enroll and start"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Lessons</h2>
        <ul className="list-disc pl-5">
          {lessons.map((l) => (
            <li key={l.id}>
              <a className="underline" href={`/learn/${id}/${l.id}`}>
                {l.title}
              </a>
            </li>
          ))}
          {!lessons.length && (
            <p className="text-sm text-muted-foreground">No lessons yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
