export default function ThankYouPage() {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12 text-center">
      <p className="text-xs uppercase tracking-wide text-sky-600">Thank you</p>
      <h1 className="mt-2 text-3xl font-semibold text-gray-900">We received your details</h1>
      <p className="mt-3 text-sm text-gray-600">
        Our counsellor will review your information and reach out within the next working day. Keep an eye on your
        inbox and phone.
      </p>
      <a
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
      >
        Back to home
      </a>
    </section>
  );
}
