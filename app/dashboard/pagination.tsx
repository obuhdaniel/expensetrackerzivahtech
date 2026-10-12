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
  "inline-flex h-8 min-w-8 items-center justify-center rounded-button px-2 text-sm font-medium transition-colors";

function itemClass(active: boolean, disabled = false) {
  if (disabled) {
    return `${linkClass} cursor-not-allowed border border-border text-text-muted/50`;
  }
  if (active) {
    return `${linkClass} border border-primary bg-primary text-white`;
  }
  return `${linkClass} border border-border bg-surface text-text transition-colors hover:bg-surface-muted`;
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
      <p className="text-xs text-text-muted">
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
