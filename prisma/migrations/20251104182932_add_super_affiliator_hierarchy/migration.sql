-- AlterTable
ALTER TABLE "Affiliate" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "superAffiliatorId" TEXT;

-- CreateTable
CREATE TABLE "SuperAffiliator" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "tokenBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuperAffiliator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperAffiliatorPayoutRequest" (
    "id" TEXT NOT NULL,
    "superAffiliatorId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qrCodeURL" TEXT,

    CONSTRAINT "SuperAffiliatorPayoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SuperAffiliator_userId_key" ON "SuperAffiliator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAffiliator_referralCode_key" ON "SuperAffiliator"("referralCode");

-- AddForeignKey
ALTER TABLE "SuperAffiliator" ADD CONSTRAINT "SuperAffiliator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affiliate" ADD CONSTRAINT "Affiliate_superAffiliatorId_fkey" FOREIGN KEY ("superAffiliatorId") REFERENCES "SuperAffiliator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperAffiliatorPayoutRequest" ADD CONSTRAINT "SuperAffiliatorPayoutRequest_superAffiliatorId_fkey" FOREIGN KEY ("superAffiliatorId") REFERENCES "SuperAffiliator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
