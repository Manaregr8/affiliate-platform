import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LEAD_STATUS_VALUES } from "@/lib/lead-status";

const updateSchema = z.object({
  studentId: z.string().min(1, "studentId is required"),
  leadStatus: z.enum(LEAD_STATUS_VALUES),
});

export async function PATCH(request: Request) {
  try {
    // Ensure the caller is an authenticated counsellor.
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "counsellor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const payload = updateSchema.parse(await request.json());

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Load the student plus affiliated partner for token accounting.
      const student = await tx.student.findUnique({
        where: { id: payload.studentId },
        include: {
          affiliator: {
            include: {
              superAffiliator: true,
            },
          },
        },
      });

      if (!student) {
        return { status: 404 as const, error: "Student not found" };
      }

      if (student.leadStatus === payload.leadStatus) {
        return { status: 200 as const, student, tokensAwarded: 0 };
      }

  let tokensAwarded = 0;
  let superTokensAwarded = 0;

      // Update the student status first.
      const updatedStudent = await tx.student.update({
        where: { id: student.id },
        data: { leadStatus: payload.leadStatus },
      });

      // Credit tokens only on first transition to admitted.
      if (payload.leadStatus === "admitted" && student.leadStatus !== "admitted") {
        await tx.affiliate.update({
          where: { id: student.affiliatorId },
          data: { tokenBalance: { increment: 4000 } },
        });
        tokensAwarded = 4000;

        const relatedSuper = student.affiliator?.superAffiliator;
        if (relatedSuper) {
          await tx.superAffiliator.update({
            where: { id: relatedSuper.id },
            data: { tokenBalance: { increment: 500 } },
          });
          superTokensAwarded = 500;
        }
      }

      return { status: 200 as const, student: updatedStudent, tokensAwarded, superTokensAwarded };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

  return NextResponse.json(result, { status: result.status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error("Failed to update lead status", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
