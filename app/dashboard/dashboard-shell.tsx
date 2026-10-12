"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { logout } from "@/lib/actions/auth";
import { NavLinks } from "./nav-links";

type DashboardShellProps = {
  name: string;
  email: string;
  initials: string;
  children: React.ReactNode;
};

function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-button border border-border px-3 py-2 text-sm font-medium text-text transition-colors hover:border-expense/40 hover:bg-expense/5 hover:text-expense"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M15 12H3m3-3-3 3 3 3m4-9h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6" />
        </svg>
        Log out
      </button>
    </form>
  );
}

export function DashboardShell({
  name,
  email,
  initials,
  children,
}: DashboardShellProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Image
          src="/logo.png"
          alt="KippaMe"
          width={943}
          height={265}
          className="h-7 w-auto"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between overflow-y-auto py-4">
        <NavLinks onNavigate={() => setOpen(false)} />

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="truncate text-sm font-medium text-text">{name}</p>
              <p className="truncate text-xs text-text-muted">{email}</p>
            </div>
          </div>
          <div className="mt-3">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface/90 px-4 backdrop-blur lg:hidden">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/logo.png"
            alt="KippaMe"
            width={943}
            height={265}
            priority
            className="h-7 w-auto"
          />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="inline-flex h-10 w-10 items-center justify-center rounded-button border border-border text-text transition-colors hover:bg-surface-muted"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-5 w-5"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Mobile drawer */}
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-50 lg:hidden ${
          open ? "" : "pointer-events-none"
        }`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-forest/40 backdrop-blur-sm transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-surface shadow-xl transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebar}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-border bg-surface lg:block">
        {sidebar}
      </aside>

      {/* Content */}
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
