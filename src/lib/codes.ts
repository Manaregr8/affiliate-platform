import { prisma } from "@/lib/prisma";

function randomString(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length).toLowerCase();
}

export async function generateUniqueAffiliateIdentifiers() {
  // Generate a unique referral code and reuse it internally as coupon fallback.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const referralCode = randomString(10);

    const existing = await prisma.affiliate.findFirst({
      where: {
        OR: [{ couponCode: referralCode.toUpperCase() }, { referralLink: referralCode }],
      },
      select: { id: true },
    });

    if (!existing) {
      return {
        referralCode,
        couponCode: referralCode.toUpperCase(),
      };
    }
  }

  throw new Error("Failed to generate unique affiliate identifiers");
}

export async function generateUniqueSuperReferralCode() {
  // Super affiliators use shorter referral codes meant for human sharing.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const referralCode = randomString(8);

    const existing = await prisma.superAffiliator.findUnique({
      where: { referralCode },
      select: { id: true },
    });

    if (!existing) {
      return referralCode;
    }
  }

  throw new Error("Failed to generate unique super affiliator referral code");
}
