import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { PayoutRequestCard } from "@/components/payout-request-card";
import { ReferralLinkCard } from "@/components/referral-link-card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AffiliatorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "affiliator") {
    redirect("/dashboard/counsellor");
  }

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      leads: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!affiliate) {
    return (
      <section className="space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Affiliator Dashboard</h1>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
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
    course: string;
    leadStatus: string;
  };

  const leads = affiliate.leads as AffiliateLead[];

  return (
    <section className="space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Welcome back, {affiliate.user.name.split(" ")[0]}</h1>
        <p className="text-sm text-gray-600">
          Track leads, monitor payouts, and share your unique referral assets below.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
  <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Token balance</p>
          <p className="mt-2 text-3xl font-bold text-sky-600">{affiliate.tokenBalance.toLocaleString()} tokens</p>
          <p className="mt-1 text-xs text-gray-500">Minimum 4000 tokens required to request payout.</p>
        </div>
        <ReferralLinkCard referralCode={affiliate.referralLink} />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Request payout</h2>
        <PayoutRequestCard tokenBalance={affiliate.tokenBalance} />
      </section>

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent leads</h2>
          <span className="text-xs text-gray-500">{leads.length} total</span>
        </header>

        <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[720px] divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={4}>
                    No leads yet. Share your referral link to start earning.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{lead.name}</div>
                      <div className="text-xs text-gray-500">{lead.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.course}</td>
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
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>
      </section>
    </section>
  );
}
