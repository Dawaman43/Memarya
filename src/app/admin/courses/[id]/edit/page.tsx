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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/courses/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load");
        setTitle(data.course.title || "");
        setDescription(data.course.description || "");
        setThumbnailUrl(data.course.thumbnailUrl || "");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, thumbnailUrl }),
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
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="destructive" onClick={onDelete}>
                  Delete
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
