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
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Recent expense activity
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {history.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No expense history yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <th className="border-b border-zinc-200 pb-3 pr-4 dark:border-zinc-800">
                    Description
                  </th>
                  <th className="border-b border-zinc-200 pb-3 pr-4 dark:border-zinc-800">
                    Date
                  </th>
                  <th className="border-b border-zinc-200 pb-3 pr-4 dark:border-zinc-800">
                    Category
                  </th>
                  <th className="border-b border-zinc-200 pb-3 pl-4 text-right dark:border-zinc-800">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50"
                  >
                    <td className="border-b border-zinc-200 py-3 pr-4 font-medium dark:border-zinc-800">
                      {expense.title}
                    </td>
                    <td className="border-b border-zinc-200 py-3 pr-4 text-zinc-500 dark:text-zinc-400">
                      {formatDate(expense.spent_on)}
                    </td>
                    <td className="border-b border-zinc-200 py-3 pr-4 text-zinc-500 dark:text-zinc-400">
                      {expense.category}
                    </td>
                    <td className="border-b border-zinc-200 py-3 pl-4 text-right font-semibold tabular-nums dark:border-zinc-800">
                      {formatNaira(Number(expense.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}