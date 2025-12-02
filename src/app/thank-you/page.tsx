import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thanks For Applying",
  description: "We received your information and our counsellor will follow up shortly.",
};

export default function ThankYouPage() {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-lg transition-colors dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface))]">
        <p className="text-xs uppercase tracking-wide text-sky-600">Thank you</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">We received your details</h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-slate-300">
          Our counsellor will review your information and reach out within the next working day. Keep an eye on your
          inbox and phone.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
        >
          Back to home
        </a>
      </div>
    </section>
  );
}
