import type { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { generateUniqueAffiliateIdentifiers } from "@/lib/codes";
import { prisma } from "@/lib/prisma";

const registrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  superReferral: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const payload = registrationSchema.parse(await request.json());
    const normalizedEmail = payload.email.trim().toLowerCase();
    const normalizedSuperReferral = payload.superReferral?.trim().toLowerCase() ?? "";

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hash(payload.password, 10);

    const identifiers = await generateUniqueAffiliateIdentifiers();

    let superAffiliatorId: string | undefined;
    if (normalizedSuperReferral) {
      const superAffiliator = await prisma.superAffiliator.findUnique({
        where: { referralCode: normalizedSuperReferral },
        select: { id: true },
      });

      if (!superAffiliator) {
        return NextResponse.json({ error: "Invalid super affiliator referral code" }, { status: 400 });
      }

      superAffiliatorId = superAffiliator.id;
    }

    const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdUser = await tx.user.create({
        data: {
          name: payload.name.trim(),
          email: normalizedEmail,
          role: "affiliator",
          passwordHash,
          affiliate: {
            create: {
              couponCode: identifiers.couponCode,
              referralLink: identifiers.referralCode,
              superAffiliatorId,
            },
          },
        },
        include: {
          affiliate: true,
        },
      });

      return createdUser;
    });

  return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Account already exists" }, { status: 409 });
    }

    console.error("Failed to register affiliator", error);
    return NextResponse.json({ error: "Failed to register affiliator" }, { status: 500 });
  }
}
