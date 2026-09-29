"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/expense-categories";
import { formatShortNaira, toDateInputValue } from "@/lib/format";

export type ExpenseState = {
  error?: string;
  success?: boolean;
  message?: string;
  nonce?: string;
};

export type DeleteExpenseResult = {
  error?: string;
  message?: string;
};

async function requireUserId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
}

function parseExpenseInput(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const rawAmount = String(formData.get("amount") ?? "").trim();
  const category = String(formData.get("category") ?? "Other").trim();
  const spentOn = String(formData.get("spentOn") ?? "").trim();

  const amount = Number(rawAmount);

  if (!title) return { error: "Please add a description." as const };
  if (!rawAmount || isNaN(amount) || amount <= 0)
    return { error: "Please enter a valid amount in naira." as const };

  const spentOnDate = spentOn ? new Date(`${spentOn}T00:00:00`) : new Date();
  if (isNaN(spentOnDate.getTime()) || spentOnDate > new Date())
    return { error: "Please enter a valid date (not in the future)." as const };

  const finalCategory = (CATEGORIES as readonly string[]).includes(category)
    ? category
    : "Other";

  return {
    title,
    amount,
    category: finalCategory,
    spentOn: spentOn || toDateInputValue(spentOnDate),
  };
}

export async function addExpense(
  _prevState: ExpenseState,
  formData: FormData
): Promise<ExpenseState> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const parsed = parseExpenseInput(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { error } = await supabase.from("expenses").insert({
    user_id: userId,
    title: parsed.title,
    amount: parsed.amount,
    category: parsed.category,
    spent_on: parsed.spentOn,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return {
    success: true,
    message: `Added “${parsed.title}” · ${formatShortNaira(parsed.amount)}`,
    nonce: crypto.randomUUID(),
  };
}

export async function updateExpense(
  _prevState: ExpenseState,
  formData: FormData
): Promise<ExpenseState> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing expense id." };

  const parsed = parseExpenseInput(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { error } = await supabase
    .from("expenses")
    .update({
      title: parsed.title,
      amount: parsed.amount,
      category: parsed.category,
      spent_on: parsed.spentOn,
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return {
    success: true,
    message: `Updated “${parsed.title}” · ${formatShortNaira(parsed.amount)}`,
    nonce: crypto.randomUUID(),
  };
}

/**
 * Deletes an expense and returns a result instead of redirecting, so the
 * confirmation dialog can report failures back to the user.
 */
export async function deleteExpense(
  id: string
): Promise<DeleteExpenseResult> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  if (!id) return { error: "Missing expense id." };

  const { data, error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("title, amount")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "That expense no longer exists." };

  revalidatePath("/dashboard");
  return {
    message: `Deleted “${data.title}” · ${formatShortNaira(Number(data.amount))}`,
  };
}