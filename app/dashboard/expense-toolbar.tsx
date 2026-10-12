"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/expense-categories";
import { buildFilterHref, type ExpenseQuery } from "@/lib/expense-query";

const DEBOUNCE_MS = 300;

const inputClass =
  "w-full rounded-button border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export function ExpenseToolbar({ query }: { query: ExpenseQuery }) {
  const router = useRouter();

  const [search, setSearch] = useState(query.search);
  const [focused, setFocused] = useState(false);
  // Tracks the last value that was pushed to the URL so we can tell our own
  // navigation apart from an external one (e.g. "Clear all").
  const pushedSearch = useRef(query.search);

  useEffect(() => {
    if (query.search !== pushedSearch.current) {
      pushedSearch.current = query.search;
      setSearch(query.search);
    }
  }, [query.search]);

  useEffect(() => {
    if (search === pushedSearch.current) return;

    const timer = setTimeout(() => {
      pushedSearch.current = search;
      router.push(buildFilterHref(query, { q: search || null }), {
        scroll: false,
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, query, router]);

  function setCategory(category: string) {
    router.push(buildFilterHref(query, { category: category || null }), {
      scroll: false,
    });
  }

  const hasFilters = Boolean(query.search) || query.category !== null;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="expense-search" className="sr-only">
            Search expenses
          </label>
          <input
            id="expense-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search descriptions..."
            className={`${inputClass} pr-9`}
          />
          {focused && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md px-1.5 text-sm text-text-muted transition-colors hover:text-text"
            >
              &times;
            </button>
          )}
        </div>

        <div className="sm:w-48">
          <label htmlFor="expense-category" className="sr-only">
            Filter by category
          </label>
          <select
            id="expense-category"
            value={query.category ?? ""}
            onChange={(event) => setCategory(event.target.value)}
            className={inputClass}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              pushedSearch.current = "";
              setSearch("");
              router.push(buildFilterHref(query, { q: null, category: null }), {
                scroll: false,
              });
            }}
            className="rounded-button border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-muted"
          >
            Clear filters
          </button>
        )}
      </div>

      {query.search && (
        <p className="text-xs text-text-muted">
          Showing results for &quot;{query.search}&quot;
          {query.category ? ` in ${query.category}` : ""}.
        </p>
      )}
    </div>
  );
}
