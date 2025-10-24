"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function MarkCompleteButton({ lessonId }: { lessonId: number }) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <Button
      disabled={saving || done}
      onClick={async () => {
        try {
          setSaving(true);
          const res = await fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonId, completed: true }),
          });
          if (res.ok) setDone(true);
        } finally {
          setSaving(false);
        }
      }}
    >
      {done ? "Completed" : saving ? "Saving…" : "Mark complete"}
    </Button>
  );
}
