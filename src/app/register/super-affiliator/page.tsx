"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

interface FormState {
  message: string;
  type: "success" | "error" | "info";
}

export default function SuperAffiliatorRegisterPage() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const updateField = (field: "name" | "email" | "password") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormState({ type: "info", message: "Creating your super affiliator account..." });

    startTransition(async () => {
      try {
        const response = await fetch("/api/register/super-affiliator", {
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

        router.replace("/dashboard/super-affiliator");
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Something went wrong";
        setFormState({ type: "error", message });
      }
    });
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col justify-center px-6 py-16">
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
        <header className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Super Affiliator Registration</h1>
          <p className="text-sm text-gray-600">
            Create a supervising account to recruit affiliators and earn override commissions.
          </p>
        </header>

        {formState && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              formState.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : formState.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-sky-200 bg-sky-50 text-sky-700"
            }`}
          >
            {formState.message}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="Jane Doe"
              value={formValues.name}
              onChange={updateField("name")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="you@example.com"
              value={formValues.email}
              onChange={updateField("email")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="At least 8 characters"
              value={formValues.password}
              onChange={updateField("password")}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400"
          >
            {isPending ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          By signing up you agree to oversee your affiliator network responsibly.
        </p>
      </section>
    </main>
  );
}
