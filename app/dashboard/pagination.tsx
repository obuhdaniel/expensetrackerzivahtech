import Link from "next/link";
import { pageRange } from "@/lib/expense-query";

type PaginationProps = {
  page: number;
  pages: number;
  count: number;
  perPage: number;
  pageHref: (page: number) => string;
};

const linkClass =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors";

function itemClass(active: boolean, disabled = false) {
  if (disabled) {
    return `${linkClass} cursor-not-allowed border border-zinc-200 text-zinc-300 dark:border-zinc-800 dark:text-zinc-600`;
  }
  if (active) {
    return `${linkClass} border border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900`;
  }
  return `${linkClass} border border-zinc-300 bg-white text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800`;
}

export function Pagination({
  page,
  pages,
  count,
  perPage,
  pageHref,
}: PaginationProps) {
  if (count === 0) return null;

  const first = (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, count);

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Showing <span className="font-medium">{first}</span>–
        <span className="font-medium">{last}</span> of{" "}
        <span className="font-medium">{count}</span>
      </p>

      {pages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              scroll={false}
              className={itemClass(false)}
            >
              Previous
            </Link>
          ) : (
            <span aria-disabled="true" className={itemClass(false, true)}>
              Previous
            </span>
          )}

          {pageRange(page, pages).map((entry, index) =>
            entry === "gap" ? (
              <span
                key={`gap-${index}`}
                className={itemClass(false, true)}
                aria-hidden="true"
              >
                &hellip;
              </span>
            ) : (
              <Link
                key={entry}
                href={pageHref(entry)}
                scroll={false}
                aria-current={entry === page ? "page" : undefined}
                className={itemClass(entry === page)}
              >
                {entry}
              </Link>
            )
          )}

          {page < pages ? (
            <Link
              href={pageHref(page + 1)}
              scroll={false}
              className={itemClass(false)}
            >
              Next
            </Link>
          ) : (
            <span aria-disabled="true" className={itemClass(false, true)}>
              Next
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
