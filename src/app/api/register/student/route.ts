import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const phoneRegex = /^[0-9+()\-\s]{7,15}$/;

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(phoneRegex, "Enter a valid phone number"),
  courseCategory: z.string().min(1, "Course category is required"),
  referralCode: z.string().min(1, "Referral code is required"),
});

export async function POST(request: Request) {
  try {
    // Parse the payload and guard against malformed submissions.
    const payload = registerSchema.parse(await request.json());
    const normalizedEmail = payload.email.trim().toLowerCase();
    const normalizedReferralCode = payload.referralCode.trim().toLowerCase();
    const normalizedCategory = payload.courseCategory.trim();

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

    const categoryExists = await prisma.courseCommission.findFirst({
      where: {
        category: {
          equals: normalizedCategory,
          mode: "insensitive",
        },
      },
      select: { category: true },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { success: false, message: "Select a valid course category" },
        { status: 400 },
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
        courseCategory: categoryExists.category,
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
