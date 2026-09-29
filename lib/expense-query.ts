import { CATEGORIES } from "@/lib/expense-categories";

export const PAGE_SIZE = 8;
const MAX_PAGE_SIZE = 50;

export const SORT_COLUMNS = [
  { key: "spent_on", label: "Date" },
  { key: "title", label: "Description" },
  { key: "category", label: "Category" },
  { key: "amount", label: "Amount" },
] as const;

export type SortKey = (typeof SORT_COLUMNS)[number]["key"];
export type SortDir = "asc" | "desc";

const SORT_KEYS: readonly string[] = SORT_COLUMNS.map((c) => c.key);

export type RawSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type ExpenseQuery = {
  page: number;
  perPage: number;
  search: string;
  category: string | null;
  sort: SortKey;
  dir: SortDir;
};

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function parseExpenseQuery(
  raw: RawSearchParams
): ExpenseQuery {
  const page = Number.parseInt(first(raw.page), 10);
  const perPage = Number.parseInt(first(raw.perPage), 10);
  const sort = first(raw.sort);
  const dir = first(raw.dir);
  const category = first(raw.category);

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    perPage:
      Number.isFinite(perPage) && perPage > 0
        ? Math.min(perPage, MAX_PAGE_SIZE)
        : PAGE_SIZE,
    search: first(raw.q).trim().slice(0, 80),
    category: (CATEGORIES as readonly string[]).includes(category)
      ? category
      : null,
    sort: SORT_KEYS.includes(sort) ? (sort as SortKey) : "spent_on",
    dir: dir === "asc" ? "asc" : "desc",
  };
}

export function hasActiveFilters(query: ExpenseQuery) {
  return Boolean(query.search) || query.category !== null;
}

/**
 * Builds a `/dashboard` href from the current query with the given overrides.
 * `null` removes a parameter, `undefined` leaves it untouched.
 */
export function buildExpenseHref(
  query: ExpenseQuery,
  overrides: Partial<{
    page: number | null;
    q: string | null;
    category: string | null;
    sort: SortKey;
    dir: SortDir;
  }> = {}
) {
  const merged: Record<string, string> = {
    sort: query.sort,
    dir: query.dir,
  };

  if (query.search) merged.q = query.search;
  if (query.category) merged.category = query.category;
  if (query.page > 1) merged.page = String(query.page);

  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) {
      delete merged[key];
    } else if (value !== undefined) {
      merged[key] = String(value);
    }
  }

  if (merged.page === "1") delete merged.page;

  const search = new URLSearchParams(merged);

  return search.size > 0 ? `/dashboard?${search.toString()}` : "/dashboard";
}

/** Same as `buildExpenseHref` but always resets to the first page. */
export function buildFilterHref(
  query: ExpenseQuery,
  overrides: { q?: string | null; category?: string | null } = {}
) {
  return buildExpenseHref(query, { ...overrides, page: 1 });
}

/**
 * Escapes LIKE/ILIKE wildcards so user input is matched literally.
 */
export function toSearchPattern(search: string) {
  return `%${search.replace(/[%_\\]/g, "\\$&")}%`;
}

export function totalPages(count: number, perPage: number) {
  return Math.max(1, Math.ceil(count / perPage));
}

export function pageRange(
  current: number,
  pages: number,
  siblings = 1
): (number | "gap")[] {
  if (pages <= 1) return [1];

  const wanted = new Set<number>([1, pages, current]);
  for (let offset = 1; offset <= siblings; offset++) {
    if (current - offset > 1) wanted.add(current - offset);
    if (current + offset < pages) wanted.add(current + offset);
  }

  const sorted = [...wanted].filter((p) => p >= 1 && p <= pages).sort(
    (a, b) => a - b
  );

  const result: (number | "gap")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) result.push("gap");
    result.push(page);
    previous = page;
  }
  return result;
}
