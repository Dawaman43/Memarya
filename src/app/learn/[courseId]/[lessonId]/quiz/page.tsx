"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface Quiz {
  id: number;
  title: string | null;
  description: string | null;
}

export default function LessonQuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;
  const lessonId = params?.lessonId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/learn/${courseId}/quiz`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          router.back();
        } else {
          setQuiz(data.quiz);
          setQuestions(data.quiz.questions || []);
        }
      })
      .catch(() => {
        toast.error("Failed to load quiz");
        router.back();
      })
      .finally(() => setLoading(false));
  }, [courseId, router]);

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast.error("Please answer all questions");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/learn/${courseId}/${lessonId}/quiz/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success(`Quiz completed! Score: ${data.score}%`);
        router.back();
      } else {
        toast.error(data.error || "Failed to submit quiz");
      }
    } catch {
      toast.error("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
          <p className="text-gray-600 mb-4">
            This lesson doesn't have a quiz configured.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {quiz.title || "Lesson Quiz"}
        </h1>
        <p className="text-gray-600">
          Answer all questions to complete this lesson. You need to score at
          least 80% to pass.
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {index + 1}: {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[question.id]?.toString() || ""}
                onValueChange={(value: string) =>
                  setAnswers({ ...answers, [question.id]: Number(value) })
                }
              >
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={optionIndex.toString()}
                      id={`q${question.id}-o${optionIndex}`}
                    />
                    <Label
                      htmlFor={`q${question.id}-o${optionIndex}`}
                      className="cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Quiz"}
        </Button>
      </div>
    </div>
  );
}
