"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Question {
  id: number;
  question: string;
  options: string[];
  answerIndex: number;
}

export default function QuizPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId ?? "";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const id = Number.parseInt(courseId ?? "", 10);
    if (!Number.isFinite(id)) return;
    (async () => {
      const res = await fetch(`/api/learn/${id}/quiz`, { cache: "no-store" });
      const data = await res.json();
      setQuestions(data.questions || []);
      const initial: Record<number, number | null> = {};
      (data.questions || []).forEach((q: Question) => (initial[q.id] = null));
      setAnswers(initial);
      setLoading(false);
    })();
  }, [courseId]);

  const score = useMemo(() => {
    if (!submitted) return null as number | null;
    let s = 0;
    for (const q of questions) {
      if (answers[q.id] === q.answerIndex) s += 1;
    }
    return s;
  }, [submitted, answers, questions]);

  const allAnswered = useMemo(() => {
    return (
      questions.length > 0 && questions.every((q) => answers[q.id] !== null)
    );
  }, [answers, questions]);

  const submit = async () => {
    setSubmitted(true);
    try {
      setSubmitting(true);
      const res = await fetch(`/api/learn/${courseId}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      // Optional: show toast here; for now we rely on inline score display
    } finally {
      setSubmitting(false);
    }
  };
  const reset = () => {
    const initial: Record<number, number | null> = {};
    questions.forEach((q) => (initial[q.id] = null));
    setAnswers(initial);
    setSubmitted(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/courses/${courseId}`}>Back to Course</Link>
          </Button>
          <span className="text-muted-foreground">/</span>
          <Badge variant="secondary">Quiz</Badge>
        </div>
        {submitted && score !== null && (
          <div className="text-sm">
            Score: <span className="font-semibold">{score}</span> /{" "}
            {questions.length}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <p>Loading…</p>
          ) : questions.length === 0 ? (
            <p className="text-muted-foreground">No quiz available.</p>
          ) : (
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className="rounded-lg border p-4"
                >
                  <div className="mb-3 text-sm text-muted-foreground">
                    Question {idx + 1}
                  </div>
                  <div className="text-base font-medium mb-3">{q.question}</div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {q.options.map((opt, i) => {
                      const selected = answers[q.id] === i;
                      const correct = submitted && i === q.answerIndex;
                      const wrong =
                        submitted && selected && i !== q.answerIndex;
                      return (
                        <Button
                          key={i}
                          variant={selected ? "default" : "outline"}
                          className={`${
                            correct ? "ring-2 ring-green-500" : ""
                          } ${
                            wrong ? "ring-2 ring-red-500" : ""
                          } justify-start`}
                          onClick={() =>
                            !submitted &&
                            setAnswers((a) => ({ ...a, [q.id]: i }))
                          }
                        >
                          {opt}
                        </Button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
              <div className="flex gap-3">
                <Button
                  onClick={submit}
                  disabled={!allAnswered || submitted || submitting}
                >
                  {submitting ? "Submitting…" : "Submit"}
                </Button>
                <Button variant="outline" onClick={reset}>
                  Reset
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
