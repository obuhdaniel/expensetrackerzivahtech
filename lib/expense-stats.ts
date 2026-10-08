import { toDateInputValue } from "@/lib/format";

export type ExpenseStatRow = {
  amount: number | string;
  category: string;
  title?: string | null;
};

export type CategoryTotal = {
  category: string;
  amount: number;
  count: number;
  percentage: number;
};

export type GroupedExpense = {
  title: string;
  amount: number;
  count: number;
};

export type MonthWindow = {
  /** Human readable label, e.g. "September 2026". */
  label: string;
  /** First day of the month as `YYYY-MM-DD`. */
  start: string;
  /** Last day of the month as `YYYY-MM-DD`. */
  end: string;
};

export type MonthlyStats = {
  window: MonthWindow;
  total: number;
  count: number;
  byCategory: Map<string, { amount: number; count: number }>;
  byTitle: Map<string, { amount: number; count: number }>;
};

/** The payload handed to the AI, mirroring the documented input contract. */
export type SummaryStats = {
  month: string;
  currency: string;
  total_spending: number;
  transaction_count: number;
  average_expense: number | null;
  previous_month: string;
  previous_month_total: number | null;
  change_percentage: number | null;
  categories: {
    name: string;
    amount: number;
    percentage: number;
    previous_month_amount: number;
    change_percentage: number | null;
  }[];
  top_expenses: GroupedExpense[];
};

export const CURRENCY = "NGN";
const MAX_TOP_EXPENSES = 5;

function round(amount: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((amount + Number.EPSILON) * factor) / factor;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/**
 * Percentage change between two amounts, or `null` when there is nothing
 * meaningful to compare against. Zero and missing baselines both yield `null`
 * so the model never receives an infinite or invented figure.
 */
function percentChange(current: number, previous: number) {
  if (previous <= 0) return null;
  return round(((current - previous) / previous) * 100, 1);
}

/** Resolves the calendar month a date falls in, as a queryable date window. */
export function monthWindow(date: Date): MonthWindow {
  return {
    label: monthLabel(date),
    start: toDateInputValue(new Date(date.getFullYear(), date.getMonth(), 1)),
    end: toDateInputValue(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  };
}

/** The month immediately before the given window, used for comparisons. */
export function previousMonthWindow(window: MonthWindow): MonthWindow {
  const parsed = new Date(`${window.start}T00:00:00`);
  return monthWindow(new Date(parsed.getFullYear(), parsed.getMonth() - 1, 1));
}

function tally(rows: ExpenseStatRow[], key: (row: ExpenseStatRow) => string) {
  const totals = new Map<string, { amount: number; count: number }>();

  for (const row of rows) {
    const name = key(row);
    if (!name) continue;

    const current = totals.get(name) ?? { amount: 0, count: 0 };
    current.amount += Number(row.amount) || 0;
    current.count += 1;
    totals.set(name, current);
  }

  return totals;
}

export function summarizeMonth(
  window: MonthWindow,
  rows: ExpenseStatRow[]
): MonthlyStats {
  return {
    window,
    total: rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    count: rows.length,
    byCategory: tally(rows, (row) => row.category),
    byTitle: tally(rows, (row) => row.title ?? ""),
  };
}

export function categoryTotals(
  stats: MonthlyStats
): CategoryTotal[] {
  return [...stats.byCategory.entries()]
    .map(([category, { amount, count }]) => ({
      category,
      amount,
      count,
      percentage: stats.total > 0 ? (amount / stats.total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function topExpenses(stats: MonthlyStats): GroupedExpense[] {
  return [...stats.byTitle.entries()]
    .map(([title, { amount, count }]) => ({ title, amount, count }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, MAX_TOP_EXPENSES);
}

/**
 * Joins the current month with the previous one into the flat, pre-calculated
 * payload the model is allowed to reason about. Fields that cannot be derived
 * (a percentage change without a comparable previous total) are left out so
 * the model never sees an invented number.
 */
export function buildSummaryStats({
  current,
  previous,
  currency = CURRENCY,
}: {
  current: MonthlyStats;
  previous: MonthlyStats;
  currency?: string;
}): SummaryStats {
  const previousTotal = previous.count > 0 ? previous.total : null;

  return {
    month: current.window.label,
    currency,
    total_spending: round(current.total),
    transaction_count: current.count,
    average_expense:
      current.count > 0 ? round(current.total / current.count) : null,
    previous_month: previous.window.label,
    previous_month_total: previousTotal === null ? null : round(previousTotal),
    change_percentage: percentChange(current.total, previousTotal ?? 0),
    categories: categoryTotals(current).map(
      ({ category, amount, percentage }) => {
        const previousAmount = previous.byCategory.get(category)?.amount ?? 0;
        return {
          name: category,
          amount: round(amount),
          percentage: round(percentage, 1),
          previous_month_amount: round(previousAmount),
          change_percentage: percentChange(amount, previousAmount),
        };
      }
    ),
    top_expenses: topExpenses(current).map(({ title, amount, count }) => ({
      title,
      amount: round(amount),
      count,
    })),
  };
}