/*
  Warnings:

  - You are about to drop the `SuperAffiliatorPayoutRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."PayoutRequest" DROP CONSTRAINT "PayoutRequest_affiliatorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SuperAffiliatorPayoutRequest" DROP CONSTRAINT "SuperAffiliatorPayoutRequest_superAffiliatorId_fkey";

-- AlterTable
ALTER TABLE "PayoutRequest" ADD COLUMN     "superAffiliatorId" TEXT,
ALTER COLUMN "affiliatorId" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."SuperAffiliatorPayoutRequest";

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_affiliatorId_fkey" FOREIGN KEY ("affiliatorId") REFERENCES "Affiliate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_superAffiliatorId_fkey" FOREIGN KEY ("superAffiliatorId") REFERENCES "SuperAffiliator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
