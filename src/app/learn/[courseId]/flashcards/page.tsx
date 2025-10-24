"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Flashcard = { id: number; front: string; back: string };

export default function FlashcardsPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId ?? "";
  const router = useRouter();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = Number.parseInt(courseId ?? "", 10);
    if (!Number.isFinite(id)) return;
    (async () => {
      const res = await fetch(`/api/learn/${id}/flashcards`, {
        cache: "no-store",
      });
      const data = await res.json();
      setCards(data.flashcards || []);
      setLoading(false);
    })();
  }, [courseId]);

  const current = cards[index];
  const next = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % cards.length);
  };
  const prev = () => {
    setFlipped(false);
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/courses/${courseId}`}>Back to Course</Link>
          </Button>
          <span className="text-muted-foreground">/</span>
          <Badge variant="secondary">Flashcards</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {cards.length > 0 && (
            <span>
              {index + 1} / {cards.length}
            </span>
          )}
        </div>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Practice with Flashcards</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading…</p>
          ) : cards.length === 0 ? (
            <p className="text-muted-foreground">No flashcards available.</p>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <motion.div
                key={current.id}
                className={`w-full aspect-video max-w-2xl grid place-items-center rounded-xl border bg-background p-6 text-center cursor-pointer select-none`}
                onClick={() => setFlipped((f) => !f)}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.4 }}
                style={{ transformStyle: "preserve-3d" as any }}
              >
                <div
                  className="text-lg md:text-2xl"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {flipped ? (
                    <span
                      style={{
                        transform: "rotateY(180deg)",
                        display: "inline-block",
                      }}
                    >
                      {current.back}
                    </span>
                  ) : (
                    current.front
                  )}
                </div>
              </motion.div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={prev}
                  disabled={cards.length === 0}
                >
                  Prev
                </Button>
                <Button onClick={next} disabled={cards.length === 0}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
