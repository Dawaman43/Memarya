"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  PlayCircle,
  Bookmark,
  Notebook,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import DOMPurify from "dompurify";
import toast from "react-hot-toast";
import MarkCompleteButton from "@/components/learn/mark-complete-button";

// Utility function to convert YouTube URLs to embed format
const getEmbedUrl = (url: string | undefined): string => {
  if (!url) return "";
  const videoIdMatch = url.match(
    /(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]+)/
  );
  const videoId = videoIdMatch ? videoIdMatch[1] : "";
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0` : "";
};

// CustomVideoPlayer component with plain iframe
const CustomVideoPlayer = ({
  videoId,
  videoUrl,
  thumbnail,
  title,
}: {
  videoId?: string;
  videoUrl?: string;
  thumbnail?: string;
  title: string;
}) => {
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const src = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=0`
    : getEmbedUrl(videoUrl);

  if (!src) {
    setError("No valid video URL provided.");
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg"
      role="region"
      aria-label="Video player"
    >
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <iframe
            width="100%"
            height="100%"
            src={src}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
            onLoad={() => setShowThumbnail(false)}
          ></iframe>
          <AnimatePresence>
            {showThumbnail && thumbnail && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/60"
              >
                <PlayCircle
                  className="w-16 h-16 text-white cursor-pointer hover:scale-110 transition-transform"
                  aria-label="Play video"
                />
                <motion.img
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  src={thumbnail}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

// Loading state component
function LoadingState() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-96 w-full max-w-3xl rounded-lg" />
      <Skeleton className="h-32 w-full max-w-3xl" />
    </div>
  );
}

// Error state component
function ErrorState({ message }: { message: string }) {
  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh]">
      <Card className="border-red-200">
        <CardContent className="pt-6 text-center">
          <p className="text-red-600 text-lg">{message}</p>
          <Button
            variant="outline"
            className="mt-4"
            asChild
            aria-label="Back to courses"
          >
            <Link href="/courses">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

type Course = {
  id: number;
  title: string;
  thumbnailUrl?: string | null;
};

type Lesson = {
  id: number;
  courseId: number;
  title: string;
  content?: string | null;
  videoUrl?: string | null;
  videoId?: string | null;
  duration?: number | null;
  thumbnailUrl?: string | null;
  completed?: boolean | null;
};

export default function LessonPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const courseId = Number.isFinite(Number.parseInt(params?.courseId ?? "", 10))
    ? Number.parseInt(params!.courseId, 10)
    : NaN;
  const lessonId = Number.isFinite(Number.parseInt(params?.lessonId ?? "", 10))
    ? Number.parseInt(params!.lessonId, 10)
    : NaN;
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && lessonId) {
      setNotes(localStorage.getItem(`lesson-notes-${lessonId}`) || "");
      const bookmarkedLessons = JSON.parse(
        localStorage.getItem("bookmarked-lessons") || "[]"
      );
      setIsBookmarked(bookmarkedLessons.includes(Number(lessonId)));
    }
  }, [lessonId]);

  useEffect(() => {
    if (!Number.isInteger(courseId) || !Number.isInteger(lessonId)) {
      setError("Invalid lesson URL");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/learn/${courseId}/${lessonId}`);
        if (!res.ok) {
          const { error } = await res.json();
          throw new Error(error || "Failed to load lesson");
        }
        const { course, lesson } = await res.json();
        setCourse(course);
        setLesson(lesson);
        setLoading(false);
      } catch (err) {
        setError("Failed to load lesson. Please try again.");
        setLoading(false);
        console.error("Error fetching lesson:", err);
      }
    })();
  }, [courseId, lessonId]);

  const saveNotes = (value: string) => {
    setNotes(value);
    if (typeof window !== "undefined" && lessonId) {
      localStorage.setItem(`lesson-notes-${lessonId}`, value);
      toast.success("Notes saved!", { duration: 2000 });
    }
  };

  const toggleBookmark = () => {
    if (typeof window !== "undefined" && lessonId) {
      const bookmarkedLessons = JSON.parse(
        localStorage.getItem("bookmarked-lessons") || "[]"
      );
      let updatedBookmarks;
      if (isBookmarked) {
        updatedBookmarks = bookmarkedLessons.filter(
          (id: number) => id !== Number(lessonId)
        );
        toast.success("Removed from bookmarks", { duration: 2000 });
      } else {
        updatedBookmarks = [...bookmarkedLessons, Number(lessonId)];
        toast.success("Added to bookmarks", { duration: 2000 });
      }
      localStorage.setItem(
        "bookmarked-lessons",
        JSON.stringify(updatedBookmarks)
      );
      setIsBookmarked(!isBookmarked);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !course || !lesson) {
    return <ErrorState message={error || "Lesson not found"} />;
  }

  const sanitizedContent = DOMPurify.sanitize(lesson.content || "", {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "src"],
  });

  return (
    <Suspense fallback={<LoadingState />}>
      <div className="container mx-auto p-6 space-y-6">
        <nav className="text-sm flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            aria-label="Back to courses"
          >
            <Link href="/courses">
              <ArrowLeft className="w-4 h-4 mr-2" /> Courses
            </Link>
          </Button>
          <span className="text-gray-500">/</span>
          <Button
            variant="ghost"
            size="sm"
            asChild
            aria-label={`Back to course: ${course.title}`}
          >
            <Link href={`/courses/${courseId}`}>{course.title}</Link>
          </Button>
          <span className="text-gray-500">/</span>
          <span className="text-gray-600">{lesson.title}</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl">{lesson.title}</CardTitle>
                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={toggleBookmark}
                  className={
                    isBookmarked
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : ""
                  }
                  aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Course: {course.title}
                {lesson.duration && (
                  <span className="ml-4">
                    <Clock className="w-4 h-4 inline mr-1" /> {lesson.duration}{" "}
                    mins
                  </span>
                )}
                {lesson.completed && (
                  <span className="ml-4">
                    <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />{" "}
                    Completed
                  </span>
                )}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {lesson.videoUrl || lesson.videoId ? (
                <CustomVideoPlayer
                  videoId={lesson.videoId ?? undefined}
                  videoUrl={lesson.videoUrl ?? undefined}
                  thumbnail={
                    lesson.thumbnailUrl ?? course.thumbnailUrl ?? undefined
                  }
                  title={lesson.title}
                />
              ) : (
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 italic">No video available.</p>
                </div>
              )}

              <div className="prose dark:prose-invert max-w-none">
                {sanitizedContent ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    className="text-gray-700 dark:text-gray-300"
                  />
                ) : (
                  <p className="text-gray-500 italic">No content available.</p>
                )}
              </div>

              <div className="flex gap-4 flex-wrap">
                <MarkCompleteButton
                  lessonId={lesson.id}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                />
                <Button
                  variant="outline"
                  onClick={() => router.push(`/courses/${courseId}`)}
                  aria-label="Back to course"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Course
                </Button>
              </div>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: notes ? 1 : 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Notebook className="w-6 h-6 mr-2" /> My Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={4}
                  placeholder="Jot down your notes for this lesson..."
                  value={notes}
                  onChange={(e) => saveNotes(e.target.value)}
                  className="w-full"
                  aria-label="Lesson notes"
                />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </Suspense>
  );
}
