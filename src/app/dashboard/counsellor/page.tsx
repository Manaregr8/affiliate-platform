import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { LeadStatusAction } from "@/components/lead-status-action";
import { PendingPayouts } from "@/components/pending-payouts";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLeadStatusDisplay } from "@/lib/lead-status";

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

  const leads = await prisma.student.findMany({
    orderBy: [{ leadStatus: "asc" }, { name: "asc" }],
    include: {
      affiliator: {
        include: {
          user: true,
        },
      },
    },
  });

  type LeadRow = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    course: string;
    leadStatus: string;
    affiliator: {
      user: {
        name: string;
        email: string;
      };
    };
  };

  const leadRows = leads as LeadRow[];

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
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {leadRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-slate-400" colSpan={6}>
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
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{lead.course}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{lead.affiliator.user.name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{lead.affiliator.user.email}</div>
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
                      <LeadStatusAction studentId={lead.id} currentStatus={lead.leadStatus} />
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
