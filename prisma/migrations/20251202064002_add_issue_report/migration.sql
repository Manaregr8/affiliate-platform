-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "leadStatus" SET DEFAULT 'untouched';

-- CreateTable
CREATE TABLE "IssueReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "leadCount" INTEGER,
    "daysUntouched" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IssueReport_topic_idx" ON "IssueReport"("topic");

-- CreateIndex
CREATE INDEX "IssueReport_status_idx" ON "IssueReport"("status");

-- AddForeignKey
ALTER TABLE "IssueReport" ADD CONSTRAINT "IssueReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
