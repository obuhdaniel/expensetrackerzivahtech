import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, date_of_birth, created_at")
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
          Profile
        </h1>
        <p className="mt-1 text-sm text-text-muted">Your account information</p>
      </div>

      <div className="rounded-card border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold tracking-tight text-text">
              {name}
            </h2>
            <p className="truncate text-sm text-text-muted">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-card border border-border bg-surface-muted p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Full name
            </p>
            <p className="mt-1 text-sm font-medium text-text">{name}</p>
          </div>
          <div className="rounded-card border border-border bg-surface-muted p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Date of birth
            </p>
            <p className="mt-1 text-sm font-medium text-text">
              {profile?.date_of_birth
                ? formatDate(profile.date_of_birth)
                : "Not set"}
            </p>
          </div>
          <div className="rounded-card border border-border bg-surface-muted p-4 sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Member since
            </p>
            <p className="mt-1 text-sm font-medium text-text">
              {user.created_at ? formatDate(user.created_at) : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}