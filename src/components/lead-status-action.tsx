"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface LeadStatusActionProps {
  studentId: string;
  currentStatus: string;
}

export function LeadStatusAction({ studentId, currentStatus }: LeadStatusActionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (currentStatus === "admitted") {
    return <span className="text-xs font-medium text-emerald-600">Admitted</span>;
  }

  const markAsAdmitted = () => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/lead/update", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ studentId, leadStatus: "admitted" }),
        });

        const result = await response.json();

        if (!response.ok || !result) {
          throw new Error(result?.error ?? "Unable to update lead");
        }

        router.refresh();
      } catch (updateError) {
        const message = updateError instanceof Error ? updateError.message : "Failed to update lead";
        setError(message);
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={markAsAdmitted}
        className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
      >
        {isPending ? "Updating..." : "Mark admitted"}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
