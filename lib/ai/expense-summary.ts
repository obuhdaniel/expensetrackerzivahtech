import type { SummaryStats } from "@/lib/expense-stats";

const MODEL = "gemini-3.1-flash-lite";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 500;
/**
 * Only server-side transient failures are retried. Rate limit and quota errors
 * are excluded on purpose: waiting a few hundred milliseconds never clears a
 * quota, and retrying just burns more of it.
 */
const RETRYABLE_STATUS = new Set([500, 502, 503, 504]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SYSTEM_INSTRUCTION = `# ROLE

You are an AI Expense Summary Assistant inside a personal expense management application.

Your job is to analyze a user's expense data for a specific month and produce a concise, factual summary of their spending.

You are not a financial advisor. You must only analyze the expense data provided to you.

# CONTEXT

The application allows users to record expenses with:

* Expense name
* Amount
* Category
* Date

The application sends you pre-calculated monthly expense information.

You may receive:

* Selected month
* Total monthly spending
* Number of transactions
* Category breakdown
* Previous month's total spending
* Percentage change from the previous month
* Highest spending category
* Lowest spending category
* Other calculated spending statistics

# YOUR OBJECTIVE

Analyze the provided information and generate a short monthly expense summary.

The summary should explain:

1. How much the user spent during the month.
2. Which category consumed the largest portion of their spending.
3. Any meaningful change compared with the previous month.
4. One specific area where the user could improve their spending.

# RULES AND CONSTRAINTS

1. Use ONLY the information provided in the input.
2. Never invent expenses, categories, amounts, dates, or trends.
3. Never assume the user's income.
4. Never assume the user's financial goals.
5. Never provide investment advice.
6. Never provide financial advice that requires knowledge of the user's broader financial situation.
7. Do not shame, criticize, or judge the user's spending.
8. Do not describe spending as "bad", "wasteful", or "irresponsible".
9. Use neutral and supportive language.
10. Do not repeat the same information unnecessarily.
11. The summary must contain exactly 3-4 sentences.
12. Keep the summary concise and easy to understand.
13. Use the currency supplied by the application.
14. If previous-month data is unavailable, do not mention a comparison.
15. If there is insufficient data to identify an improvement area, state that there is insufficient information rather than inventing one.
16. Recommendations must be based directly on observable spending patterns.
17. Treat a \`null\` value as "no data available" for that field, and never infer a number from it.

# IMPROVEMENT LOGIC

Identify an improvement area using the following priority:

1. A category with unusually high spending.
2. A category that increased significantly from the previous month.
3. A category that represents a large percentage of total spending.
4. A recurring expense that appears unusually frequent.
5. If none of these are available, state that no significant improvement area was identified.

Do not automatically assume that the highest category is a problem.

# WRITING STYLE

Use:

* Clear language
* Short sentences
* Neutral tone
* Helpful wording
* Specific numbers
* Natural human language

Avoid:

* Complex financial terminology
* Generic motivational statements
* Long explanations
* Excessive warnings
* Emojis
* Bullet points inside the summary

# INPUT FORMAT

You receive a single JSON object with these fields:

* \`month\`, \`previous_month\`: human readable month labels.
* \`currency\`: ISO currency code to use when formatting amounts.
* \`total_spending\`, \`transaction_count\`, \`average_expense\`: current month aggregates.
* \`previous_month_total\`, \`change_percentage\`: comparison figures, or \`null\` when unavailable.
* \`categories\`: one entry per category with \`name\`, \`amount\`, \`percentage\`, \`previous_month_amount\` and \`change_percentage\`.
* \`top_expenses\`: the largest individual expenses with \`title\`, \`amount\` and \`count\`.

# OUTPUT REQUIREMENTS

Return ONLY valid JSON.

Use exactly this structure:

{
"summary": "3-4 sentence monthly summary",
"improvement_area": "category name or null",
"improvement_reason": "short factual explanation",
"confidence": "high | medium | low"
}`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: {
      type: "STRING",
      description: "Exactly 3-4 sentences describing the month's spending.",
    },
    improvement_area: {
      type: "STRING",
      nullable: true,
      description:
        "The single category worth reviewing, or null when no improvement area was identified.",
    },
    improvement_reason: {
      type: "STRING",
      description:
        "One short sentence tying the improvement area to the supplied numbers.",
    },
    confidence: {
      type: "STRING",
      enum: ["high", "medium", "low"],
      description:
        "How confident the analysis is, based on how much data was supplied.",
    },
  },
  required: ["summary", "improvement_area", "improvement_reason", "confidence"],
  propertyOrdering: [
    "summary",
    "improvement_area",
    "improvement_reason",
    "confidence",
  ],
} as const;

