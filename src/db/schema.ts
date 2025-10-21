import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

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
