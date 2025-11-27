import type { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { generateUniqueSuperReferralCode } from "@/lib/codes";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

const registrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

async function handlePOST(request: Request) {
  try {
    const payload = registrationSchema.parse(await request.json());
    const normalizedEmail = payload.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hash(payload.password, 10);
    const referralCode = await generateUniqueSuperReferralCode();

    const { superAffiliator } = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdUser = await tx.user.create({
        data: {
          name: payload.name.trim(),
          email: normalizedEmail,
          role: "super-affiliator",
          passwordHash,
        },
      });

      const createdSuper = await tx.superAffiliator.create({
        data: {
          userId: createdUser.id,
          referralCode,
        },
        include: {
          user: true,
        },
      });

      return { superAffiliator: createdSuper };
    });

    return NextResponse.json({ superAffiliator }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Account already exists" }, { status: 409 });
    }

    console.error("Failed to register super affiliator", error);
    return NextResponse.json({ error: "Failed to register super affiliator" }, { status: 500 });
  }
}

// Apply rate limiting: 3 super-affiliator registration attempts per 15 minutes per IP
export const POST = withRateLimit(
  { maxRequests: 3, windowMs: 15 * 60 * 1000 },
  handlePOST
);
