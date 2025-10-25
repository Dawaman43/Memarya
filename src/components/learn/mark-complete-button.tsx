"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// Define props interface to include className
interface MarkCompleteButtonProps {
  lessonId: number;
  courseId: number;
  className?: string; // Optional className prop
}

export default function MarkCompleteButton({
  lessonId,
  courseId,
  className,
}: MarkCompleteButtonProps) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [requiresQuiz, setRequiresQuiz] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [checkingQuiz, setCheckingQuiz] = useState(true);

  useEffect(() => {
    // Check if lesson requires quiz and if user has passed it
    const checkQuizStatus = async () => {
      try {
        const res = await fetch(`/api/learn/${courseId}/${lessonId}`);
        if (res.ok) {
          const data = await res.json();
          const lesson = data.lesson;
          if (lesson.hasQuiz) {
            setRequiresQuiz(true);
            // Check if user has passed the quiz
            const quizRes = await fetch(`/api/learn/${courseId}/quiz-results`);
            if (quizRes.ok) {
              const quizData = await quizRes.json();
              const passed = quizData.results?.some(
                (result: any) =>
                  result.passed && result.score >= lesson.quizPassingScore
              );
              setQuizPassed(passed || false);
            }
          }
        }
      } catch (error) {
        console.error("Error checking quiz status:", error);
      } finally {
        setCheckingQuiz(false);
      }
    };

    checkQuizStatus();
  }, [lessonId, courseId]);

  const handleComplete = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed: true }),
      });

      if (res.ok) {
        const data = await res.json();
        setDone(true);
        if (data.certificateUrl) {
          toast.success("Course completed! Certificate issued.");
        } else {
          toast.success("Lesson completed!");
        }
      } else {
        const error = await res.json();
        if (error.requiresQuiz) {
          toast.error(
            `Quiz must be passed (minimum ${error.quizPassingScore}%) to complete this lesson`
          );
        } else {
          toast.error("Failed to complete lesson");
        }
      }
    } catch (error) {
      toast.error("Failed to complete lesson");
    } finally {
      setSaving(false);
    }
  };

  if (checkingQuiz) {
    return (
      <Button disabled className={className}>
        Loading...
      </Button>
    );
  }

  if (requiresQuiz && !quizPassed) {
    return (
      <Button disabled className={className}>
        Complete Quiz First
      </Button>
    );
  }

  return (
    <Button
      disabled={saving || done}
      onClick={handleComplete}
      className={className}
    >
      {done ? "Completed" : saving ? "Saving…" : "Mark complete"}
    </Button>
  );
}
