CREATE TABLE IF NOT EXISTS "snippets" (
	"id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	"user_id" text NOT NULL REFERENCES "user"("id"),
	"title" varchar(256),
	"language" varchar(64) NOT NULL,
	"version" varchar(64),
	"files" text NOT NULL, -- JSON encoded array of {name, content}
	"is_public" boolean DEFAULT false NOT NULL,
	"share_id" varchar(64),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "snippets_share_id_idx" ON "snippets" ("share_id");