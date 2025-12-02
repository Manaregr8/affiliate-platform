"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { STUDENT_COURSE_OPTIONS } from "@/lib/course-options";

type ReferralFormProps = {
  params: {
    referralCode: string;
  };
};

export default function StudentReferralPage({ params }: ReferralFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const courseOptions = STUDENT_COURSE_OPTIONS;
  const phonePattern = "^[0-9+()\\-\\s]{7,15}$";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/register/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          course: payload.course,
          referralCode: params.referralCode,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Something went wrong. Please try again.");
      }

      router.push("/thank-you");
    } catch (submissionError) {
      const message =
        submissionError instanceof Error ? submissionError.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg transition-colors dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface))]">
        <header className="mb-6 space-y-2 text-center">
          <p className="text-xs uppercase tracking-wide text-sky-600">Referred by {params.referralCode}</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Submit your application</h1>
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Tell us about yourself and a counsellor will reach out within 24 hours.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-slate-200">
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-[rgb(var(--border))] dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-slate-500"
            placeholder="Neha Sharma"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-slate-200">
            Email address
          </label>
          <input
            id="email"
            name="email"
            required
            type="email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-[rgb(var(--border))] dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-slate-500"
            placeholder="neha@example.com"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-slate-200">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            inputMode="tel"
            pattern={phonePattern}
            title="Enter 7-15 digits. +, spaces, parentheses, and dashes allowed."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-[rgb(var(--border))] dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-slate-500"
            placeholder="+91 98765 43210"
          />
          <p className="text-xs text-gray-500 dark:text-slate-400">Use digits only; formatting characters like +, () and - are allowed.</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="course" className="text-sm font-medium text-gray-700 dark:text-slate-200">
            Course interest
          </label>
          <select
            id="course"
            name="course"
            required
            defaultValue=""
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-[rgb(var(--border))] dark:bg-slate-900 dark:text-gray-100"
          >
            <option value="" disabled>
              Select a course
            </option>
            {courseOptions.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-sky-500 dark:hover:bg-sky-400"
        >
          {isSubmitting ? "Submitting..." : "Submit application"}
        </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500 dark:text-slate-400">
          By submitting, you agree to be contacted by our counsellor for next steps.
        </p>
      </div>
    </section>
  );
}
