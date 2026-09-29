import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { logout } from "@/lib/actions/auth";
import { AddExpenseForm } from "./expense-form";
import { ExpenseTable } from "./expense-table";
import { ExpenseToolbar } from "./expense-toolbar";
import { Pagination } from "./pagination";
import { ToastProvider } from "./toast-provider";
import type { Expense } from "./expense-row";
import {
  buildExpenseHref,
  hasActiveFilters,
  parseExpenseQuery,
  toSearchPattern,
  totalPages,
  SORT_COLUMNS,
  type SortDir,
  type SortKey,
} from "@/lib/expense-query";
import {
  formatDate,
  formatNaira,
  toDateInputValue,
} from "@/lib/format";

const CATEGORY_COLORS: Record<string, string> = {
  Food: "bg-emerald-500",
  Transport: "bg-sky-500",
  Rent: "bg-violet-500",
  Utilities: "bg-amber-500",
  Shopping: "bg-pink-500",
  Health: "bg-rose-500",
  Entertainment: "bg-indigo-500",
  Other: "bg-zinc-400",
};

function sortHrefsFor(
  query: ReturnType<typeof parseExpenseQuery>
): Record<SortKey, string> {
  return Object.fromEntries(
    SORT_COLUMNS.map(({ key }) => {
      const dir: SortDir =
        query.sort === key && query.dir === "asc" ? "desc" : "asc";
      return [key, buildExpenseHref(query, { sort: key, dir, page: 1 })];
    })
  ) as Record<SortKey, string>;
}

type ExpenseScope = {
  userId: string;
  monthStart: string;
  monthEnd: string;
  search: string;
  category: string | null;
};

/** Applies the month window, ownership, search and category filters. */
function scopedExpenses<C extends string>(
  supabase: SupabaseClient<Database>,
  scope: ExpenseScope,
  columns: C,
  countOption?: { count: "exact" }
) {
  const builder = supabase
    .from("expenses")
    .select(columns, countOption)
    .eq("user_id", scope.userId)
    .gte("spent_on", scope.monthStart)
    .lte("spent_on", scope.monthEnd);

  const searched = scope.search
    ? builder.ilike("title", toSearchPattern(scope.search))
    : builder;

  return scope.category ? searched.eq("category", scope.category) : searched;
}

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const params = await searchParams;
  const query = parseExpenseQuery(params);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, date_of_birth, created_at")
    .eq("id", user.id)
    .single();

  const now = new Date();
  const monthStart = toDateInputValue(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );
  const monthEnd = toDateInputValue(
    new Date(now.getFullYear(), now.getMonth() + 1, 0)
  );
  const monthLabel = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const scope: ExpenseScope = {
    userId: user.id,
    monthStart,
    monthEnd,
    search: query.search,
    category: query.category,
  };

  // Aggregates + total count for the whole filtered set, so the summary cards
  // and category breakdown stay correct regardless of the current page.
  const { data: summaryData, count } = await scopedExpenses(
    supabase,
    scope,
    "amount, category",
    { count: "exact" }
  )
    .order("spent_on", { ascending: false })
    .order("id", { ascending: false });

  const filteredCount = count ?? 0;
  const pages = totalPages(filteredCount, query.perPage);
  const page = Math.min(query.page, pages);

  const { data: pageData } = await scopedExpenses(
    supabase,
    scope,
    "id,title,amount,category,spent_on"
  )
    .order(query.sort, { ascending: query.dir === "asc" })
    .order("id", { ascending: query.dir === "asc" })
    .range((page - 1) * query.perPage, page * query.perPage - 1);

  const expenses: Expense[] = (pageData ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    amount: Number(e.amount),
    category: e.category,
    spent_on: e.spent_on,
  }));

  const summary = summaryData ?? [];
  const total = summary.reduce((sum, e) => sum + Number(e.amount), 0);

  const byCategory = new Map<string, number>();
  for (const e of summary) {
    byCategory.set(
      e.category,
      (byCategory.get(e.category) ?? 0) + Number(e.amount)
    );
  }
  const breakdown = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);

  const isFiltered = hasActiveFilters(query);
  const sortHrefs = sortHrefsFor(query);

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
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-lg font-semibold tracking-tight">Bext</span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Log out
            </button>
          </form>
        </header>

        <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-base font-semibold text-white dark:bg-white dark:text-zinc-900">
                {initials}
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">{name}</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {user.email} · Member since {formatDate(user.created_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {isFiltered ? "Matching filters" : `Spent in ${monthLabel}`}
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight">
                {formatNaira(total)}
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {filteredCount} expense{filteredCount === 1 ? "" : "s"} in{" "}
                {monthLabel}
              </p>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Top category
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight">
                {breakdown[0]?.[0] ?? "—"}
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {breakdown[0] ? formatNaira(breakdown[0][1]) : "No data yet"}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold tracking-tight">
              Spending by category
            </h2>
            {breakdown.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                Add an expense to see the breakdown.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {breakdown.map(([category, amount]) => {
                  const pct = total > 0 ? (amount / total) * 100 : 0;
                  return (
                    <li key={category}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{category}</span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {formatNaira(amount)} · {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className={`h-full rounded-full ${
                            CATEGORY_COLORS[category] ?? "bg-zinc-400"
                          }`}
                          style={{ width: `${Math.max(pct, 1)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Expenses
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {monthLabel}
                </p>
              </div>
              <AddExpenseForm />
            </div>

            <div className="mt-6">
              <ExpenseToolbar query={query} />
            </div>

            <div className="mt-4">
              <ExpenseTable
                expenses={expenses}
                sort={query.sort}
                dir={query.dir}
                sortHrefs={sortHrefs}
                isFiltered={isFiltered}
              />
            </div>

            <div className="mt-6">
              <Pagination
                page={page}
                pages={pages}
                count={filteredCount}
                perPage={query.perPage}
                pageHref={(target) => buildExpenseHref(query, { page: target })}
              />
            </div>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
