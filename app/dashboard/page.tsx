import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { AddExpenseForm } from "./expense-form";
import { ExpenseSummaryCard } from "./expense-summary-card";
import { ExpenseTable } from "./expense-table";
import { ExpenseToolbar } from "./expense-toolbar";
import { Pagination } from "./pagination";
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
  formatNaira,
  toDateInputValue,
} from "@/lib/format";
import { CATEGORY_COLORS } from "@/lib/expense-categories";

export const metadata: Metadata = {
  title: "Dashboard",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Your spending at a glance · {monthLabel}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              {isFiltered ? "Matching filters" : `Spent in ${monthLabel}`}
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-button bg-surface-muted text-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2m0 0v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7m16 5h-5a2 2 0 0 0 0 4h5" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-text">
            {formatNaira(total)}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            {filteredCount} expense{filteredCount === 1 ? "" : "s"} in{" "}
            {monthLabel}
          </p>
        </div>

        <div className="rounded-card border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Top category
            </p>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                breakdown[0]
                  ? CATEGORY_COLORS[breakdown[0][0]] ?? "bg-text-muted"
                  : "bg-border"
              }`}
            />
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-text">
            {breakdown[0]?.[0] ?? "—"}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            {breakdown[0] ? formatNaira(breakdown[0][1]) : "No data yet"}
          </p>
        </div>
      </div>

      <ExpenseSummaryCard monthLabel={monthLabel} />

      <div className="rounded-card border border-border bg-surface p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold tracking-tight text-text">
          Spending by category
        </h2>
        {breakdown.length === 0 ? (
          <p className="mt-4 text-sm text-text-muted">
            Add an expense to see the breakdown.
          </p>
        ) : (
          <ul className="mt-5 space-y-4">
            {breakdown.map(([category, amount]) => {
              const pct = total > 0 ? (amount / total) * 100 : 0;
              return (
                <li key={category}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-text">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          CATEGORY_COLORS[category] ?? "bg-text-muted"
                        }`}
                      />
                      {category}
                    </span>
                    <span className="text-text-muted">
                      {formatNaira(amount)} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className={`h-full rounded-full ${
                        CATEGORY_COLORS[category] ?? "bg-text-muted"
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

      <div className="rounded-card border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-text">
              Expenses
            </h2>
            <p className="text-sm text-text-muted">{monthLabel}</p>
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
    </div>
  );
}
