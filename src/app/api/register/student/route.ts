import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { STUDENT_COURSE_OPTIONS } from "@/lib/course-options";

const phoneRegex = /^[0-9+()\-\s]{7,15}$/;

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(phoneRegex, "Enter a valid phone number"),
  course: z.enum(STUDENT_COURSE_OPTIONS),
  referralCode: z.string().min(1, "Referral code is required"),
});

export async function POST(request: Request) {
  try {
    // Parse the payload and guard against malformed submissions.
    const payload = registerSchema.parse(await request.json());
    const normalizedEmail = payload.email.trim().toLowerCase();
    const normalizedReferralCode = payload.referralCode.trim().toLowerCase();

    const affiliate = await prisma.affiliate.findUnique({
      where: {
        referralLink: normalizedReferralCode,
      },
    });

    if (!affiliate) {
      return NextResponse.json(
        { success: false, message: "Invalid referral link" },
        { status: 404 },
      );
    }

    // Prevent duplicate leads for the same affiliate and email.
    const existingLead = await prisma.student.findFirst({
      where: { email: normalizedEmail, affiliatorId: affiliate.id },
    });

    if (existingLead) {
      return NextResponse.json(
        { success: false, message: "Lead already exists for this email" },
        { status: 409 },
      );
    }

    // Persist the new student lead entry with an untouched status.
    const student = await prisma.student.create({
      data: {
        name: payload.name.trim(),
        email: normalizedEmail,
        phone: payload.phone.trim(),
        course: payload.course.trim(),
        affiliatorId: affiliate.id,
      },
    });

    return NextResponse.json(
      { success: true, message: "Lead registered successfully", student },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: error.issues.map((issue) => issue.message).join(", "),
        },
        { status: 400 },
      );
    }

    console.error("Failed to register student", error);
    return NextResponse.json(
      { success: false, message: "Failed to register student" },
      { status: 500 },
    );
  }
}
