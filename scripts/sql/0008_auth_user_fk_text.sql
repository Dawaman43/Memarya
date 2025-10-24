-- Migrate enrollments and certificates to reference auth `user` table with text IDs
-- Drop old FKs if they exist
ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "enrollments_userId_users_id_fk";
ALTER TABLE "certificates" DROP CONSTRAINT IF EXISTS "certificates_userId_users_id_fk";

-- Alter column types from integer -> text if needed
ALTER TABLE "enrollments" ALTER COLUMN "userId" TYPE text USING "userId"::text;
ALTER TABLE "certificates" ALTER COLUMN "userId" TYPE text USING "userId"::text;

-- Add new FKs to auth user table
ALTER TABLE "enrollments" ADD CONSTRAINT IF NOT EXISTS "enrollments_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "certificates" ADD CONSTRAINT IF NOT EXISTS "certificates_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
