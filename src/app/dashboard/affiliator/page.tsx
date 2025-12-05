import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { PayoutRequestCard } from "@/components/payout-request-card";
import { ReferralLinkCard } from "@/components/referral-link-card";
import { ReportProblemCard } from "@/components/report-problem-card";
import { PayoutHistoryCard } from "@/components/payout-history-card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLeadStatusDisplay } from "@/lib/lead-status";
import { buildCommissionLookup, formatCourseLabel, getLeadTokens } from "@/lib/course-options";

export const metadata: Metadata = {
  title: "Affiliator Dashboard",
  description: "Track your leads, payouts, and referral performance.",
};

export default async function AffiliatorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "affiliator") {
    redirect("/dashboard/counsellor");
  }

  const [affiliate, courseCommissions] = await Promise.all([
    prisma.affiliate.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true,
        leads: {
          orderBy: { name: "asc" },
        },
        payouts: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    }),
    prisma.courseCommission.findMany({
      select: {
        slug: true,
        name: true,
        affiliatorTokens: true,
        superAffiliatorTokens: true,
      },
    }),
  ]);

  if (!affiliate) {
    return (
      <section className="space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Affiliator Dashboard</h1>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-100">
          We could not locate your affiliate profile. Please contact support.
        </p>
      </section>
    );
  }

  type AffiliateLead = {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    courseName: string | null;
    courseCategory: string;
    courseSlug: string | null;
    leadStatus: string;
  };

  const leads = affiliate.leads as AffiliateLead[];
  const payoutRequests = affiliate.payouts ?? [];
  const commissionLookup = buildCommissionLookup(courseCommissions);

  return (
    <section className="space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Welcome back, {affiliate.user.name.split(" ")[0]}</h1>
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Track leads, monitor payouts, and share your unique referral assets below.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface))]">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-200">Token balance</p>
          <p className="mt-2 text-3xl font-bold text-sky-600 dark:text-sky-300">{affiliate.tokenBalance.toLocaleString()} tokens</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Minimum 4000 tokens required to request payout.</p>
        </div>
        <ReferralLinkCard referralCode={affiliate.referralLink} />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Request payout</h2>
        <PayoutRequestCard tokenBalance={affiliate.tokenBalance} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent payout requests</h2>
        <PayoutHistoryCard role="affiliator" requests={payoutRequests} />
      </section>

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent leads</h2>
          <span className="text-xs text-gray-500 dark:text-slate-400">{leads.length} total</span>
        </header>

        <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface))]">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[720px] divide-y divide-gray-200 text-left text-sm dark:divide-slate-700">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-slate-900 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Tokens</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-slate-400" colSpan={5}>
                    No leads yet. Share your referral link to start earning.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-slate-900 dark:even:bg-slate-800/60">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{lead.name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{lead.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{lead.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                      {formatCourseLabel(lead.courseName, lead.courseCategory)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                      {(() => {
                        const tokenInfo = getLeadTokens(commissionLookup, lead.courseSlug);
                        if (!tokenInfo) {
                          return <span className="text-xs text-amber-600 dark:text-amber-400">Pending course assignment</span>;
                        }
                        return <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{tokenInfo.affiliatorTokens.toLocaleString()} tokens</span>;
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const statusDisplay = getLeadStatusDisplay(lead.leadStatus);
                        return (
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusDisplay.badgeClass}`}>
                            {statusDisplay.label}
                          </span>
                        );
                      })()}
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Need help?</h2>
        <ReportProblemCard role="affiliator" />
      </section>
    </section>
  );
}
