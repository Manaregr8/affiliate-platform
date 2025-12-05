import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { LeadStatusAction } from "@/components/lead-status-action";
import { PendingPayouts } from "@/components/pending-payouts";
import { StudentCourseSelector, type CourseCommissionOption } from "@/components/student-course-selector";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLeadStatusDisplay } from "@/lib/lead-status";
import { buildCommissionLookup, getLeadTokens } from "@/lib/course-options";

export const metadata: Metadata = {
  title: "Counsellor Dashboard",
  description: "Review student leads, approve payouts, and update admission statuses.",
};

export default async function CounsellorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "counsellor") {
    redirect("/dashboard/affiliator");
  }

  const [leads, courseOptions] = await Promise.all([
    prisma.student.findMany({
    orderBy: [{ leadStatus: "asc" }, { name: "asc" }],
    include: {
      affiliator: {
        include: {
          user: true,
        },
      },
    },
    }),
    prisma.courseCommission.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: {
        slug: true,
        name: true,
        category: true,
        affiliatorTokens: true,
        superAffiliatorTokens: true,
      },
    }),
  ]);

  type LeadRow = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    courseName: string | null;
    courseSlug: string | null;
    courseCategory: string;
    leadStatus: string;
    affiliator: {
      user: {
        name: string;
        email: string;
      };
    };
  };

  const leadRows = leads as LeadRow[];
  const commissionOptions = courseOptions as CourseCommissionOption[];
  const commissionLookup = buildCommissionLookup(
    courseOptions.map((course) => ({
      slug: course.slug,
      name: course.name,
      affiliatorTokens: course.affiliatorTokens,
      superAffiliatorTokens: course.superAffiliatorTokens,
    })),
  );

  return (
    <section className="space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Counsellor Command Center</h1>
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Review new leads, admit qualified students, and approve payout requests.
        </p>
      </header>

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Lead pipeline</h2>
          <span className="text-xs text-gray-500 dark:text-slate-400">{leads.length} leads</span>
        </header>

        <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface))]">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[800px] divide-y divide-gray-200 text-left text-sm dark:divide-slate-700">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-slate-900 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Affiliator</th>
                <th className="px-4 py-3">Tokens</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {leadRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-slate-400" colSpan={7}>
                    No leads submitted yet.
                  </td>
                </tr>
              ) : (
                leadRows.map((lead) => (
                  <tr key={lead.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-slate-900 dark:even:bg-slate-800/60">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{lead.name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{lead.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{lead.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Interest</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{lead.courseCategory}</p>
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Confirmed course</p>
                        <StudentCourseSelector
                          studentId={lead.id}
                          courseCategory={lead.courseCategory}
                          selectedSlug={lead.courseSlug}
                          courses={commissionOptions}
                        />
                        {lead.courseName ? (
                          <p className="text-xs text-gray-500 dark:text-slate-400">Current: {lead.courseName}</p>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-slate-400">Not assigned yet</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{lead.affiliator.user.name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{lead.affiliator.user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                      {(() => {
                        const tokenInfo = getLeadTokens(commissionLookup, lead.courseSlug);
                        if (!tokenInfo) {
                          return <span className="text-xs text-amber-600 dark:text-amber-400">Assign a course to calculate</span>;
                        }

                        return (
                          <div className="space-y-1 text-xs">
                            <p className="text-gray-600 dark:text-slate-300">Affiliator: <span className="font-semibold text-gray-900 dark:text-gray-100">{tokenInfo.affiliatorTokens.toLocaleString()} tokens</span></p>
                            <p className="text-gray-600 dark:text-slate-300">Super: <span className="font-semibold text-gray-900 dark:text-gray-100">{tokenInfo.superAffiliatorTokens.toLocaleString()} tokens</span></p>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const display = getLeadStatusDisplay(lead.leadStatus);
                        return (
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${display.badgeClass}`}>
                            {display.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <LeadStatusAction
                        studentId={lead.id}
                        currentStatus={lead.leadStatus}
                        courseSlug={lead.courseSlug}
                        requiresCourseSelection
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payout requests</h2>
          <span className="text-xs text-gray-500 dark:text-slate-400">Pending approvals</span>
        </header>

        <PendingPayouts />
      </section>
    </section>
  );
}
