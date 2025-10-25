CREATE TABLE "flashcards" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "flashcards_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"courseId" integer NOT NULL,
	"front" varchar(1024) NOT NULL,
	"back" varchar(2048) NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lesson_components" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "lesson_components_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"lessonId" integer NOT NULL,
	"type" varchar(64) NOT NULL,
	"configJson" text,
	"order" integer,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quiz_questions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"quizId" integer NOT NULL,
	"question" varchar(1024) NOT NULL,
	"optionsJson" text NOT NULL,
	"answerIndex" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_results" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quiz_results_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" text NOT NULL,
	"courseId" integer NOT NULL,
	"quizId" integer NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean DEFAULT false NOT NULL,
	"submittedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quizzes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"courseId" integer NOT NULL,
	"title" varchar(256),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "snippets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "snippets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" text NOT NULL,
	"title" varchar(256),
	"language" varchar(64) NOT NULL,
	"version" varchar(64),
	"files" text NOT NULL,
	"isPublic" boolean DEFAULT false NOT NULL,
	"shareId" varchar(64),
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "thumbnailUrl" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "enrollments" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "type" text DEFAULT 'email' NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "links" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "category" varchar(64) DEFAULT 'General' NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "hasQuiz" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "quizPassingScore" integer DEFAULT 80;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_components" ADD CONSTRAINT "lesson_components_lessonId_lessons_id_fk" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quizId_quizzes_id_fk" FOREIGN KEY ("quizId") REFERENCES "public"."quizzes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_quizId_quizzes_id_fk" FOREIGN KEY ("quizId") REFERENCES "public"."quizzes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;