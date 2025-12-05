"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { LeadStatus, normalizeLeadStatus, getLeadStatusDisplay } from "@/lib/lead-status";

interface LeadStatusActionProps {
  studentId: string;
  currentStatus: string;
  courseSlug?: string | null;
  requiresCourseSelection?: boolean;
}

const STATUS_TRANSITIONS: Record<LeadStatus, { next?: LeadStatus; cta?: string; buttonClass?: string }> = {
  untouched: {
    next: "processing",
    cta: "Mark processing",
    buttonClass:
      "bg-amber-500 hover:bg-amber-600 dark:bg-amber-400 dark:hover:bg-amber-300",
  },
  processing: {
    next: "admitted",
    cta: "Approve lead",
    buttonClass:
      "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400",
  },
  admitted: {},
};

export function LeadStatusAction({ studentId, currentStatus, courseSlug, requiresCourseSelection = false }: LeadStatusActionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const normalizedStatus = normalizeLeadStatus(currentStatus);
  const transition = STATUS_TRANSITIONS[normalizedStatus];

  if (!transition.next) {
    const meta = getLeadStatusDisplay(normalizedStatus);
    return <span className="text-xs font-semibold text-emerald-500">{meta.label}</span>;
  }

  const needsCourseAssignment =
    requiresCourseSelection && transition.next === "admitted" && !courseSlug;

  const updateStatus = () => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/lead/update", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ studentId, leadStatus: transition.next }),
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
        disabled={isPending || needsCourseAssignment}
        onClick={updateStatus}
        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${
          transition.buttonClass ?? "bg-slate-600"
        }`}
      >
        {isPending ? "Updating..." : transition.cta ?? "Update"}
      </button>
      {needsCourseAssignment ? (
        <span className="text-xs text-amber-600 dark:text-amber-400">Assign a course before admitting.</span>
      ) : null}
      {error ? <span className="text-xs text-red-600 dark:text-red-400">{error}</span> : null}
    </div>
  );
}
