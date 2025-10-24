-- Alter courses.thumbnailUrl (camelCase) to text to allow large data URLs
ALTER TABLE "courses"
  ALTER COLUMN "thumbnailUrl" TYPE text;