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
