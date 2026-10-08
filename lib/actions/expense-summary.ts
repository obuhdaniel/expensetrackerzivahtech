"use server";

import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import {
  ExpenseSummaryError,
  generateExpenseSummary,
  type ExpenseSummary,
} from "@/lib/ai/expense-summary";
import {
  buildSummaryStats,
  monthWindow,
  previousMonthWindow,
  summarizeMonth,
  type ExpenseStatRow,
  type MonthWindow,
} from "@/lib/expense-stats";

export type { ExpenseSummary };

export type ExpenseSummaryResult = {
  summary?: ExpenseSummary;
  error?: string;
};

async function fetchMonthRows(
  supabase: SupabaseClient<Database>,
  userId: string,
  window: MonthWindow
) {
  const { data, error } = await supabase
    .from("expenses")
    .select("title, amount, category")
    .eq("user_id", userId)
    .gte("spent_on", window.start)
    .lte("spent_on", window.end);

  if (error) throw new ExpenseSummaryError(error.message);

  return (data ?? []) as ExpenseStatRow[];
}

/**
 * Summarises the signed-in user's spending for the current month, comparing it
 * with the previous month when there is data to compare against.
 */
export async function generateMonthlySummary(): Promise<ExpenseSummaryResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const current = monthWindow(new Date());
  const previous = previousMonthWindow(current);

  try {
    const [currentRows, previousRows] = await Promise.all([
      fetchMonthRows(supabase, user.id, current),
      fetchMonthRows(supabase, user.id, previous),
    ]);

    if (currentRows.length === 0) {
      return {
        error: "There are no expenses recorded this month yet.",
      };
    }

    const summary = await generateExpenseSummary(
      buildSummaryStats({
        current: summarizeMonth(current, currentRows),
        previous: summarizeMonth(previous, previousRows),
      })
    );

    return { summary };
  } catch (error) {
    if (error instanceof ExpenseSummaryError) {
      return { error: error.message };
    }

    console.error("[expense-summary] unexpected failure", error);
    return { error: "Could not generate a summary. Please try again." };
  }
}