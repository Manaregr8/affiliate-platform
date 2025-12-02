import type { PayoutRequest } from "@prisma/client";

const formatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  rejected: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200",
};

interface PayoutHistoryCardProps {
  role: "affiliator" | "super-affiliator";
  requests: Pick<PayoutRequest, "id" | "amount" | "status" | "createdAt" | "qrCodeURL">[];
}

export function PayoutHistoryCard({ role, requests }: PayoutHistoryCardProps) {
  const heading = role === "super-affiliator" ? "Override payout history" : "Payout history";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface))]">
      <header className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-300">History</p>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{heading}</h3>
        <p className="text-xs text-gray-500 dark:text-slate-400">Track payouts you requested so you can follow up if they stall.</p>
      </header>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 dark:border-slate-700 dark:text-slate-400">
          No payout requests yet.
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[520px] divide-y divide-gray-200 text-left text-sm dark:divide-slate-700">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-slate-900 dark:text-slate-300">
              <tr>
                <th className="px-4 py-2">Requested</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Reference</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const badgeClass = statusStyles[request.status] ?? "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-200";
                return (
                  <tr key={request.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-slate-900 dark:even:bg-slate-800/60">
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-slate-300">
                      {formatter.format(new Date(request.createdAt))}
                    </td>
                    <td className="px-4 py-2 font-semibold text-gray-900 dark:text-gray-100">₹{request.amount.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-sky-600 dark:text-sky-400">
                      {request.qrCodeURL ? (
                        request.qrCodeURL.toLowerCase().startsWith("http") ? (
                          <a href={request.qrCodeURL} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Open link
                          </a>
                        ) : (
                          request.qrCodeURL
                        )
                      ) : (
                        <span className="text-gray-500 dark:text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
