import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { REPORT_TOPIC_VALUES } from "@/lib/report-topics";

const topicValues = REPORT_TOPIC_VALUES;

const numericField = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  });

const reportSchema = z.object({
  topic: z.enum(topicValues),
  description: z
    .string()
    .trim()
    .min(20, "Provide at least 20 characters")
    .max(1500, "Keep the description under 1500 characters"),
  leadCount: numericField.refine(
    (value) => value === undefined || (Number.isInteger(value) && value >= 1 && value <= 500),
    "Lead count must be between 1 and 500",
  ),
  daysUntouched: numericField.refine(
    (value) => value === undefined || (Number.isInteger(value) && value >= 1 && value <= 365),
    "Days untouched must be between 1 and 365",
  ),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "affiliator" && session.user.role !== "super-affiliator")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const payload = reportSchema.parse(await request.json());

    await prisma.issueReport.create({
      data: {
        userId: session.user.id,
        role: session.user.role,
        topic: payload.topic,
        description: payload.description.trim(),
        leadCount: payload.leadCount ?? null,
        daysUntouched: payload.daysUntouched ?? null,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error("Failed to submit issue report", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
