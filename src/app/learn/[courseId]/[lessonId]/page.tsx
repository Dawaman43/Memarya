import { db } from "@/db";
import { coursesTable, lessonsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const courseId = Number(params.courseId);
  const lessonId = Number(params.lessonId);

  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, courseId));
  const [lesson] = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.id, lessonId));

  if (!course || !lesson || lesson.courseId !== course.id) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-xl font-semibold">Lesson not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{course.title}</h1>
        <p className="text-sm text-muted-foreground">Lesson: {lesson.title}</p>
      </div>
      {lesson.videoUrl && (
        <div className="aspect-video bg-black/10 rounded-md">
          {/* Video embed could go here */}
        </div>
      )}
      <article className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
        {lesson.content}
      </article>
    </div>
  );
}
