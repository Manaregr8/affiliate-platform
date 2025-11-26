import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const payoutRequestSchema = z
  .object({
    amount: z.number().int().min(4000, "Minimum payout is 4000 tokens"),
    payoutReference: z
      .string()
      .trim()
      .min(1, "Enter your UPI ID or payment link.")
      .refine((value) => {
        if (!value) {
          return false;
        }

        const normalized = value.trim();

        if (normalized.toLowerCase().startsWith("http://") || normalized.toLowerCase().startsWith("https://")) {
          try {
            new URL(normalized);
            return true;
          } catch (_error) {
            return false;
          }
        }

        return true;
      }, "Enter your UPI ID or payment link."),
  })
  .refine((data) => data.amount % 4000 === 0, {
    message: "Payout amount must be in 4000-token increments",
    path: ["amount"],
  });

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "affiliator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

  const payload = payoutRequestSchema.parse(await request.json());
  const payoutReference = payload.payoutReference.trim();

    const affiliate = await prisma.affiliate.findUnique({
      where: { userId: session.user.id },
    });

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate profile not found" }, { status: 404 });
    }

    if (affiliate.tokenBalance < payload.amount) {
      return NextResponse.json({ error: "Insufficient token balance" }, { status: 400 });
    }

    const existingPending = await prisma.payoutRequest.findFirst({
      where: { affiliatorId: affiliate.id, status: "pending" },
    });

    if (existingPending) {
      return NextResponse.json(
        { error: "A payout request is already pending approval" },
        { status: 409 },
      );
    }

    const payout = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.payoutRequest.create({
        data: {
          affiliatorId: affiliate.id,
          amount: payload.amount,
          qrCodeURL: payoutReference,
        },
      });
    });

    return NextResponse.json({ payout }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error("Failed to submit payout request", error);
    return NextResponse.json({ error: "Failed to request payout" }, { status: 500 });
  }
}
