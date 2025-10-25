// Shared type definitions
export interface Lesson {
  id: number;
  courseId?: number;
  title: string;
  content?: string;
  videoId?: string;
  videoUrl?: string;
  duration?: number;
  completed?: boolean;
  description?: string;
  hasQuiz?: boolean;
  quizPassingScore?: number;
  createdAt?: Date;
  thumbnailUrl?: string;
  order?: number;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  category: string;
  createdAt?: Date;
  duration?: number;
  progress?: number;
}
