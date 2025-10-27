"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { EditComponentModal } from "@/components/admin/edit-component-modal";

function ManageComponents({
  lessonId,
  courseId,
}: {
  lessonId: number;
  courseId: number;
}) {
  const [components, setComponents] = useState<any[] | null>(null);
  const [show, setShow] = useState(false);
  const [type, setType] = useState("quiz");

  async function reload() {
    const res = await fetch(`/api/admin/lessons/${lessonId}/components`);
    const data = await res.json();
    if (res.ok) setComponents(data.components || []);
  }

  async function add() {
    const res = await fetch(`/api/admin/lessons/${lessonId}/components`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    if (res.ok) reload();
  }

  async function remove(id: number) {
    const res = await fetch(`/api/admin/lessons/components/${id}`, {
      method: "DELETE",
    });
    if (res.ok) reload();
  }

  return (
    <div className="inline-block">
      <Button
        size="sm"
        variant="secondary"
        onClick={async () => {
          setShow(!show);
          if (!components) await reload();
        }}
      >
        Manage
      </Button>
      {show && (
        <div className="mt-2 border rounded-md p-2 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border rounded px-2 py-1 bg-transparent text-sm"
            >
              <option value="quiz">Quiz (per-lesson)</option>
              <option value="terminal">Terminal Exercise</option>
              <option value="ide">IDE Exercise</option>
              <option value="integrated-quiz">Integrated Quiz</option>
              <option value="flashcards">Flashcards Review</option>
              <option value="video">Video Component</option>
              <option value="text">Reading/Text Component</option>
              <option value="assignment">Assignment</option>
              <option value="discussion">Discussion Forum</option>
              <option value="code-challenge">Code Challenge</option>
              <option value="interactive">Interactive Exercise</option>
            </select>
            <Button size="sm" onClick={add}>
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {components?.length ? (
              components.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div className="text-sm">{c.type}</div>
                  <div className="flex gap-2">
                    <EditComponentModal
                      componentId={c.id}
                      componentType={c.type}
                      currentConfig={
                        c.configJson ? JSON.parse(c.configJson) : {}
                      }
                      courseId={courseId}
                      onSave={() => reload()}
                      trigger={
                        <Button size="sm" variant="secondary">
                          Edit
                        </Button>
                      }
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => remove(c.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No components</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [categories, setCategories] = useState<
    { category: string; count: number }[]
  >([]);
  const [category, setCategory] = useState("");
  const DEFAULT_CATEGORIES = [
    "Programming Fundamentals",
    "Data Structures & Algorithms",
    "Web Development",
    "Databases",
    "DevOps",
    "Cloud Computing",
  ];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<
    { id: number; title: string; order: number | null }[]
  >([]);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonContent, setNewLessonContent] = useState("");
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState<number | "">("");
  const [newLessonHasQuiz, setNewLessonHasQuiz] = useState(false);
  const [newLessonQuizPassingScore, setNewLessonQuizPassingScore] =
    useState(80);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [newFlashcardFront, setNewFlashcardFront] = useState("");
  const [newFlashcardBack, setNewFlashcardBack] = useState("");
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newAnswerIndex, setNewAnswerIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/courses/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load");
        setTitle(data.course.title || "");
        setDescription(data.course.description || "");
        setThumbnailUrl(data.course.thumbnailUrl || "");
        // set category to existing course category if present
        setCategory(data.course.category || "");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/courses/categories");
        const data = await res.json();
        if (res.ok) {
          const fetched: { category: string; count: number }[] =
            data.categories || [];
          const map = new Map<string, number>();
          for (const f of fetched) map.set(f.category, f.count ?? 0);
          for (const d of DEFAULT_CATEGORIES) {
            if (!map.has(d)) map.set(d, 0);
          }
          const merged = Array.from(map.entries()).map(([category, count]) => ({
            category,
            count,
          }));
          setCategories(merged);
          // if this course had no category, default to first available
          if (!category && merged.length > 0) setCategory(merged[0].category);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  async function reloadLessons() {
    const res = await fetch(`/api/admin/courses/${id}/lessons`);
    const data = await res.json();
    if (res.ok) setLessons(data.lessons || []);
  }

  async function reloadFlashcards() {
    const res = await fetch(`/api/admin/courses/${id}/flashcards`);
    const data = await res.json();
    if (res.ok) setFlashcards(data.flashcards || []);
  }

  async function reloadQuiz() {
    const res = await fetch(`/api/admin/courses/${id}/quiz`);
    const data = await res.json();
    if (res.ok) {
      setQuiz(data.quiz || null);
      setQuizQuestions(data.questions || []);
    }
  }

  useEffect(() => {
    reloadLessons();
    reloadFlashcards();
    reloadQuiz();
  }, [id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, thumbnailUrl, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    }
  }

  async function onDelete() {
    if (!confirm("Delete this course?")) return;
    const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/courses");
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Course</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading…</p>
          ) : (
            <form className="space-y-4" onSubmit={onSave}>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumb">Thumbnail URL</Label>
                <Input
                  id="thumb"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full rounded border px-2 py-2 bg-transparent"
                >
                  {categories.length === 0 && <option value="">General</option>}
                  {categories.map((c) => (
                    <option key={c.category} value={c.category}>
                      {c.category}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-muted-foreground">
                  Choose a category for this course. Categories are sourced from
                  the header's Explore list.
                </p>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="destructive" onClick={onDelete}>
                  Delete
                </Button>
              </div>
            </form>
          )}
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Lessons</h2>
            <div className="space-y-3 border rounded-md p-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  placeholder="New lesson title"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                />
                <Input
                  placeholder="Video URL (optional)"
                  value={newLessonVideoUrl}
                  onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                />
              </div>
              <Textarea
                placeholder="Lesson content (markdown or text)"
                value={newLessonContent}
                onChange={(e) => setNewLessonContent(e.target.value)}
              />
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  placeholder="Duration (seconds)"
                  value={newLessonDuration}
                  onChange={(e) =>
                    setNewLessonDuration(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasQuiz"
                    checked={newLessonHasQuiz}
                    onCheckedChange={(checked) =>
                      setNewLessonHasQuiz(checked as boolean)
                    }
                  />
                  <Label htmlFor="hasQuiz">Enable Quiz</Label>
                </div>
                {newLessonHasQuiz && (
                  <Input
                    type="number"
                    placeholder="Passing Score %"
                    value={newLessonQuizPassingScore}
                    onChange={(e) =>
                      setNewLessonQuizPassingScore(Number(e.target.value))
                    }
                    min="0"
                    max="100"
                    className="w-32"
                  />
                )}
                <Button
                  type="button"
                  onClick={async () => {
                    const title = newLessonTitle.trim();
                    if (!title) return;
                    const res = await fetch(
                      `/api/admin/courses/${id}/lessons`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          title,
                          content: newLessonContent,
                          videoUrl: newLessonVideoUrl || null,
                          duration:
                            newLessonDuration === "" ? null : newLessonDuration,
                          hasQuiz: newLessonHasQuiz,
                          quizPassingScore: newLessonHasQuiz
                            ? newLessonQuizPassingScore
                            : null,
                        }),
                      }
                    );
                    if (res.ok) {
                      setNewLessonTitle("");
                      setNewLessonContent("");
                      setNewLessonVideoUrl("");
                      setNewLessonDuration("");
                      setNewLessonHasQuiz(false);
                      setNewLessonQuizPassingScore(80);
                      reloadLessons();
                    }
                  }}
                >
                  Add lesson
                </Button>
              </div>
            </div>
            <ul className="space-y-2">
              {lessons.map((l, idx) => (
                <li
                  key={l.id}
                  className="border rounded-md p-3 flex items-center justify-between"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {l.order ?? idx + 1}
                      </span>
                      <span className="font-medium">{l.title}</span>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <ManageComponents lessonId={l.id} courseId={Number(id)} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        if (idx === 0) return;
                        const ids = [...lessons].map((x) => x.id);
                        const [a, b] = [ids[idx - 1], ids[idx]];
                        ids[idx - 1] = b;
                        ids[idx] = a;
                        await fetch(`/api/admin/courses/${id}/lessons`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ids }),
                        });
                        reloadLessons();
                      }}
                    >
                      Up
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        if (idx === lessons.length - 1) return;
                        const ids = [...lessons].map((x) => x.id);
                        const [a, b] = [ids[idx], ids[idx + 1]];
                        ids[idx] = b;
                        ids[idx + 1] = a;
                        await fetch(`/api/admin/courses/${id}/lessons`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ids }),
                        });
                        reloadLessons();
                      }}
                    >
                      Down
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        await fetch(`/api/admin/lessons/${l.id}`, {
                          method: "DELETE",
                        });
                        reloadLessons();
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
              {!lessons.length && (
                <p className="text-sm text-muted-foreground">No lessons yet.</p>
              )}
            </ul>
          </div>

          {/* Flashcards Management */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Flashcards</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFlashcards(!showFlashcards)}
              >
                {showFlashcards ? "Hide" : "Manage"} ({flashcards.length})
              </Button>
            </div>

            {showFlashcards && (
              <div className="border rounded-md p-4 space-y-4">
                {/* Add new flashcard */}
                <div className="grid gap-3 md:grid-cols-2">
                  <Textarea
                    placeholder="Front of card (question/term)"
                    value={newFlashcardFront}
                    onChange={(e) => setNewFlashcardFront(e.target.value)}
                    rows={2}
                  />
                  <Textarea
                    placeholder="Back of card (answer/explanation)"
                    value={newFlashcardBack}
                    onChange={(e) => setNewFlashcardBack(e.target.value)}
                    rows={2}
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (!newFlashcardFront.trim() || !newFlashcardBack.trim())
                      return;
                    const res = await fetch(
                      `/api/admin/courses/${id}/flashcards`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          front: newFlashcardFront.trim(),
                          back: newFlashcardBack.trim(),
                        }),
                      }
                    );
                    if (res.ok) {
                      setNewFlashcardFront("");
                      setNewFlashcardBack("");
                      reloadFlashcards();
                    }
                  }}
                >
                  Add Flashcard
                </Button>

                {/* Existing flashcards */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {flashcards.length > 0 ? (
                    flashcards.map((card) => (
                      <div
                        key={card.id}
                        className="border rounded p-3 flex items-start justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">Front:</div>
                          <div className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded mb-2">
                            {card.front}
                          </div>
                          <div className="font-medium text-sm mb-1">Back:</div>
                          <div className="text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded">
                            {card.back}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            const res = await fetch(
                              `/api/admin/courses/${id}/flashcards`,
                              {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: card.id }),
                              }
                            );
                            if (res.ok) reloadFlashcards();
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No flashcards yet. Add some above!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quiz Management */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Quiz</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuiz(!showQuiz)}
              >
                {showQuiz ? "Hide" : "Manage"} ({quizQuestions.length}{" "}
                questions)
              </Button>
            </div>

            {showQuiz && (
              <div className="border rounded-md p-4 space-y-4">
                {/* Create quiz if it doesn't exist */}
                {!quiz && (
                  <div className="border rounded p-3 bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-sm mb-2">
                      No quiz exists for this course yet.
                    </p>
                    <Button
                      size="sm"
                      onClick={async () => {
                        const res = await fetch(
                          `/api/admin/courses/${id}/quiz`,
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ title: `${title} Quiz` }),
                          }
                        );
                        if (res.ok) reloadQuiz();
                      }}
                    >
                      Create Quiz
                    </Button>
                  </div>
                )}

                {quiz && (
                  <>
                    {/* Add new question */}
                    <div className="space-y-3 border rounded p-3">
                      <h3 className="font-medium">Add New Question</h3>
                      <Textarea
                        placeholder="Question text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        rows={2}
                      />
                      <div className="space-y-2">
                        <Label>Answer Options:</Label>
                        {newOptions.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correct-answer"
                              checked={newAnswerIndex === index}
                              onChange={() => setNewAnswerIndex(index)}
                              className="w-4 h-4"
                            />
                            <Input
                              placeholder={`Option ${index + 1}`}
                              value={option}
                              onChange={(e) => {
                                const updated = [...newOptions];
                                updated[index] = e.target.value;
                                setNewOptions(updated);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={async () => {
                          if (
                            !newQuestion.trim() ||
                            newOptions.some((opt) => !opt.trim())
                          )
                            return;
                          const res = await fetch(
                            `/api/admin/courses/${id}/quiz/questions`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                question: newQuestion.trim(),
                                optionsJson: JSON.stringify(
                                  newOptions.map((opt) => opt.trim())
                                ),
                                answerIndex: newAnswerIndex,
                              }),
                            }
                          );
                          if (res.ok) {
                            setNewQuestion("");
                            setNewOptions(["", "", "", ""]);
                            setNewAnswerIndex(0);
                            reloadQuiz();
                          }
                        }}
                      >
                        Add Question
                      </Button>
                    </div>

                    {/* Existing questions */}
                    <div className="space-y-2">
                      <h3 className="font-medium">
                        Questions ({quizQuestions.length})
                      </h3>
                      {quizQuestions.length > 0 ? (
                        quizQuestions.map((q) => (
                          <div
                            key={q.id}
                            className="border rounded p-3 flex items-start justify-between gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm mb-2">
                                {q.question}
                              </div>
                              <div className="space-y-1">
                                {JSON.parse(q.optionsJson).map(
                                  (option: string, index: number) => (
                                    <div
                                      key={index}
                                      className={`text-sm p-1 rounded ${
                                        index === q.answerIndex
                                          ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                                          : "bg-gray-50 dark:bg-gray-800"
                                      }`}
                                    >
                                      {index === q.answerIndex && "✓ "}
                                      {option}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                const res = await fetch(
                                  `/api/admin/courses/${id}/quiz/questions`,
                                  {
                                    method: "DELETE",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ id: q.id }),
                                  }
                                );
                                if (res.ok) reloadQuiz();
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No questions yet. Add some above!
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
