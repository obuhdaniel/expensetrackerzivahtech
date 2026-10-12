"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addExpense, type ExpenseState } from "@/lib/actions/expenses";
import { CATEGORIES } from "@/lib/expense-categories";
import { todayInputValue } from "@/lib/format";
import { useToast } from "./toast-provider";

const initialState: ExpenseState = {};

const inputClass =
  "w-full rounded-button border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-button bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
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
        className="inline-flex items-center gap-2 rounded-button bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="h-4 w-4"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add expense
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-4 grid gap-3 rounded-card border border-border bg-surface-muted/50 p-4 sm:grid-cols-2"
    >
      <div className="space-y-1.5">
        <label
          htmlFor="title"
          className="block text-xs font-medium text-text-muted"
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
          className="block text-xs font-medium text-text-muted"
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
          className="block text-xs font-medium text-text-muted"
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
          className="block text-xs font-medium text-text-muted"
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
        <p className="rounded-button bg-expense/10 px-3 py-2 text-sm text-expense sm:col-span-2">
          {state.error}
        </p>
      )}

      <div className="flex gap-2 sm:col-span-2">
        <SaveButton />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-button border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
