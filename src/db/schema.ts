import {
  integer,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { user as authUser } from "../../auth-schema";

export const coursesTable = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 256 }).notNull(),
  description: varchar({ length: 2048 }),
  thumbnailUrl: text(),
  category: varchar({ length: 64 }).default("General").notNull(),
  createdAt: timestamp().defaultNow(),
});

export const lessonsTable = pgTable("lessons", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  courseId: integer()
    .notNull()
    .references(() => coursesTable.id),
  title: varchar({ length: 256 }).notNull(),
  content: varchar({ length: 8192 }).notNull(),
  videoUrl: varchar({ length: 512 }),
  order: integer(),
  duration: integer(),
  hasQuiz: boolean().default(false).notNull(),
  quizPassingScore: integer().default(80),
  createdAt: timestamp().defaultNow(),
});

export const enrollmentsTable = pgTable("enrollments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text()
    .notNull()
    .references(() => authUser.id),
  courseId: integer()
    .notNull()
    .references(() => coursesTable.id),
  progress: integer().default(0),
  enrolledAt: timestamp().defaultNow(),
});

export const progressTable = pgTable("progress", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  enrollmentId: integer()
    .references(() => enrollmentsTable.id)
    .notNull(),
  lessonId: integer()
    .references(() => lessonsTable.id)
    .notNull(),
  completed: integer().default(0),
  updatedAt: timestamp().defaultNow(),
});

export const certificatesTable = pgTable("certificates", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text()
    .references(() => authUser.id)
    .notNull(),
  courseId: integer()
    .references(() => coursesTable.id)
    .notNull(),
  issuedAt: timestamp().defaultNow(),
  certificateUrl: varchar({ length: 512 }),
});

export const snippetsTable = pgTable("snippets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text()
    .notNull()
    .references(() => authUser.id),
  title: varchar({ length: 256 }),
  language: varchar({ length: 64 }).notNull(),
  version: varchar({ length: 64 }),
  files: text().notNull(),
  isPublic: boolean().default(false).notNull(),
  shareId: varchar({ length: 64 }),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

// Flashcards per course
export const flashcardsTable = pgTable("flashcards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  courseId: integer()
    .notNull()
    .references(() => coursesTable.id),
  front: varchar({ length: 1024 }).notNull(),
  back: varchar({ length: 2048 }).notNull(),
  createdAt: timestamp().defaultNow(),
});

// One quiz per course (simplified)
export const quizzesTable = pgTable("quizzes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  courseId: integer()
    .notNull()
    .references(() => coursesTable.id),
  title: varchar({ length: 256 }),
  createdAt: timestamp().defaultNow(),
});

export const quizQuestionsTable = pgTable("quiz_questions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  quizId: integer()
    .notNull()
    .references(() => quizzesTable.id),
  question: varchar({ length: 1024 }).notNull(),
  optionsJson: text().notNull(), // JSON array of strings
  answerIndex: integer().notNull(),
});

export const quizResultsTable = pgTable("quiz_results", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text()
    .notNull()
    .references(() => authUser.id),
  courseId: integer()
    .notNull()
    .references(() => coursesTable.id),
  quizId: integer()
    .notNull()
    .references(() => quizzesTable.id),
  score: integer().notNull(),
  passed: boolean().default(false).notNull(),
  submittedAt: timestamp().defaultNow(),
});

// Components attached to lessons (quiz, terminal, ide, integrated-quiz, etc.)
export const lessonComponentsTable = pgTable("lesson_components", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  lessonId: integer()
    .notNull()
    .references(() => lessonsTable.id),
  type: varchar({ length: 64 }).notNull(),
  configJson: text(), // arbitrary JSON configuration for the component
  order: integer(),
  createdAt: timestamp().defaultNow(),
});
