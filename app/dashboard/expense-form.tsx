"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addExpense, type ExpenseState } from "@/lib/actions/expenses";
import { CATEGORIES } from "@/lib/expense-categories";
import { todayInputValue } from "@/lib/format";
import { useToast } from "./toast-provider";

const initialState: ExpenseState = {};

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      {pending ? "Saving..." : "Save expense"}
    </button>
  );
}

export function AddExpenseForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(addExpense, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const handledNonce = useRef<string | undefined>(undefined);
  const { notify } = useToast();

  useEffect(() => {
    if (!state.nonce || handledNonce.current === state.nonce) return;
    handledNonce.current = state.nonce;
    formRef.current?.reset();
    if (state.message) notify(state.message);
  }, [state.nonce, state.message, notify]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        + Add expense
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-4 grid gap-3 sm:grid-cols-2"
    >
      <div className="space-y-1.5">
        <label
          htmlFor="title"
          className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          Description
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="e.g. Groceries"
          className={inputClass}
        />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="amount"
          className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          Amount (₦)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          required
          placeholder="0.00"
          className={inputClass}
        />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="category"
          className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          Category
        </label>
        <select
          id="category"
          name="category"
          defaultValue="Food"
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
          htmlFor="spentOn"
          className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          Date
        </label>
        <input
          id="spentOn"
          name="spentOn"
          type="date"
          max={todayInputValue()}
          defaultValue={todayInputValue()}
          className={inputClass}
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 sm:col-span-2 dark:bg-red-950/50 dark:text-red-400">
          {state.error}
        </p>
      )}

      <div className="flex gap-2 sm:col-span-2">
        <SaveButton />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
