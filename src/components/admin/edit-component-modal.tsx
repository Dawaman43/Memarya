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
  trigger: React.ReactNode;
}

export function EditComponentModal({
  componentId,
  componentType,
  currentConfig,
  onSave,
  trigger,
}: EditComponentModalProps) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ComponentConfig>(currentConfig);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && componentType === "quiz") {
      fetch("/api/admin/quizzes")
        .then((res) => res.json())
        .then((data) => setQuizzes(data.quizzes || []));
    }
  }, [open, componentType]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/lessons/components/${componentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configJson: JSON.stringify(config) }),
      });
      if (res.ok) {
        onSave(config);
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
          {/* Quiz-specific fields */}
          {componentType === "quiz" && (
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
