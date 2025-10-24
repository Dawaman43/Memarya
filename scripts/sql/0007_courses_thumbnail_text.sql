-- Alter courses thumbnail column to text to allow large data URLs
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE "courses" ALTER COLUMN "thumbnail_url" TYPE text;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'thumbnailUrl'
  ) THEN
    ALTER TABLE "courses" ALTER COLUMN "thumbnailUrl" TYPE text;
  ELSE
    RAISE NOTICE 'No thumbnail column found on courses table';
  END IF;
END $$;