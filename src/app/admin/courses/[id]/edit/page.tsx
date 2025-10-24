"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<
    { id: number; title: string; order: number | null }[]
  >([]);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonContent, setNewLessonContent] = useState("");
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState<number | "">("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/courses/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load");
        setTitle(data.course.title || "");
        setDescription(data.course.description || "");
        setThumbnailUrl(data.course.thumbnailUrl || "");
        setCategory(data.course.category || "General");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function reloadLessons() {
    const res = await fetch(`/api/admin/courses/${id}/lessons`);
    const data = await res.json();
    if (res.ok) setLessons(data.lessons || []);
  }

  useEffect(() => {
    reloadLessons();
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
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
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
                        }),
                      }
                    );
                    if (res.ok) {
                      setNewLessonTitle("");
                      setNewLessonContent("");
                      setNewLessonVideoUrl("");
                      setNewLessonDuration("");
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
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {l.order ?? idx + 1}
                    </span>
                    <span className="font-medium">{l.title}</span>
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
        </CardContent>
      </Card>
    </div>
  );
}
