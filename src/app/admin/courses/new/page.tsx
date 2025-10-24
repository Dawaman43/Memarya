"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [category, setCategory] = useState("General");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlWarning, setUrlWarning] = useState<string | null>(null);

  // Validate YouTube URLs in description
  const validateDescription = (value: string) => {
    const watchUrlRegex =
      /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g;
    if (watchUrlRegex.test(value)) {
      setUrlWarning(
        "YouTube watch URLs (e.g., /watch?v=VIDEO_ID) are not embeddable. Use embed URLs (e.g., /embed/VIDEO_ID) or convert them automatically on save."
      );
    } else {
      setUrlWarning(null);
    }
    setDescription(value);
  };

  // Convert YouTube watch URLs to embed URLs before submission
  const convertYouTubeUrls = (text: string): string => {
    const watchUrlRegex =
      /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g;
    return text.replace(watchUrlRegex, "https://www.youtube.com/embed/$1");
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Convert YouTube URLs in description before sending
      const sanitizedDescription = convertYouTubeUrls(description);
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: sanitizedDescription,
          thumbnailUrl,
          category,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create");
      router.push(`/admin/courses/${data.course.id}/edit`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
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
                onChange={(e) => validateDescription(e.target.value)}
                placeholder="Enter course description. Use YouTube embed URLs for videos (e.g., https://www.youtube.com/embed/VIDEO_ID)."
              />
              {urlWarning && (
                <p className="text-sm text-yellow-600">{urlWarning}</p>
              )}
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
                placeholder="e.g., Web Development, DSA, Cloud"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
