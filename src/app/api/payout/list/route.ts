import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "counsellor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const payouts = await prisma.payoutRequest.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      include: {
        affiliator: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        superAffiliator: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    const formatted = payouts.map((payout: (typeof payouts)[number]) => ({
      id: payout.id,
      amount: payout.amount,
      payoutReference: payout.qrCodeURL,
      createdAt: payout.createdAt,
      type: payout.affiliatorId ? "affiliator" : "super-affiliator",
      affiliator: payout.affiliator
        ? {
            id: payout.affiliatorId,
            name: payout.affiliator.user.name,
            email: payout.affiliator.user.email,
          }
        : null,
      superAffiliator: payout.superAffiliator
        ? {
            id: payout.superAffiliatorId,
            name: payout.superAffiliator.user.name,
            email: payout.superAffiliator.user.email,
          }
        : null,
    }));

    return NextResponse.json({ payouts: formatted }, { status: 200 });
  } catch (error) {
    console.error("Failed to list payout requests", error);
    return NextResponse.json({ error: "Failed to fetch payout requests" }, { status: 500 });
  }
}
