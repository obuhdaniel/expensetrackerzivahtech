export const CATEGORIES = [
  "Food",
  "Transport",
  "Rent",
  "Utilities",
  "Shopping",
  "Health",
  "Entertainment",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Brand-aligned accent per category, used for dots, badges and breakdown bars. */
export const CATEGORY_COLORS: Record<string, string> = {
  Food: "bg-primary",
  Transport: "bg-info",
  Rent: "bg-forest",
  Utilities: "bg-gold",
  Shopping: "bg-lime",
  Health: "bg-expense",
  Entertainment: "bg-warning",
  Other: "bg-text-muted",
};
