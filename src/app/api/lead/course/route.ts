import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const assignSchema = z.object({
  studentId: z.string().min(1, "studentId is required"),
  courseSlug: z.string().min(1, "courseSlug is required"),
});

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "counsellor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const payload = assignSchema.parse(await request.json());

    const student = await prisma.student.findUnique({
      where: { id: payload.studentId },
      select: {
        id: true,
        courseCategory: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const commission = await prisma.courseCommission.findUnique({
      where: { slug: payload.courseSlug },
    });

    if (!commission) {
      return NextResponse.json({ error: "Selected course not found" }, { status: 404 });
    }

    if (commission.category !== student.courseCategory) {
      return NextResponse.json(
        { error: "Course does not belong to the selected interest category" },
        { status: 400 },
      );
    }

    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: {
        courseSlug: commission.slug,
        courseName: commission.name,
      },
    });

    return NextResponse.json({ student: updatedStudent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error("Failed to assign course", error);
    return NextResponse.json({ error: "Failed to assign course" }, { status: 500 });
  }
}
