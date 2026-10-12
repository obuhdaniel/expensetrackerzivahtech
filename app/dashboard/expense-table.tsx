"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteExpense } from "@/lib/actions/expenses";
import { SORT_COLUMNS, type SortDir, type SortKey } from "@/lib/expense-query";
import { formatShortNaira } from "@/lib/format";
import { ConfirmDialog } from "./confirm-dialog";
import { ExpenseCard, ExpenseRow, type Expense } from "./expense-row";
import { useToast } from "./toast-provider";

const thClass = "px-3 py-2 text-left font-medium";

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <span aria-hidden="true" className="text-text-muted/50">
        ↕
      </span>
    );
  }
  return (
    <span aria-hidden="true" className="text-primary">
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
        <p className="rounded-card border border-dashed border-border px-4 py-10 text-center text-sm text-text-muted">
          {isFiltered
            ? "No expenses match your filters — try clearing them."
            : 'No expenses recorded yet — click "Add expense" to get started.'}
        </p>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="space-y-3 sm:hidden">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onDelete={() => setPendingDelete(expense)}
              />
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[36rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
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
                          className={`inline-flex items-center gap-1 rounded-md px-1 py-0.5 transition-colors hover:text-primary ${
                            active ? "text-text" : ""
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
        </>
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
