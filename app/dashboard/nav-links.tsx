"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/profile", label: "Profile" },
];

function classNames(...classes: Array<string | boolean | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={classNames(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}