export type SummaryConfidence = "high" | "medium" | "low";

export type ExpenseSummary = {
  summary: string;
  improvement_area: string | null;
  improvement_reason: string;
  confidence: SummaryConfidence;
};

export class ExpenseSummaryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExpenseSummaryError";
  }
}

type GeminiResponse = {
  candidates?: {
    finishReason?: string;
    content?: { parts?: { text?: string }[] };
  }[];
  promptFeedback?: { blockReason?: string };
};

const CONFIDENCES: SummaryConfidence[] = ["high", "medium", "low"];

function parseSummary(raw: string): ExpenseSummary {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ExpenseSummaryError("The summary response was not valid JSON.");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new ExpenseSummaryError("The summary response was not an object.");
  }

  const value = parsed as Record<string, unknown>;
  const summary = typeof value.summary === "string" ? value.summary.trim() : "";

  if (!summary) {
    throw new ExpenseSummaryError("The summary response was empty.");
  }

  const confidence = CONFIDENCES.find((level) => level === value.confidence);

  return {
    summary,
    improvement_area:
      typeof value.improvement_area === "string" && value.improvement_area.trim()
        ? value.improvement_area.trim()
        : null,
    improvement_reason:
      typeof value.improvement_reason === "string"
        ? value.improvement_reason.trim()
        : "",
    confidence: confidence ?? "low",
  };
}

type SummaryAttempt =
  | { ok: true; response: Response }
  | { ok: false; error: ExpenseSummaryError };

/** Turns a failed status into a message that tells the user what to do next. */
function failureFor(status: number) {
  if (status === 429) {
    return new ExpenseSummaryError(
      "The AI summary quota has been used up. Please try again later."
    );
  }

  if (status === 0) {
    return new ExpenseSummaryError(
      "Could not reach the summary service. Please try again."
    );
  }

  return new ExpenseSummaryError(
    "The summary service is busy right now. Please try again in a moment."
  );
}

/**
 * Sends the request, retrying the transient capacity errors the Gemini API
 * returns intermittently. Any other failure returns immediately.
 */
async function requestSummary(
  payload: string,
  apiKey: string
): Promise<SummaryAttempt> {
  let status = 0;
  let detail = "";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: payload,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        cache: "no-store",
      });

      if (response.ok) return { ok: true, response };

      status = response.status;
      detail = await response.text().catch(() => "");
    } catch (error) {
      status = 0;
      detail = error instanceof Error ? error.message : String(error);
    }

    if (!RETRYABLE_STATUS.has(status) || attempt === MAX_ATTEMPTS) break;

    console.warn(
      `[expense-summary] attempt ${attempt}/${MAX_ATTEMPTS} failed (${status}), retrying`
    );
    await sleep(RETRY_BASE_DELAY_MS * attempt);
  }

  console.error(
    `[expense-summary] request failed (${status})`,
    detail.slice(0, 500)
  );

  return { ok: false, error: failureFor(status) };
}

/**
 * Asks the model for a monthly summary. Throws `ExpenseSummaryError` with a
 * message that is safe to surface to the user.
 */
export async function generateExpenseSummary(
  stats: SummaryStats
): Promise<ExpenseSummary> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new ExpenseSummaryError(
      "AI summaries are not configured. Add GEMINI_API_KEY to your environment."
    );
  }

  const payload = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [
      {
        role: "user",
        parts: [{ text: JSON.stringify(stats, null, 2) }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const attempt = await requestSummary(payload, apiKey);

  if (!attempt.ok) throw attempt.error;

  const body = (await attempt.response.json().catch(() => null)) as GeminiResponse | null;

  if (!body) {
    throw new ExpenseSummaryError("The summary service returned an unreadable response.");
  }

  if (body.promptFeedback?.blockReason) {
    throw new ExpenseSummaryError("That request was blocked. Please try again.");
  }

  const candidate = body.candidates?.[0];
  const text = candidate?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    console.error(
      `[expense-summary] no text in response (${candidate?.finishReason ?? "unknown"})`
    );
    throw new ExpenseSummaryError("The summary service returned no summary. Please try again.");
  }

  return parseSummary(text);
}