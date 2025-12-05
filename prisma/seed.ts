import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

import { COURSE_COMMISSION_DATA } from "./data/course-commissions";

const prisma = new PrismaClient();

// Simple helper to generate deterministic-looking codes for demo data.
function buildCode(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function main() {
  // Remove previous demo data so the seed stays idempotent during local development.
  await prisma.payoutRequest.deleteMany();
  await prisma.student.deleteMany();
  await prisma.affiliate.deleteMany();
  await prisma.superAffiliator.deleteMany();
  await prisma.courseCommission.deleteMany();
  await prisma.issueReport.deleteMany();
  await prisma.user.deleteMany();

  await prisma.courseCommission.createMany({
    data: COURSE_COMMISSION_DATA,
  });

  const sharedPassword = await hash("Password123!", 10);

  // Seed counsellor account.
  const counsellor = await prisma.user.create({
    data: {
      name: "Priya Counsellor",
      email: "counsellor@example.com",
      role: "counsellor",
      passwordHash: sharedPassword,
    },
  });

  // Seed a supervising super affiliator who can recruit partners.
  const superUser = await prisma.user.create({
    data: {
      name: "Manjeet Super",
      email: "super@example.com",
      role: "super-affiliator",
      passwordHash: sharedPassword,
    },
  });

  const superAffiliator = await prisma.superAffiliator.create({
    data: {
      userId: superUser.id,
      referralCode: "superhub",
      tokenBalance: 1500,
    },
  });

  // Seed affiliator users alongside their affiliate records.
  const affiliateOneUser = await prisma.user.create({
    data: {
      name: "Arjun Affiliator",
      email: "arjun@example.com",
      role: "affiliator",
      passwordHash: sharedPassword,
      qrCodeURL: "https://via.placeholder.com/200x200.png?text=Arjun+UPI",
    },
  });

  const affiliateTwoUser = await prisma.user.create({
    data: {
      name: "Neha Affiliator",
      email: "neha@example.com",
      role: "affiliator",
      passwordHash: sharedPassword,
      qrCodeURL: "https://via.placeholder.com/200x200.png?text=Neha+UPI",
    },
  });

  const affiliateOne = await prisma.affiliate.create({
    data: {
      userId: affiliateOneUser.id,
      couponCode: buildCode("LEARN"),
      referralLink: "arjun-link",
      tokenBalance: 8000,
      superAffiliatorId: superAffiliator.id,
    },
  });

  const affiliateTwo = await prisma.affiliate.create({
    data: {
      userId: affiliateTwoUser.id,
      couponCode: buildCode("UPSKILL"),
      referralLink: "neha-link",
      tokenBalance: 4000,
      superAffiliatorId: superAffiliator.id,
    },
  });

  // Seed student leads for both affiliators.
  await prisma.student.createMany({
    data: [
      {
        name: "Rahul Student",
        email: "rahul@example.com",
        phone: "+91 90000 11111",
        courseName: "Fullstack Development",
        courseCategory: "Web Designing & Development",
        courseSlug: "fullstack-development",
        affiliatorId: affiliateOne.id,
        leadStatus: "admitted",
      },
      {
        name: "Sneha Student",
        email: "sneha@example.com",
        phone: "+91 90000 22222",
        courseName: "Advanced Certification in Data Analytics and AI",
        courseCategory: "Data Analytics Courses",
        courseSlug: "advanced-certification-data-analytics-ai",
        affiliatorId: affiliateOne.id,
        leadStatus: "processing",
      },
      {
        name: "Karan Student",
        email: "karan@example.com",
        phone: "+91 90000 33333",
        courseName: "AI Literacy",
        courseCategory: "Gen AI & Prompt Engineering Courses",
        courseSlug: "ai-literacy",
        affiliatorId: affiliateTwo.id,
        leadStatus: "untouched",
      },
    ],
  });

  // Demonstrate pending payout requests for counsellor workflow.
  await prisma.payoutRequest.createMany({
    data: [
      {
        affiliatorId: affiliateOne.id,
        amount: 4000,
        status: "pending",
        qrCodeURL: "manjeet@upi",
      },
      {
        superAffiliatorId: superAffiliator.id,
        amount: 4000,
        status: "approved",
        qrCodeURL: "https://example.com/pay/super-qr",
      },
      {
        affiliatorId: affiliateTwo.id,
        amount: 8000,
        status: "approved",
        qrCodeURL: "harsh@upi",
      },
    ],
  });

  console.log("Seeded counsellor:", counsellor.email);
  console.log("Seeded affiliators:", affiliateOneUser.email, affiliateTwoUser.email);
  console.log("Seeded super affiliator:", superUser.email);
}

main()
  .catch((error) => {
    console.error("Failed to seed database", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
