"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/expense-categories";
import { buildFilterHref, type ExpenseQuery } from "@/lib/expense-query";

const DEBOUNCE_MS = 300;

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

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
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md px-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
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
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Clear filters
          </button>
        )}
      </div>

      {query.search && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Showing results for &quot;{query.search}&quot;
          {query.category ? ` in ${query.category}` : ""}.
        </p>
      )}
    </div>
  );
}
