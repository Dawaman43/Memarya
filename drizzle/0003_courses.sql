CREATE TABLE IF NOT EXISTS "courses" (
	"id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	"title" varchar(256) NOT NULL,
	"description" varchar(2048),
	"thumbnail_url" varchar(512),
	"created_at" timestamp DEFAULT now()
);
--
CREATE TABLE IF NOT EXISTS "lessons" (
	"id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	"course_id" integer NOT NULL REFERENCES "courses"("id"),
	"title" varchar(256) NOT NULL,
	"content" varchar(8192) NOT NULL,
	"video_url" varchar(512),
	"order" integer,
	"duration" integer,
	"created_at" timestamp DEFAULT now()
);
--
CREATE TABLE IF NOT EXISTS "enrollments" (
	"id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	"user_id" text NOT NULL REFERENCES "user"("id"),
	"course_id" integer NOT NULL REFERENCES "courses"("id"),
	"progress" integer DEFAULT 0,
	"enrolled_at" timestamp DEFAULT now()
);
--
CREATE TABLE IF NOT EXISTS "progress" (
	"id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	"enrollment_id" integer NOT NULL REFERENCES "enrollments"("id"),
	"lesson_id" integer NOT NULL REFERENCES "lessons"("id"),
	"completed" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now()
);
--
CREATE TABLE IF NOT EXISTS "certificates" (
	"id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	"user_id" text NOT NULL REFERENCES "user"("id"),
	"course_id" integer NOT NULL REFERENCES "courses"("id"),
	"issued_at" timestamp DEFAULT now(),
	"certificate_url" varchar(512)
);
