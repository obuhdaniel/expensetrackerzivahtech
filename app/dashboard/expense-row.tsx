"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateExpense, type ExpenseState } from "@/lib/actions/expenses";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/expense-categories";
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
  "w-full rounded-button border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

const labelClass = "block text-xs font-medium text-text-muted";

const primaryButtonClass =
  "rounded-button bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "rounded-button border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:opacity-60";

const dangerButtonClass =
  "rounded-button border border-expense/30 px-3 py-1.5 text-xs font-medium text-expense transition-colors hover:bg-expense/10";

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-text">
      <span
        className={`h-2 w-2 rounded-full ${
          CATEGORY_COLORS[category] ?? "bg-text-muted"
        }`}
      />
      {category}
    </span>
  );
}

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

function ExpenseEditForm({
  expense,
  onCancel,
}: {
  expense: Expense;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateExpense,
    initialState
  );
  const handledNonce = useRef<string | undefined>(undefined);
  const { notify } = useToast();

  useEffect(() => {
    if (!state.nonce || handledNonce.current === state.nonce) return;
    handledNonce.current = state.nonce;
    if (state.message) notify(state.message);
    onCancel();
  }, [state.nonce, state.message, notify, onCancel]);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={expense.id} />
      <div className="space-y-1.5">
        <label htmlFor={`title-${expense.id}`} className={labelClass}>
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
        <label htmlFor={`amount-${expense.id}`} className={labelClass}>
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
        <label htmlFor={`category-${expense.id}`} className={labelClass}>
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
        <label htmlFor={`spentOn-${expense.id}`} className={labelClass}>
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
        <p className="rounded-button bg-expense/10 px-3 py-2 text-sm text-expense sm:col-span-2">
          {state.error}
        </p>
      )}

      <div className="flex gap-2 sm:col-span-2">
        <SubmitButton
          pendingLabel="Saving..."
          className={primaryButtonClass}
        >
          Save
        </SubmitButton>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className={secondaryButtonClass}
        >
          Cancel
        </button>
      </div>
    </form>
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

  if (editing) {
    return (
      <tr className="bg-surface-muted/40">
        <td colSpan={5} className="px-3 py-4">
          <ExpenseEditForm
            expense={expense}
            onCancel={() => setEditing(false)}
          />
        </td>
      </tr>
    );
  }

  return (
    <tr className="transition-colors hover:bg-surface-muted/50">
      <td className="border-b border-border px-3 py-3 font-medium text-text">
        <p className="truncate">{expense.title}</p>
      </td>
      <td className="border-b border-border px-3 py-3 text-text-muted">
        {toDateInputValue(expense.spent_on)}
      </td>
      <td className="border-b border-border px-3 py-3">
        <CategoryBadge category={expense.category} />
      </td>
      <td className="border-b border-border px-3 py-3 text-right font-semibold tabular-nums text-text">
        {formatShortNaira(expense.amount)}
      </td>
      <td className="border-b border-border px-3 py-3">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-button border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-muted"
          >
            Edit
          </button>
          <button type="button" onClick={onDelete} className={dangerButtonClass}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export function ExpenseCard({
  expense,
  onDelete,
}: {
  expense: Expense;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <li className="rounded-card border border-border bg-surface p-4 shadow-sm">
      {editing ? (
        <ExpenseEditForm
          expense={expense}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-text">{expense.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <CategoryBadge category={expense.category} />
                <span className="text-xs text-text-muted">
                  {toDateInputValue(expense.spent_on)}
                </span>
              </div>
            </div>
            <p className="flex-none font-semibold tabular-nums text-text">
              {formatShortNaira(expense.amount)}
            </p>
          </div>
          <div className="mt-3 flex gap-2 border-t border-border pt-3">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex-1 rounded-button border border-border px-3 py-2 text-xs font-medium text-text transition-colors hover:bg-surface-muted"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex-1 rounded-button border border-expense/30 px-3 py-2 text-xs font-medium text-expense transition-colors hover:bg-expense/10"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
}
