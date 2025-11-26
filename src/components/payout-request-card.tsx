"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type PayoutRequestCardProps = {
  tokenBalance: number;
};

const MIN_PAYOUT = 4000;
const PAYOUT_STEP = 4000;

export function PayoutRequestCard({ tokenBalance }: PayoutRequestCardProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(() => {
    const eligible = Math.floor(tokenBalance / PAYOUT_STEP) * PAYOUT_STEP;
    return eligible >= MIN_PAYOUT ? eligible : MIN_PAYOUT;
  });
  const [payoutReference, setPayoutReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasEnoughTokens = tokenBalance >= MIN_PAYOUT;

  const helpText = useMemo(() => {
    if (!hasEnoughTokens) {
      const missing = MIN_PAYOUT - tokenBalance;
      return `You need ${missing.toLocaleString()} more tokens to submit a payout request.`;
    }
    return "Payouts are processed in multiples of 4000 tokens.";
  }, [hasEnoughTokens, tokenBalance]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasEnoughTokens) {
      return;
    }

    if (amount < MIN_PAYOUT || amount % PAYOUT_STEP !== 0 || amount > tokenBalance) {
      setError("Enter a valid payout amount within your available balance.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/payout/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          payoutReference,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const message = Array.isArray(result.error)
          ? result.error.map((issue: { message: string }) => issue.message).join("\n")
          : typeof result.error === "string"
            ? result.error
            : "Unable to submit payout request.";
        throw new Error(message);
      }

      alert("Payout request submitted for approval.");
  setPayoutReference("");
      router.refresh();
    } catch (submissionError) {
      const message =
        submissionError instanceof Error ? submissionError.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Request payout</p>
        <h3 className="text-2xl font-semibold text-gray-900">{tokenBalance.toLocaleString()} tokens available</h3>
        <p className="text-xs text-gray-500">{helpText}</p>
      </header>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="space-y-1">
          <label htmlFor="payout-amount" className="text-sm font-medium text-gray-700">
            Payout amount (tokens)
          </label>
          <input
            id="payout-amount"
            type="number"
            min={MIN_PAYOUT}
            step={PAYOUT_STEP}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            disabled={!hasEnoughTokens || isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="payout-reference" className="text-sm font-medium text-gray-700">
            Enter your UPI ID or payment link
          </label>
          <input
            id="payout-reference"
            type="text"
            required
            value={payoutReference}
            onChange={(event) => setPayoutReference(event.target.value)}
            placeholder="manjeet@upi or https://"
            disabled={!hasEnoughTokens || isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={!hasEnoughTokens || isSubmitting}
          className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Submitting..." : "Request payout"}
        </button>
      </form>
    </div>
  );
}
