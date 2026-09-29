"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteExpense } from "@/lib/actions/expenses";
import { SORT_COLUMNS, type SortDir, type SortKey } from "@/lib/expense-query";
import { formatShortNaira } from "@/lib/format";
import { ConfirmDialog } from "./confirm-dialog";
import { ExpenseRow, type Expense } from "./expense-row";
import { useToast } from "./toast-provider";

const thClass = "px-3 py-2 text-left font-medium";

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-600">
        ↕
      </span>
    );
  }
  return (
    <span aria-hidden="true" className="text-zinc-900 dark:text-zinc-100">
      {dir === "asc" ? "↑" : "↓"}
    </span>
  );
}

type SortHref = Record<SortKey, string>;

type ExpenseTableProps = {
  expenses: Expense[];
  sort: SortKey;
  dir: SortDir;
  sortHrefs: SortHref;
  isFiltered: boolean;
};

export function ExpenseTable({
  expenses,
  sort,
  dir,
  sortHrefs,
  isFiltered,
}: ExpenseTableProps) {
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);
  const { notify } = useToast();

  async function handleDelete() {
    if (!pendingDelete) return "Nothing to delete.";

    const result = await deleteExpense(pendingDelete.id);
    if (result.error) return result.error;

    setPendingDelete(null);
    if (result.message) notify(result.message);
    return null;
  }

  return (
    <div className="space-y-4">
      {expenses.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          {isFiltered
            ? "No expenses match your filters — try clearing them."
            : 'No expenses recorded yet — click "Add expense" to get started.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                {SORT_COLUMNS.map((column) => {
                  const active = sort === column.key;
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={
                        active
                          ? dir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                      className={`${thClass} ${
                        column.key === "amount" ? "text-right" : ""
                      }`}
                    >
                      <Link
                        href={sortHrefs[column.key]}
                        scroll={false}
                        className={`inline-flex items-center gap-1 rounded-md px-1 py-0.5 transition-colors hover:text-zinc-900 dark:hover:text-white ${
                          active ? "text-zinc-900 dark:text-zinc-100" : ""
                        }`}
                      >
                        {column.label}
                        <SortIndicator active={active} dir={dir} />
                      </Link>
                    </th>
                  );
                })}
                <th scope="col" className={`${thClass} text-right`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onDelete={() => setPendingDelete(expense)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this expense?"
        message={
          pendingDelete
            ? `“${pendingDelete.title}” · ${formatShortNaira(
                pendingDelete.amount
              )} will be permanently removed.`
            : ""
        }
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
