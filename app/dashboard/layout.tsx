import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import { ToastProvider } from "./toast-provider";
import { NavLinks } from "./nav-links";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const name = String(profile?.full_name ?? user.user_metadata?.name ?? "User");
  const initials = name
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="flex min-h-screen">
          <aside className="fixed inset-y-0 left-0 z-10 flex w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
              <span className="text-base font-semibold tracking-tight">
                Zivah Expense Manager
              </span>
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <NavLinks />

              <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">
                    {initials}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                <form action={logout} className="mt-3">
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Log out
                  </button>
                </form>
              </div>
            </div>
          </aside>

          <div className="flex min-h-screen flex-1 flex-col pl-64">
            <main className="flex-1 px-6 py-8">{children}</main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}