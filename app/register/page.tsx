"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { register, type AuthState } from "@/lib/actions/auth";

const initialState: AuthState = {};

const inputClass =
  "w-full rounded-button border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-lime/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -left-32 h-[30rem] w-[30rem] rounded-full bg-gold/20 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          aria-label="KippaMe home"
          className="mx-auto mb-8 flex w-fit items-center justify-center"
        >
          <Image
            src="/logo.png"
            alt="KippaMe"
            width={943}
            height={265}
            priority
            className="h-11 w-auto"
          />
        </Link>

        <div className="rounded-card border border-border bg-surface p-6 shadow-xl shadow-forest/5 sm:p-8">
          <div className="text-center">
            <span className="inline-flex rounded-full border border-primary/15 bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Get started
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-text">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Start tracking where every naira goes.
            </p>
          </div>

          <form action={formAction} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-text">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Jane Doe"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-text">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-text"
              >
                Date of birth
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-text"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Repeat your password"
                className={inputClass}
              />
            </div>

            {state.error && (
              <p
                role="alert"
                className="rounded-button bg-expense/10 px-3 py-2.5 text-sm text-expense"
              >
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-button bg-primary py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>

        <Link
          href="/"
          className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-primary"
        >
          <span aria-hidden="true">←</span>
          Back to home
        </Link>
      </div>
    </main>
  );
}
