-- Add fields required by Better Auth Admin plugin
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banned" boolean;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ban_reason" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ban_expires" timestamp;

ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "impersonated_by" text;

ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "type" text NOT NULL DEFAULT 'email';
