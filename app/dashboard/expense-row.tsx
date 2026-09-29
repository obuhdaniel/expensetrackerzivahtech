"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateExpense, type ExpenseState } from "@/lib/actions/expenses";
import { CATEGORIES } from "@/lib/expense-categories";
import {
  formatShortNaira,
  toDateInputValue,
  todayInputValue,
} from "@/lib/format";
import { useToast } from "./toast-provider";

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  spent_on: string;
};

const initialState: ExpenseState = {};

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

const actionClass =
  "rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800";

const cellClass =
  "border-b border-zinc-200 px-3 py-3 dark:border-zinc-800";

function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}

export function ExpenseRow({
  expense,
  onDelete,
}: {
  expense: Expense;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateExpense,
    initialState
  );
  const handledNonce = useRef<string | undefined>(undefined);
  const { notify } = useToast();

  useEffect(() => {
    if (!state.nonce || handledNonce.current === state.nonce) return;
    handledNonce.current = state.nonce;
    setEditing(false);
    if (state.message) notify(state.message);
  }, [state.nonce, state.message, notify]);

  if (editing) {
    return (
      <>
        <tr className="bg-zinc-50 dark:bg-zinc-950">
          <td colSpan={5} className="px-3 py-4">
            <form action={formAction} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={expense.id} />
              <div className="space-y-1.5">
                <label
                  htmlFor={`title-${expense.id}`}
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                >
                  Description
                </label>
                <input
                  id={`title-${expense.id}`}
                  name="title"
                  type="text"
                  required
                  defaultValue={expense.title}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor={`amount-${expense.id}`}
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                >
                  Amount (₦)
                </label>
                <input
                  id={`amount-${expense.id}`}
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  required
                  defaultValue={expense.amount}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor={`category-${expense.id}`}
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                >
                  Category
                </label>
                <select
                  id={`category-${expense.id}`}
                  name="category"
                  defaultValue={expense.category}
                  className={inputClass}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor={`spentOn-${expense.id}`}
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                >
                  Date
                </label>
                <input
                  id={`spentOn-${expense.id}`}
                  name="spentOn"
                  type="date"
                  max={todayInputValue()}
                  defaultValue={toDateInputValue(expense.spent_on)}
                  className={inputClass}
                />
              </div>

              {state.error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 sm:col-span-2 dark:bg-red-950/50 dark:text-red-400">
                  {state.error}
                </p>
              )}

              <div className="flex gap-2 sm:col-span-2">
                <SubmitButton
                  pendingLabel="Saving..."
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Save
                </SubmitButton>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={pending}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </td>
        </tr>
      </>
    );
  }

  return (
    <>
      <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50">
        <td className={`${cellClass} font-medium`}>
          <p className="truncate">{expense.title}</p>
        </td>
        <td className={`${cellClass} text-zinc-500 dark:text-zinc-400`}>
          {toDateInputValue(expense.spent_on)}
        </td>
        <td className={`${cellClass} text-zinc-500 dark:text-zinc-400`}>
          {expense.category}
        </td>
        <td className={`${cellClass} text-right font-semibold tabular-nums`}>
          {formatShortNaira(expense.amount)}
        </td>
        <td className={cellClass}>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={actionClass}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    </>
  );
}
