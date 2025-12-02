"use client";

import { useEffect, useState } from "react";

interface PayoutItem {
  id: string;
  amount: number;
  payoutReference: string | null;
  createdAt: string;
  type: "affiliator" | "super-affiliator";
  affiliator: {
    id: string;
    name: string;
    email: string;
  } | null;
  superAffiliator: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export function PendingPayouts() {
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function loadPayouts() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/payout/list");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to load payout requests.");
      }

      setPayouts(result.payouts ?? []);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to load payout requests.";
      setError(message);
      setPayouts([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPayouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApprove(id: string) {
    try {
      setProcessingId(id);
      const response = await fetch("/api/payout/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutRequestId: id }),
      });

      const result = await response.json();

      if (!response.ok) {
        const message = Array.isArray(result.error)
          ? result.error.map((issue: { message: string }) => issue.message).join("\n")
          : typeof result.error === "string"
            ? result.error
            : "Unable to approve payout.";
        throw new Error(message);
      }

      alert("Payout approved successfully.");
      setPayouts((current) => current.filter((payout) => payout.id !== id));
    } catch (approveError) {
      const message = approveError instanceof Error ? approveError.message : "Unable to approve payout.";
      setError(message);
    } finally {
      setProcessingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface))] dark:text-slate-400">
        Loading payout requests...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-200">
        {error}
        <button
          type="button"
          onClick={loadPayouts}
          className="ml-3 inline-flex items-center rounded-md border border-red-600 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:border-red-300 dark:text-red-100 dark:hover:bg-red-500/20"
        >
          Retry
        </button>
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface))] dark:text-slate-400">
        No pending payout requests right now.
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface))]">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[720px] divide-y divide-gray-200 text-left text-sm dark:divide-slate-700">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-slate-900 dark:text-slate-300">
          <tr>
            <th className="px-4 py-3">Requester</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">UPI / Payment</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((payout) => {
            const label = payout.type === "affiliator" ? "Affiliator" : "Super affiliator";
            const requesterName =
              payout.type === "affiliator"
                ? payout.affiliator?.name ?? "Affiliator"
                : payout.superAffiliator?.name ?? "Super affiliator";
            const requesterEmail =
              payout.type === "affiliator"
                ? payout.affiliator?.email ?? ""
                : payout.superAffiliator?.email ?? "";

            return (
              <tr key={payout.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-slate-900 dark:even:bg-slate-800/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{requesterName}</div>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-600 dark:bg-slate-800 dark:text-slate-200">
                      {label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{requesterEmail}</div>
                </td>
              <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">₹{payout.amount.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-sky-600 dark:text-sky-400">
                {payout.payoutReference ? (
                  <a
                    href={payout.payoutReference.toLowerCase().startsWith("http")
                      ? payout.payoutReference
                      : `upi://pay?pa=${encodeURIComponent(payout.payoutReference)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {payout.payoutReference.toLowerCase().startsWith("http")
                      ? "Open link"
                      : payout.payoutReference}
                  </a>
                ) : (
                  <span className="text-gray-500 dark:text-slate-400">Not provided</span>
                )}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => handleApprove(payout.id)}
                  disabled={processingId === payout.id}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                >
                  {processingId === payout.id ? "Approving..." : "Approve"}
                </button>
              </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
