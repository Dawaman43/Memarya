"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  PlayCircle,
  PauseCircle,
  Volume2,
  Maximize,
  Share2,
  BookOpen,
  Clock,
  CheckCircle,
  Notebook,
  FastForward,
  Bookmark,
} from "lucide-react";
import DOMPurify from "dompurify";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { Lesson, Course } from "@/types";

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
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(100); // Simulated duration
  const [showControls, setShowControls] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<HTMLIFrameElement>(null);

  const src = videoId
    ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1`
    : videoUrl || "";

  useEffect(() => {
    const interval = setInterval(() => {
      if (playing) {
        setProgress((prev) => Math.min(prev + 1, duration));
      }
    }, 1000 / playbackRate);
    return () => clearInterval(interval);
  }, [playing, duration, playbackRate]);

  const togglePlay = () => {
    setPlaying(!playing);
    // TODO: Add YouTube API calls for real play/pause
  };

  const toggleFullScreen = () => {
    if (playerRef.current?.requestFullscreen) {
      playerRef.current.requestFullscreen();
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    // TODO: Update YouTube player playback rate via API
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setError("Failed to load video. Please try again.");
    setLoading(false);
  };

  return (
    <div
      className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
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
            ref={playerRef}
            src={src}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <svg
                className="animate-spin h-8 w-8 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </div>
          )}
          <AnimatePresence>
            {!playing && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/60"
              >
                <PlayCircle
                  className="w-16 h-16 text-white cursor-pointer hover:scale-110 transition-transform"
                  onClick={togglePlay}
                  aria-label="Play video"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{
              y: showControls ? 0 : 50,
              opacity: showControls ? 1 : 0,
            }}
            className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 flex items-center gap-4"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white"
              aria-label={playing ? "Pause video" : "Play video"}
            >
              {playing ? (
                <PauseCircle className="w-6 h-6" />
              ) : (
                <PlayCircle className="w-6 h-6" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-24"
              aria-label="Volume control"
            />
            <Volume2 className="w-5 h-5 text-white" />
            <div className="flex-1 h-2 bg-gray-300 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(progress / duration) * 100}%` }}
              />
            </div>
            <div className="flex gap-2">
              {[1, 1.5, 2].map((rate) => (
                <Button
                  key={rate}
                  variant={playbackRate === rate ? "default" : "ghost"}
                  size="sm"
                  onClick={() => changePlaybackRate(rate)}
                  className="text-white"
                  aria-label={`Set playback speed to ${rate}x`}
                >
                  {rate}x
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullScreen}
              className="text-white"
              aria-label="Toggle full screen"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </motion.div>
          {thumbnail && !playing && !loading && (
            <motion.img
              initial={{ opacity: 1 }}
              animate={{ opacity: playing ? 0 : 1 }}
              src={thumbnail}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </>
      )}
    </div>
  );
};

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Convert YouTube watch URLs to embed URLs
  const convertYouTubeUrl = (html: string): string => {
    const watchRegex =
      /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g;
    return html.replace(watchRegex, "https://www.youtube.com/embed/$1");
  };

  // Load notes and bookmark status on client side
  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      setNotes(localStorage.getItem(`course-notes-${id}`) || "");
      const bookmarkedCourses = JSON.parse(
        localStorage.getItem("bookmarked-courses") || "[]"
      );
      setIsBookmarked(bookmarkedCourses.includes(Number(id)));
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setError("Invalid course ID.");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/courses/${id}`);
        if (!res.ok) throw new Error("Failed to fetch course data");
        const data: { course: Course; lessons: Lesson[] } = await res.json();
        setCourse(data.course);
        setLessons(data.lessons || []);
        // Fetch related courses
        if (data.course.category) {
          const relatedRes = await fetch(
            `/api/courses?category=${encodeURIComponent(data.course.category)}`,
            { cache: "force-cache" }
          );
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            setRelatedCourses(
              relatedData.courses.filter((c: Course) => c.id !== data.course.id)
            );
          }
        }
      } catch (err) {
        setError("Failed to load course details. Please try again.");
        console.error("Error fetching course:", err);
      }
    })();
  }, [id]);

  async function enroll() {
    if (!id) return;
    setEnrolling(true);
    setError(null);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: Number(id) }),
      });
      if (!res.ok) throw new Error("Failed to enroll");
      const firstLesson = lessons[0];
      if (firstLesson) {
        router.push(`/learn/${id}/${firstLesson.id}`);
      } else {
        setError("Enrollment successful, but no lessons available to start.");
      }
    } catch (err) {
      setError("Failed to enroll. Please try again.");
      console.error("Error enrolling:", err);
    } finally {
      setEnrolling(false);
    }
  }

  const saveNotes = (value: string) => {
    setNotes(value);
    if (typeof window !== "undefined" && id) {
      localStorage.setItem(`course-notes-${id}`, value);
      toast.success("Notes saved!", { duration: 2000 });
    }
  };

  const toggleBookmark = () => {
    if (typeof window !== "undefined" && id) {
      const bookmarkedCourses = JSON.parse(
        localStorage.getItem("bookmarked-courses") || "[]"
      );
      let updatedBookmarks;
      if (isBookmarked) {
        updatedBookmarks = bookmarkedCourses.filter(
          (courseId: number) => courseId !== Number(id)
        );
        toast.success("Removed from bookmarks", { duration: 2000 });
      } else {
        updatedBookmarks = [...bookmarkedCourses, Number(id)];
        toast.success("Added to bookmarks", { duration: 2000 });
      }
      localStorage.setItem(
        "bookmarked-courses",
        JSON.stringify(updatedBookmarks)
      );
      setIsBookmarked(!isBookmarked);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/courses")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-96 w-full rounded-lg" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 lg:w-80">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const sanitizedDescription = course.description
    ? DOMPurify.sanitize(convertYouTubeUrl(course.description), {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: [
          "allow",
          "allowfullscreen",
          "frameborder",
          "scrolling",
          "src",
        ],
      })
    : null;

  return (
    <div className="container mx-auto p-6 space-y-8 flex flex-col lg:flex-row gap-6">
      {/* Main Content */}
      <div className="flex-1">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-linear-to-r from-blue-600 to-purple-600 rounded-lg shadow-xl overflow-hidden"
        >
          {course.thumbnailUrl && (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-96 object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 flex flex-col justify-center p-8 text-white">
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-5xl font-bold">{course.title}</h1>
              {course.progress !== undefined && (
                <div className="relative w-12 h-12">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeOpacity="0.3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray={`${course.progress}, 100`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                    {course.progress}%
                  </span>
                </div>
              )}
            </div>
            {course.category && (
              <Badge className="bg-white/30 text-white mb-4">
                {course.category}
              </Badge>
            )}
            {lessons[0]?.videoId || lessons[0]?.videoUrl ? (
              <CustomVideoPlayer
                videoId={lessons[0].videoId}
                videoUrl={lessons[0].videoUrl}
                thumbnail={course.thumbnailUrl}
                title={`${course.title} - Preview`}
              />
            ) : (
              <p className="text-lg italic">No preview video available.</p>
            )}
          </div>
        </motion.div>

        {/* Course Info */}
        <Card className="mt-6 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Course Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sanitizedDescription ? (
              <div
                className="text-gray-600 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
            ) : (
              <p className="text-gray-500 italic">No description available.</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {course.duration && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{course.duration} mins</span>
                </div>
              )}
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                <span>{lessons.length} lessons</span>
              </div>
              {course.progress !== undefined && (
                <div className="flex items-center">
                  <span>Progress: {course.progress}%</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full ml-2">
                    <motion.div
                      className="h-full bg-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-4 flex-wrap">
              <Button
                onClick={enroll}
                disabled={enrolling || !id || lessons.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                aria-label="Enroll in course"
              >
                {enrolling ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Enrolling…
                  </span>
                ) : lessons.length === 0 ? (
                  "No Lessons Available"
                ) : (
                  "Enroll and Start"
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push(`/learn/${id}/flashcards`)}
              >
                Flashcards
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push(`/learn/${id}/quiz`)}
              >
                Quiz
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push(`/courses/${id}/certificate`)}
              >
                Certificate
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/courses")}
                aria-label="Back to courses"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  navigator.share({
                    title: course.title,
                    text: `Check out this course: ${course.title}`,
                    url: window.location.href,
                  })
                }
                aria-label="Share course"
              >
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
              <Button
                variant={isBookmarked ? "default" : "outline"}
                onClick={toggleBookmark}
                className={
                  isBookmarked ? "bg-blue-600 hover:bg-blue-700 text-white" : ""
                }
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                <Bookmark className="w-4 h-4 mr-2" />{" "}
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes Section */}
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
                placeholder="Jot down your notes for this course..."
                value={notes}
                onChange={(e) => saveNotes(e.target.value)}
                className="w-full"
                aria-label="Course notes"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Related Courses */}
        {relatedCourses.length > 0 && (
          <Card className="mt-6 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">Related Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {relatedCourses.slice(0, 4).map((related) => (
                  <Card
                    key={related.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4">
                      <a
                        href={`/courses/${related.id}`}
                        className="text-lg font-medium text-blue-600 hover:underline"
                        aria-label={`View course: ${related.title}`}
                      >
                        {related.title}
                      </a>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {related.description || "No description available."}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar: Lessons List */}
      <div className="lg:w-80 space-y-4">
        <Card className="shadow-md sticky top-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <BookOpen className="w-5 h-5 mr-2" /> Lessons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lessons.length === 0 ? (
              <p className="text-gray-500 italic">No lessons yet.</p>
            ) : (
              lessons.map((lesson) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b last:border-b-0 pb-2"
                >
                  <div className="flex items-center justify-between">
                    <a
                      href={`/learn/${id}/${lesson.id}`}
                      className="text-sm font-medium text-blue-600 hover:underline flex-1"
                      aria-label={`Go to lesson: ${lesson.title}`}
                    >
                      {lesson.title}
                    </a>
                    {lesson.completed && (
                      <CheckCircle
                        className="w-4 h-4 text-green-500"
                        aria-label="Lesson completed"
                      />
                    )}
                  </div>
                  {(lesson.description ||
                    lesson.videoId ||
                    lesson.videoUrl) && (
                    <button
                      onClick={() =>
                        setExpandedLesson(
                          expandedLesson === lesson.id ? null : lesson.id
                        )
                      }
                      className="text-xs text-gray-500 hover:text-blue-600 mt-1"
                      aria-label={
                        expandedLesson === lesson.id
                          ? "Hide lesson details"
                          : "Show lesson details"
                      }
                    >
                      {expandedLesson === lesson.id
                        ? "Hide Details"
                        : "Show Details"}
                    </button>
                  )}
                  <AnimatePresence>
                    {expandedLesson === lesson.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 text-sm text-gray-600"
                      >
                        {lesson.description && <p>{lesson.description}</p>}
                        {(lesson.videoId || lesson.videoUrl) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => setPreviewLesson(lesson)}
                            aria-label={`Preview lesson: ${lesson.title}`}
                          >
                            <PlayCircle className="w-4 h-4 mr-2" /> Preview
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {lesson.duration && (
                    <p className="text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {lesson.duration} mins
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lesson Preview Modal */}
      <AnimatePresence>
        {previewLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-label="Lesson preview modal"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{previewLesson.title}</h2>
                <Button
                  variant="ghost"
                  onClick={() => setPreviewLesson(null)}
                  aria-label="Close preview"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>
              <CustomVideoPlayer
                videoId={previewLesson.videoId}
                videoUrl={previewLesson.videoUrl}
                thumbnail={course.thumbnailUrl}
                title={previewLesson.title}
              />
              {previewLesson.description && (
                <p className="mt-4 text-gray-600">
                  {previewLesson.description}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
