"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Quiz {
  id: number;
  title: string | null;
  courseId: number;
}

interface ComponentConfig {
  quizId?: number;
  // optional local questions for lesson-level quizzes
  questions?: Array<{
    id?: number;
    question: string;
    optionsJson: string;
    answerIndex: number;
  }>;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
  videoUrl?: string;
  textContent?: string;
  assignmentInstructions?: string;
  discussionTopic?: string;
  codeTemplate?: string;
  expectedOutput?: string;
  points?: number;
  dueDate?: string;
  maxAttempts?: number;
}

interface EditComponentModalProps {
  componentId: number;
  componentType: string;
  currentConfig: ComponentConfig;
  onSave: (config: ComponentConfig) => void;
  courseId?: number;
  trigger: React.ReactNode;
}

export function EditComponentModal({
  componentId,
  componentType,
  currentConfig,
  onSave,
  trigger,
  courseId,
}: EditComponentModalProps) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ComponentConfig>(currentConfig);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  // local questions when using lesson-local quiz (stored in config.questions)
  const [localQuestions, setLocalQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState<string[]>(["", "", "", ""]);
  const [newAnswerIndex, setNewAnswerIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // When modal opens, initialize local config and load quizzes (and questions if applicable)
  useEffect(() => {
    if (!open) return;

    // initialize local config from the current prop (in case it changed since last open)
    setConfig(currentConfig || {});

    // If this component either is a quiz type or already contains questions in its config,
    // load quiz lists and questions so the admin can manage them.
    const shouldInitQuiz =
      componentType === "quiz" ||
      componentType === "integrated-quiz" ||
      (currentConfig && Array.isArray(currentConfig.questions));

    if (!shouldInitQuiz) return;

    // load quizzes, then load questions if a quiz is already selected
    (async () => {
      try {
        const res = await fetch("/api/admin/quizzes", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const qs: Quiz[] = data.quizzes || [];
        setQuizzes(qs);

        const selectedQuizId = currentConfig?.quizId;
        if (selectedQuizId) {
          const quiz = qs.find((q) => q.id === Number(selectedQuizId));
          if (quiz) {
            const r = await fetch(`/api/admin/courses/${quiz.courseId}/quiz`, {
              cache: "no-store",
            });
            if (!r.ok) return;
            const d = await r.json();
            setQuizQuestions(d.questions || []);
          }
        } else {
          // initialize local questions if present on the component config
          const local = currentConfig?.questions || [];
          setLocalQuestions(local || []);
        }
      } catch (err) {
        // swallow
      }
    })();
  }, [open, componentType, currentConfig]);

  // When a quiz is selected, load its questions (we can derive courseId from quizzes list)
  useEffect(() => {
    async function loadQuestions() {
      const qid = config.quizId;
      if (!qid) {
        setQuizQuestions([]);
        // use local questions from config when there is no linked quiz
        try {
          const local = config?.questions || [];
          setLocalQuestions(local || []);
        } catch (e) {
          setLocalQuestions([]);
        }
        return;
      }
      const quiz = quizzes.find((q) => q.id === Number(qid));
      if (!quiz) return;
      const res = await fetch(`/api/admin/courses/${quiz.courseId}/quiz`);
      if (!res.ok) return;
      const data = await res.json();
      setQuizQuestions(data.questions || []);
    }
    loadQuestions();
  }, [config.quizId, quizzes]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // attach localQuestions into config when present
      const cfgToSave = { ...config } as any;
      if (!cfgToSave.quizId) {
        cfgToSave.questions = localQuestions || [];
      }

      const res = await fetch(`/api/admin/lessons/components/${componentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configJson: JSON.stringify(cfgToSave) }),
      });
      if (res.ok) {
        onSave(cfgToSave);
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {componentType} Component</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Quiz-specific fields (support both course-level quiz and integrated-quiz) */}
          {(componentType === "quiz" ||
            componentType === "integrated-quiz") && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quiz" className="text-right">
                  Quiz
                </Label>
                <Select
                  value={config.quizId?.toString() || ""}
                  onValueChange={(value) =>
                    setConfig({ ...config, quizId: Number(value) })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a quiz" />
                  </SelectTrigger>
                  <SelectContent>
                    {quizzes.map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id.toString()}>
                        {quiz.title || `Quiz ${quiz.id}`} (Course{" "}
                        {quiz.courseId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* If no quiz is selected, allow creating one for this course (if courseId provided) */}
              {!config.quizId && courseId && (
                <div className="col-span-4">
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        const res = await fetch(
                          `/api/admin/courses/${courseId}/quiz`,
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              title: `Course ${courseId} Quiz`,
                            }),
                          }
                        );
                        if (!res.ok) return;
                        const data = await res.json();
                        const created = data.quiz;
                        if (created) {
                          // add to local quizzes and select it
                          setQuizzes((s) => [created, ...(s || [])]);
                          setConfig({ ...config, quizId: created.id });
                          setQuizQuestions([]);
                        }
                      } catch (e) {
                        // ignore
                      }
                    }}
                  >
                    Create quiz for this course
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="timeLimit" className="text-right">
                  Time Limit (min)
                </Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={config.timeLimit || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      timeLimit: Number(e.target.value) || undefined,
                    })
                  }
                  className="col-span-3"
                  placeholder="Optional time limit in minutes"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="passingScore" className="text-right">
                  Passing Score (%)
                </Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={config.passingScore || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      passingScore: Number(e.target.value) || undefined,
                    })
                  }
                  className="col-span-3"
                  placeholder="Default: 80"
                />
              </div>

              {/* Quiz question management when a quiz is selected */}
              {config.quizId && (
                <div className="border rounded p-3 space-y-3">
                  <h3 className="font-medium">Manage Questions</h3>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Question text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      rows={2}
                    />
                    <div className="space-y-2">
                      {newOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="modal-correct-answer"
                            checked={newAnswerIndex === idx}
                            onChange={() => setNewAnswerIndex(idx)}
                            className="w-4 h-4"
                          />
                          <Input
                            placeholder={`Option ${idx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const updated = [...newOptions];
                              updated[idx] = e.target.value;
                              setNewOptions(updated);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          if (
                            !newQuestion.trim() ||
                            newOptions.some((o) => !o.trim())
                          )
                            return;
                          const quiz = quizzes.find(
                            (q) => q.id === Number(config.quizId)
                          );
                          if (!quiz) return;
                          const res = await fetch(
                            `/api/admin/courses/${quiz.courseId}/quiz/questions`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                question: newQuestion.trim(),
                                optionsJson: JSON.stringify(
                                  newOptions.map((o) => o.trim())
                                ),
                                answerIndex: newAnswerIndex,
                              }),
                            }
                          );
                          if (res.ok) {
                            setNewQuestion("");
                            setNewOptions(["", "", "", ""]);
                            setNewAnswerIndex(0);
                            // reload questions
                            const r2 = await fetch(
                              `/api/admin/courses/${quiz.courseId}/quiz`
                            );
                            if (r2.ok) {
                              const d = await r2.json();
                              setQuizQuestions(d.questions || []);
                            }
                          }
                        }}
                      >
                        Add Question
                      </Button>
                    </div>

                    {/* Existing questions */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {quizQuestions.length > 0 ? (
                        quizQuestions.map((q) => (
                          <div
                            key={q.id}
                            className="border rounded p-2 flex items-start justify-between gap-2"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm mb-1">
                                {q.question}
                              </div>
                              <div className="space-y-1 text-sm">
                                {JSON.parse(q.optionsJson).map(
                                  (opt: string, i: number) => (
                                    <div
                                      key={i}
                                      className={`p-1 rounded ${
                                        i === q.answerIndex
                                          ? "bg-green-50 text-green-800"
                                          : "bg-gray-50"
                                      }`}
                                    >
                                      {i === q.answerIndex ? "✓ " : ""}
                                      {opt}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={async () => {
                                  const quiz = quizzes.find(
                                    (qq) => qq.id === Number(config.quizId)
                                  );
                                  if (!quiz) return;
                                  const res = await fetch(
                                    `/api/admin/courses/${quiz.courseId}/quiz/questions`,
                                    {
                                      method: "DELETE",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({ id: q.id }),
                                    }
                                  );
                                  if (res.ok) {
                                    const r2 = await fetch(
                                      `/api/admin/courses/${quiz.courseId}/quiz`
                                    );
                                    if (r2.ok) {
                                      const d = await r2.json();
                                      setQuizQuestions(d.questions || []);
                                    }
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No questions yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* If no quizId is selected, allow lesson-local quiz questions stored in component config */}
              {!config.quizId && (
                <div className="border rounded p-3 space-y-3">
                  <h3 className="font-medium">Manage Lesson-local Questions</h3>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Question text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      rows={2}
                    />
                    <div className="space-y-2">
                      {newOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="modal-local-correct-answer"
                            checked={newAnswerIndex === idx}
                            onChange={() => setNewAnswerIndex(idx)}
                            className="w-4 h-4"
                          />
                          <Input
                            placeholder={`Option ${idx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const updated = [...newOptions];
                              updated[idx] = e.target.value;
                              setNewOptions(updated);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          if (
                            !newQuestion.trim() ||
                            newOptions.some((o) => !o.trim())
                          )
                            return;
                          const q = {
                            id: Date.now(),
                            question: newQuestion.trim(),
                            optionsJson: JSON.stringify(
                              newOptions.map((o) => o.trim())
                            ),
                            answerIndex: newAnswerIndex,
                          };
                          const updated = [...(localQuestions || []), q];
                          setLocalQuestions(updated);
                          setNewQuestion("");
                          setNewOptions(["", "", "", ""]);
                          setNewAnswerIndex(0);
                        }}
                      >
                        Add Question
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {localQuestions.length > 0 ? (
                        localQuestions.map((q) => (
                          <div
                            key={q.id}
                            className="border rounded p-2 flex items-start justify-between gap-2"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm mb-1">
                                {q.question}
                              </div>
                              <div className="space-y-1 text-sm">
                                {JSON.parse(q.optionsJson).map(
                                  (opt: string, i: number) => (
                                    <div
                                      key={i}
                                      className={`p-1 rounded ${
                                        i === q.answerIndex
                                          ? "bg-green-50 text-green-800"
                                          : "bg-gray-50"
                                      }`}
                                    >
                                      {i === q.answerIndex ? "✓ " : ""}
                                      {opt}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  const remaining = (
                                    localQuestions || []
                                  ).filter((x) => x.id !== q.id);
                                  setLocalQuestions(remaining);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No questions yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Video component fields */}
          {componentType === "video" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="videoUrl" className="text-right">
                Video URL
              </Label>
              <Input
                id="videoUrl"
                value={config.videoUrl || ""}
                onChange={(e) =>
                  setConfig({ ...config, videoUrl: e.target.value })
                }
                className="col-span-3"
                placeholder="YouTube URL or direct video link"
              />
            </div>
          )}

          {/* Text/Reading component fields */}
          {componentType === "text" && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="textContent" className="text-right pt-2">
                Content
              </Label>
              <Textarea
                id="textContent"
                value={config.textContent || ""}
                onChange={(e) =>
                  setConfig({ ...config, textContent: e.target.value })
                }
                className="col-span-3"
                placeholder="Reading content or instructions"
                rows={4}
              />
            </div>
          )}

          {/* Assignment component fields */}
          {componentType === "assignment" && (
            <>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label
                  htmlFor="assignmentInstructions"
                  className="text-right pt-2"
                >
                  Instructions
                </Label>
                <Textarea
                  id="assignmentInstructions"
                  value={config.assignmentInstructions || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      assignmentInstructions: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="Assignment instructions and requirements"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="points" className="text-right">
                  Points
                </Label>
                <Input
                  id="points"
                  type="number"
                  value={config.points || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      points: Number(e.target.value) || undefined,
                    })
                  }
                  className="col-span-3"
                  placeholder="Points for this assignment"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={config.dueDate || ""}
                  onChange={(e) =>
                    setConfig({ ...config, dueDate: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            </>
          )}

          {/* Discussion component fields */}
          {componentType === "discussion" && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="discussionTopic" className="text-right pt-2">
                Topic
              </Label>
              <Textarea
                id="discussionTopic"
                value={config.discussionTopic || ""}
                onChange={(e) =>
                  setConfig({ ...config, discussionTopic: e.target.value })
                }
                className="col-span-3"
                placeholder="Discussion topic or question"
                rows={3}
              />
            </div>
          )}

          {/* Code Challenge component fields */}
          {componentType === "code-challenge" && (
            <>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="codeTemplate" className="text-right pt-2">
                  Code Template
                </Label>
                <Textarea
                  id="codeTemplate"
                  value={config.codeTemplate || ""}
                  onChange={(e) =>
                    setConfig({ ...config, codeTemplate: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Starting code template"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="expectedOutput" className="text-right pt-2">
                  Expected Output
                </Label>
                <Textarea
                  id="expectedOutput"
                  value={config.expectedOutput || ""}
                  onChange={(e) =>
                    setConfig({ ...config, expectedOutput: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Expected output or test cases"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxAttempts" className="text-right">
                  Max Attempts
                </Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  value={config.maxAttempts || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maxAttempts: Number(e.target.value) || undefined,
                    })
                  }
                  className="col-span-3"
                  placeholder="Maximum submission attempts"
                />
              </div>
            </>
          )}

          {/* Common description field */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={config.description || ""}
              onChange={(e) =>
                setConfig({ ...config, description: e.target.value })
              }
              className="col-span-3"
              placeholder="Optional description for learners"
              rows={2}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
