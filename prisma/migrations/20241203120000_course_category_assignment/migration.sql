-- Add storage for the student's initial interest category and allow confirmed course names to be optional.
ALTER TABLE "Student" ADD COLUMN "courseCategory" TEXT;

-- Backfill interest categories from the legacy course column so existing data stays intact.
UPDATE "Student" SET "courseCategory" = COALESCE("course", 'General Interest');

ALTER TABLE "Student" ALTER COLUMN "courseCategory" SET NOT NULL;
ALTER TABLE "Student" ALTER COLUMN "course" DROP NOT NULL;
