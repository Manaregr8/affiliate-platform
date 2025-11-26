import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const approveSchema = z.object({
  payoutRequestId: z.string().min(1, "payoutRequestId is required"),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "counsellor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const payload = approveSchema.parse(await request.json());

    const outcome = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const payout = await tx.payoutRequest.findUnique({
        where: { id: payload.payoutRequestId },
        include: {
          affiliator: true,
          superAffiliator: true,
        },
      });

      if (!payout) {
        return { status: 404 as const, error: "Payout request not found" };
      }

      if (payout.status !== "pending") {
        return { status: 400 as const, error: "Payout already processed" };
      }

      if (payout.affiliatorId) {
        if (!payout.affiliator || payout.affiliator.tokenBalance < payout.amount) {
          return { status: 400 as const, error: "Insufficient tokens to approve payout" };
        }

        const [updatedAffiliate, updatedPayout] = await Promise.all([
          tx.affiliate.update({
            where: { id: payout.affiliatorId },
            data: { tokenBalance: { decrement: payout.amount } },
          }),
          tx.payoutRequest.update({
            where: { id: payout.id },
            data: { status: "approved" },
          }),
        ]);

        return { status: 200 as const, payout: updatedPayout, affiliate: updatedAffiliate };
      }

      if (payout.superAffiliatorId) {
        if (!payout.superAffiliator || payout.superAffiliator.tokenBalance < payout.amount) {
          return { status: 400 as const, error: "Insufficient tokens to approve payout" };
        }

        const [updatedSuper, updatedPayout] = await Promise.all([
          tx.superAffiliator.update({
            where: { id: payout.superAffiliatorId },
            data: { tokenBalance: { decrement: payout.amount } },
          }),
          tx.payoutRequest.update({
            where: { id: payout.id },
            data: { status: "approved" },
          }),
        ]);

        return { status: 200 as const, payout: updatedPayout, superAffiliator: updatedSuper };
      }

      return { status: 400 as const, error: "Unknown payout requester" };
    });

    if ("error" in outcome) {
      return NextResponse.json({ error: outcome.error }, { status: outcome.status });
    }

    return NextResponse.json(outcome, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error("Failed to approve payout", error);
    return NextResponse.json({ error: "Failed to approve payout" }, { status: 500 });
  }
}
