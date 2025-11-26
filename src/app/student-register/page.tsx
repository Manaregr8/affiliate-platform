export default function StudentRegisterPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col justify-center px-6 py-16">
      <section className="rounded-3xl border border-dashed border-sky-200 bg-sky-50/40 p-12 text-center shadow-inner">
        <h1 className="text-3xl font-semibold text-gray-900">Student Registrations Are Referral-Only</h1>
        <p className="mt-4 text-sm text-gray-600">
          Please request the referral link from the affiliator who shared our programs with you.
          Every lead must be created through that personalized link so we can track rewards accurately.
        </p>
        <p className="mt-6 text-sm text-gray-500">
          If you do not have a referral link yet, reach out to our admissions team at
          <a href="mailto:admissions@example.com" className="mx-1 font-medium text-sky-600">admissions@example.com</a>
          and we will connect you with the right affiliator.
        </p>
      </section>
    </main>
  );
}
