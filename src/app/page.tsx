import Image from "next/image";
import Link from "next/link";

const sections = [
  {
    title: "Register as an Affiliator",
    description: "Launch your affiliate journey in minutes and start sharing your referral link.",
    href: "/register/affiliator",
    buttonLabel: "Go to Registration",
    accent: "bg-sky-100 text-sky-600",
  },
  {
    title: "Become a Super Affiliator",
    description: "Recruit affiliators under you, manage override earnings, and grow your network.",
    href: "/register/super-affiliator",
    buttonLabel: "Build Your Network",
    accent: "bg-purple-100 text-purple-600",
  },
  {
    title: "Login as Counsellor or Affiliator",
    description: "Access your dashboard to track leads, payouts, and student progress.",
    href: "/login",
    buttonLabel: "Go to Login",
    accent: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Student Registration",
    description: "Join our programs through an affiliator’s coupon code and talk to our counsellors.",
    href: "/student-register",
    buttonLabel: "Register as Student",
    accent: "bg-amber-100 text-amber-600",
  },
];

const highlights = [
  {
    title: "Unified dashboards",
    description: "Role-aware workspaces keep each teammate focused on the metrics that matter most.",
  },
  {
    title: "Transparent payouts",
    description: "Automated token tracking for affiliators, supers, and counsellor approvals in one flow.",
  },
  {
    title: "Frictionless onboarding",
    description: "Share-ready links mean new partners and students can join the moment you invite them.",
  },
];

const stats = [
  { value: "5k+", label: "students nurtured" },
  { value: "480+", label: "active affiliators" },
  { value: "92%", label: "lead-to-admit accuracy" },
];

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16 md:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-indigo-600 to-purple-600 px-6 py-16 text-white shadow-2xl md:px-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute inset-x-0 top-1/2 h-px w-full bg-white/20" />
        </div>

        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="mb-6 flex items-center justify-center">
            <Image
              src="/g4-4.png"
              alt="G4 company logo"
              width={120}
              height={120}
              priority
              className="h-20 w-20 rounded-xl border border-white/30 bg-white/10 p-1 backdrop-blur"
            />
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
            Smarter Affiliate Growth
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
            Grow your education network with confidence, insight, and speed
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
            Onboard affiliators, reward top performers, and give counsellors the context they need to convert
            students quickly. Every workflow lives in one modern command center.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-sky-700 shadow-lg shadow-sky-900/20 transition hover:translate-y-0.5 hover:bg-white/90"
            >
              Sign in to your dashboard
            </Link>
            <Link
              href="/register/super-affiliator"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              Start a super affiliator team
            </Link>
          </div>

          <dl className="mt-12 grid w-full gap-4 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur md:grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center justify-center py-3 ${
                  index === 0 ? "" : "md:border-l md:border-white/20"
                }`}
              >
                <dt className="text-xs uppercase tracking-[0.3em] text-white/60">{stat.label}</dt>
                <dd className="mt-2 text-3xl font-semibold">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        {sections.map((section) => (
          <article
            key={section.title}
            className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white p-7 shadow-lg transition duration-200 hover:-translate-y-1.5 hover:shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${section.accent}`}>Featured</span>
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-gray-900">{section.title}</h2>
                <p className="text-sm leading-relaxed text-gray-600">{section.description}</p>
              </div>
            </div>
            <Link
              href={section.href}
              className="mt-8 inline-flex items-center justify-center gap-2 self-start rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition group-hover:bg-sky-600"
            >
              {section.buttonLabel}
              <span aria-hidden>→</span>
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-gray-200 bg-slate-50/60 p-6 shadow-sm transition hover:bg-white hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
