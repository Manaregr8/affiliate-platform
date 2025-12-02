"use client";
import { useEffect, useState, useTransition, ChangeEvent, FormEvent } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

interface FormState {
  message: string;
  type: "success" | "error" | "info";
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageInner />
    </Suspense>
  );
}
function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState<FormState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    superReferral: "",
  });

  useEffect(() => {
    const superReferral = searchParams.get("super");
    if (superReferral) {
      setFormValues((prev) => ({ ...prev, superReferral }));
    }
  }, [searchParams]);

  const updateField = (field: "name" | "email" | "password" | "superReferral") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormState({ type: "info", message: "Creating your affiliator account..." });

    startTransition(async () => {
      try {
        const response = await fetch("/api/register/affiliator", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formValues),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({ error: "Unable to register" }));
          throw new Error(typeof data.error === "string" ? data.error : "Unable to register");
        }

        setFormState({ type: "success", message: "Account created. Redirecting you to dashboard..." });

        const signInResult = await signIn("credentials", {
          redirect: false,
          email: formValues.email,
          password: formValues.password,
        });

        if (signInResult?.error) {
          throw new Error("Account created but auto login failed. Please sign in manually.");
        }

        router.replace("/dashboard/affiliator");
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Something went wrong";
        setFormState({ type: "error", message });
      }
    });
  };
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col justify-center px-6 py-16">
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface))]">
        <header className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Affiliator Registration</h1>
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Create your account to receive a unique coupon code and referral link.
          </p>
        </header>

        {formState && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              formState.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-200"
                : formState.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-400/40 dark:bg-red-400/10 dark:text-red-200"
                  : "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/40 dark:bg-sky-400/10 dark:text-sky-200"
            }`}
          >
            {formState.message}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-200" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-[rgb(var(--border))] dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-slate-500"
              placeholder="Jane Doe"
              value={formValues.name}
              onChange={updateField("name")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-200" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-[rgb(var(--border))] dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-slate-500"
              placeholder="you@example.com"
              value={formValues.email}
              onChange={updateField("email")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-200" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-[rgb(var(--border))] dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-slate-500"
              placeholder="At least 8 characters"
              value={formValues.password}
              onChange={updateField("password")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-200" htmlFor="superReferral">
              Super affiliator referral code (optional)
            </label>
            <input
              id="superReferral"
              name="superReferral"
              type="text"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-[rgb(var(--border))] dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-slate-500"
              placeholder="Enter code if you received one"
              value={formValues.superReferral}
              onChange={updateField("superReferral")}
            />
            <p className="text-xs text-gray-500 dark:text-slate-400">Use the code shared by your supervising super affiliator.</p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400"
          >
            {isPending ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500 dark:text-slate-400">
          By signing up you agree to receive onboarding emails and payout updates.
        </p>
      </section>
    </main>
  );
}