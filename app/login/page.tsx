"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { login, type AuthState } from "@/lib/actions/auth";

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

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
              Welcome back
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-text">
              Log in to KippaMe
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Continue tracking where every naira goes.
            </p>
          </div>

          <form action={formAction} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-button border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
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
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full rounded-button border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
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
              {pending ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Create one
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
