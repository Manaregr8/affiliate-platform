import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Portal",
  description: "Track your registration status and upcoming onboarding tasks.",
};

export default function StudentDashboardPage() {
  return (
    <section className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Student Portal</h1>
        <p className="text-sm text-gray-600">
          Registration status and onboarding actions will be added shortly.
        </p>
      </header>
    </section>
  );
}
