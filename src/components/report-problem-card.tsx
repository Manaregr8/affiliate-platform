"use client";

import { ChangeEvent, FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { REPORT_TOPICS, ReportTopic } from "@/lib/report-topics";

interface ReportProblemCardProps {
  role: "affiliator" | "super-affiliator";
}

type FormState = {
  type: "success" | "error" | "info";
  message: string;
};

export function ReportProblemCard({ role }: ReportProblemCardProps) {
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    topic: REPORT_TOPICS[0]?.value ?? "untouched_leads",
    leadCount: "",
    daysUntouched: "",
    description: "",
  });
  const [feedback, setFeedback] = useState<FormState | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateField = (field: keyof typeof formValues) => (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  function resetForm() {
    setFormValues({ topic: REPORT_TOPICS[0]?.value ?? "untouched_leads", leadCount: "", daysUntouched: "", description: "" });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback({ type: "info", message: "Sending your report..." });

    const leadCountValue = formValues.leadCount.trim() ? Number(formValues.leadCount.trim()) : undefined;
    const daysUntouchedValue = formValues.daysUntouched.trim() ? Number(formValues.daysUntouched.trim()) : undefined;

    startTransition(async () => {
      try {
        const response = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: formValues.topic as ReportTopic,
            description: formValues.description,
            leadCount: Number.isFinite(leadCountValue) ? leadCountValue : undefined,
            daysUntouched: Number.isFinite(daysUntouchedValue) ? daysUntouchedValue : undefined,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result?.success) {
          const message = Array.isArray(result?.error)
            ? result.error.map((issue: { message: string }) => issue.message).join("\n")
            : typeof result?.error === "string"
              ? result.error
              : "Unable to submit report.";
          throw new Error(message);
        }

        setFeedback({ type: "success", message: "Report submitted. Our support team will follow up shortly." });
        resetForm();
        router.refresh();
      } catch (submissionError) {
        const message = submissionError instanceof Error ? submissionError.message : "Failed to submit report.";
        setFeedback({ type: "error", message });
      }
    });
  }

  const heading = role === "super-affiliator" ? "Report an issue" : "Flag an issue";
  const helper =
    role === "super-affiliator"
      ? "Share network-wide blockers so we can intervene quickly."
      : "Let counsellors know when your leads or payouts need attention.";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface))]">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-300">Support</p>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{heading}</h3>
        <p className="text-xs text-gray-500 dark:text-slate-400">{helper}</p>
      </header>

      {feedback ? (
        <p
          className={`mt-4 rounded-lg border px-3 py-2 text-xs ${
            feedback.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200"
              : feedback.type === "error"
                ? "border-red-300 bg-red-50 text-red-700 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-200"
                : "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-400/40 dark:bg-sky-500/10 dark:text-sky-200"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1">
          <label htmlFor="report-topic" className="text-sm font-medium text-gray-700 dark:text-slate-200">
            What do you want to report?
          </label>
          <select
            id="report-topic"
            required
            value={formValues.topic}
            onChange={updateField("topic")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-[rgb(var(--border))] dark:bg-slate-900 dark:text-gray-100"
          >
            {REPORT_TOPICS.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="lead-count" className="text-sm font-medium text-gray-700 dark:text-slate-200">
              Affected leads (optional)
            </label>
            <input
              id="lead-count"
              type="number"
              min={1}
              max={500}
              value={formValues.leadCount}
              onChange={updateField("leadCount")}
              placeholder="e.g. 5"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-[rgb(var(--border))] dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="days-untouched" className="text-sm font-medium text-gray-700 dark:text-slate-200">
              Days untouched (optional)
            </label>
            <input
              id="days-untouched"
              type="number"
              min={1}
              max={365}
              value={formValues.daysUntouched}
              onChange={updateField("daysUntouched")}
              placeholder="e.g. 10"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-[rgb(var(--border))] dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="report-details" className="text-sm font-medium text-gray-700 dark:text-slate-200">
            Tell us what happened
          </label>
          <textarea
            id="report-details"
            required
            minLength={20}
            maxLength={1500}
            value={formValues.description}
            onChange={updateField("description")}
            className="h-28 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-[rgb(var(--border))] dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-slate-500"
            placeholder="Include referral codes, student names, or payout references so we can help faster."
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-100 dark:text-gray-900 dark:hover:bg-slate-200"
        >
          {isPending ? "Sending..." : "Send report"}
        </button>
      </form>
    </div>
  );
}
