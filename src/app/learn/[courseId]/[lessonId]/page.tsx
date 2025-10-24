import { db } from "@/db";
import { coursesTable, lessonsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import ReactMarkdown from "react-markdown";
import MarkCompleteButton from "@/components/learn/mark-complete-button";

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
        <div className="aspect-video bg-black/10 rounded-md overflow-hidden">
          {/* Simple built-in player: HTML5 video for direct links; iframe for YouTube */}
          {/(youtube\.com|youtu\.be|vimeo\.com)/i.test(lesson.videoUrl) ? (
            <iframe
              src={
                lesson.videoUrl.includes("watch?v=")
                  ? lesson.videoUrl.replace("watch?v=", "embed/")
                  : lesson.videoUrl
              }
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title="Lesson video"
            />
          ) : (
            <video className="w-full h-full" controls preload="metadata">
              <source src={lesson.videoUrl} />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}
      <article className="prose dark:prose-invert max-w-none">
        <ReactMarkdown>{lesson.content}</ReactMarkdown>
      </article>
      <div>
        <MarkCompleteButton lessonId={lesson.id} />
      </div>
    </div>
  );
}
