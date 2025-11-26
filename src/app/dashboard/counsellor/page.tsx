import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { LeadStatusAction } from "@/components/lead-status-action";
import { PendingPayouts } from "@/components/pending-payouts";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
        <h1 className="text-3xl font-semibold text-gray-900">Counsellor Command Center</h1>
        <p className="text-sm text-gray-600">
          Review new leads, admit qualified students, and approve payout requests.
        </p>
      </header>

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Lead pipeline</h2>
          <span className="text-xs text-gray-500">{leads.length} leads</span>
        </header>

        <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[800px] divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
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
                  <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={6}>
                    No leads submitted yet.
                  </td>
                </tr>
              ) : (
                leadRows.map((lead) => (
                  <tr key={lead.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{lead.name}</div>
                      <div className="text-xs text-gray-500">{lead.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.course}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="font-medium text-gray-900">{lead.affiliator.user.name}</div>
                      <div className="text-xs text-gray-500">{lead.affiliator.user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          lead.leadStatus === "admitted"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {lead.leadStatus}
                      </span>
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
          <h2 className="text-lg font-semibold text-gray-900">Payout requests</h2>
          <span className="text-xs text-gray-500">Pending approvals</span>
        </header>

        <PendingPayouts />
      </section>
    </section>
  );
}
