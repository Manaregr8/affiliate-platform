import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.courseCommission.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: {
        slug: true,
        name: true,
        category: true,
        affiliatorTokens: true,
        superAffiliatorTokens: true,
      },
    });

    const categories = Array.from(new Set(courses.map((course) => course.category)));

    return NextResponse.json({ courses, categories });
  } catch (error) {
    console.error("Failed to load course commissions", error);
    return NextResponse.json({ error: "Unable to load course data" }, { status: 500 });
  }
}
