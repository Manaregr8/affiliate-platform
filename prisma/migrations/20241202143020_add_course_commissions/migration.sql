-- CreateTable
CREATE TABLE "CourseCommission" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "durationLabel" TEXT NOT NULL,
    "actualFees" INTEGER NOT NULL,
    "generalDiscountedFees" INTEGER NOT NULL,
    "generalDiscountTarget" INTEGER NOT NULL,
    "affiliationDiscount" INTEGER NOT NULL,
    "affiliatorTokens" INTEGER NOT NULL,
    "superAffiliatorTokens" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseCommission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseCommission_slug_key" ON "CourseCommission"("slug");

-- AlterTable
ALTER TABLE "Student" ADD COLUMN "courseSlug" TEXT;

-- Optional index to speed up lookups
CREATE INDEX "Student_courseSlug_idx" ON "Student"("courseSlug");
