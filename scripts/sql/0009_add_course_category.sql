-- Add category column to courses with default and not null
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "category" varchar(64) DEFAULT 'General';
UPDATE "courses" SET "category" = 'General' WHERE "category" IS NULL;
ALTER TABLE "courses" ALTER COLUMN "category" SET NOT NULL;