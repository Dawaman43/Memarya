"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";

interface QuizQuestion {
  id: number;
  question: string;
  optionsJson: string;
  answerIndex: number;
}

interface QuizComponentProps {
  courseId: number;
  lessonId: number;
  onComplete?: (score: number, passed: boolean) => void;
}

export function QuizComponent({
  courseId,
  lessonId,
  onComplete,
}: QuizComponentProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [courseId]);

  const loadQuiz = async () => {
    try {
      const res = await fetch(`/api/learn/${courseId}/quiz`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        // Initialize answers object
        const initialAnswers: Record<number, number> = {};
        (data.questions || []).forEach((q: QuizQuestion) => {
          initialAnswers[q.id] = -1;
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error("Failed to load quiz:", error);
      toast.error("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleSubmit = async () => {
    const unanswered = questions.some((q) => answers[q.id] === -1);
    if (unanswered) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/learn/${courseId}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (res.ok) {
        const data = await res.json();
        setShowResults(true);
        if (onComplete) {
          onComplete(data.score, data.passed);
        }
      } else {
        toast.error("Failed to submit quiz");
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading quiz...</div>;
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No quiz questions available for this course.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const correctAnswers = questions.reduce((count, q) => {
      return count + (answers[q.id] === q.answerIndex ? 1 : 0);
    }, 0);
    const score = Math.round((correctAnswers / questions.length) * 100);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{score}%</div>
            <Progress value={score} className="mb-4" />
            <p className="text-lg">
              {correctAnswers} out of {questions.length} correct
            </p>
            <p
              className={`text-lg font-semibold ${
                score >= 80 ? "text-green-600" : "text-red-600"
              }`}
            >
              {score >= 80 ? "Passed!" : "Failed - Try again"}
            </p>
          </div>

          <div className="space-y-3">
            {questions.map((q) => {
              const userAnswer = answers[q.id];
              const correctAnswer = q.answerIndex;
              const options = JSON.parse(q.optionsJson);

              return (
                <div key={q.id} className="border rounded p-3">
                  <p className="font-medium mb-2">{q.question}</p>
                  <div className="space-y-1">
                    {options.map((option: string, optIndex: number) => (
                      <div
                        key={optIndex}
                        className={`p-2 rounded text-sm ${
                          optIndex === correctAnswer
                            ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                            : optIndex === userAnswer &&
                              optIndex !== correctAnswer
                            ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                            : "bg-gray-50 dark:bg-gray-800"
                        }`}
                      >
                        {optIndex === correctAnswer && "✓ "}
                        {optIndex === userAnswer &&
                          optIndex !== correctAnswer &&
                          "✗ "}
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const options = JSON.parse(question.optionsJson);
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quiz</CardTitle>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{question.question}</h3>
          <RadioGroup
            value={answers[question.id]?.toString()}
            onValueChange={(value) =>
              handleAnswerSelect(question.id, parseInt(value))
            }
          >
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={index.toString()}
                  id={`option-${index}`}
                />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          {currentQuestion < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={answers[question.id] === -1}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={Object.values(answers).includes(-1) || submitting}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
