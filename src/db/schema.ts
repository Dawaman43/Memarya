import { boolean, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 256 }).notNull(),
  email: varchar({ length: 256 }).notNull().unique(),
  passwordHash: varchar({ length: 512 }).notNull(),
  createdAt: timestamp().defaultNow(),
});

export const coursesTable = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 256 }).notNull(),
  description: varchar({ length: 2048 }),
  thumbnailUrl: varchar({ length: 512 }),
  createdAt: timestamp().defaultNow(),
});

export const modulesTable = pgTable("modules", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  courseId: integer()
    .notNull()
    .references(() => coursesTable.id),
  title: varchar({ length: 256 }).notNull(),
  description: text(),
  order: integer().notNull().default(0),
  createdAt: timestamp().defaultNow(),
});

export const lessonsTable = pgTable("lessons", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  courseId: integer()
    .notNull()
    .references(() => coursesTable.id),
  moduleId: integer().references(() => modulesTable.id),
  title: varchar({ length: 256 }).notNull(),
  content: text().notNull(),
  videoUrl: varchar({ length: 512 }),
  order: integer().notNull().default(0),
  duration: integer(),
  createdAt: timestamp().defaultNow(),
});

export const enrollmentsTable = pgTable("enrollments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
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
  userId: integer()
    .references(() => usersTable.id)
    .notNull(),
  courseId: integer()
    .references(() => coursesTable.id)
    .notNull(),
  issuedAt: timestamp().defaultNow(),
  certificateUrl: varchar({ length: 512 }),
});

export const quizzesTable = pgTable("quizzes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  lessonId: integer()
    .notNull()
    .references(() => lessonsTable.id),
  title: varchar({ length: 256 }).notNull(),
  description: text(),
  passingScore: integer().notNull().default(70),
  createdAt: timestamp().defaultNow(),
});

export const questionsTable = pgTable("questions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  quizId: integer()
    .notNull()
    .references(() => quizzesTable.id),
  questionText: text().notNull(),
  questionType: varchar({ length: 50 }).notNull(),
  order: integer().notNull().default(0),
  points: integer().notNull().default(1),
  createdAt: timestamp().defaultNow(),
});

export const answerOptionsTable = pgTable("answer_options", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  questionId: integer()
    .notNull()
    .references(() => questionsTable.id),
  optionText: text().notNull(),
  isCorrect: boolean().notNull().default(false),
  order: integer().notNull().default(0),
});

export const quizAttemptsTable = pgTable("quiz_attempts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  quizId: integer()
    .notNull()
    .references(() => quizzesTable.id),
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
  score: integer().notNull().default(0),
  totalPoints: integer().notNull(),
  passed: boolean().notNull().default(false),
  startedAt: timestamp().defaultNow(),
  completedAt: timestamp(),
});

export const questionAnswersTable = pgTable("question_answers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  attemptId: integer()
    .notNull()
    .references(() => quizAttemptsTable.id),
  questionId: integer()
    .notNull()
    .references(() => questionsTable.id),
  selectedOptionId: integer().references(() => answerOptionsTable.id),
  isCorrect: boolean().notNull().default(false),
  pointsEarned: integer().notNull().default(0),
});
