import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatNaira } from "@/lib/format";

export const metadata: Metadata = {
  title: "History",
};

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: expenses } = await supabase
    .from("expenses")
    .select("id,title,amount,category,spent_on")
    .eq("user_id", user.id)
    .order("spent_on", { ascending: false })
    .order("id", { ascending: false })
    .limit(100);

  const history = expenses ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
          History
        </h1>
        <p className="mt-1 text-sm text-text-muted">Recent expense activity</p>
      </div>

      <div className="rounded-card border border-border bg-surface p-5 shadow-sm sm:p-6">
        {history.length === 0 ? (
          <p className="text-sm text-text-muted">No expense history yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {history.map((expense) => (
              <li
                key={expense.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-text">
                    {expense.title}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {formatDate(expense.spent_on)} · {expense.category}
                  </p>
                </div>
                <p className="flex-none font-semibold tabular-nums text-text">
                  {formatNaira(Number(expense.amount))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}