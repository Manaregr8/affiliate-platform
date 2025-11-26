"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";

interface FormState {
  message: string;
  type: "success" | "error" | "info";
}

export default function LoginPage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [formState, setFormState] = useState<FormState | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateField = (field: "email" | "password") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormState({ type: "info", message: "Verifying your credentials..." });

    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          redirect: false,
          email: formValues.email,
          password: formValues.password,
        });

        if (result?.error) {
          throw new Error("Invalid email or password");
        }

        const session = await getSession();

        if (!session?.user?.role) {
          throw new Error("Unable to determine your role after login");
        }

        setFormState({ type: "success", message: "Login successful. Redirecting..." });

        if (session.user.role === "counsellor") {
          router.replace("/dashboard/counsellor");
        } else if (session.user.role === "super-affiliator") {
          router.replace("/dashboard/super-affiliator");
        } else {
          router.replace("/dashboard/affiliator");
        }

        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";
        setFormState({ type: "error", message });
      }
    });
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col justify-center px-6 py-16">
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
        <header className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Login</h1>
          <p className="text-sm text-gray-600">
            Counsellors and affiliators can access their dashboards from here.
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
            <label className="text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
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
              autoComplete="current-password"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="••••••••"
              value={formValues.password}
              onChange={updateField("password")}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Need an account? <a href="/register" className="font-medium text-sky-600">Register here</a>.
        </p>
      </section>
    </main>
  );
}
