"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Define props interface to include className
interface MarkCompleteButtonProps {
  lessonId: number;
  className?: string; // Optional className prop
}

export default function MarkCompleteButton({
  lessonId,
  className,
}: MarkCompleteButtonProps) {
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
      className={className} // Pass className to Button
    >
      {done ? "Completed" : saving ? "Saving…" : "Mark complete"}
    </Button>
  );
}
