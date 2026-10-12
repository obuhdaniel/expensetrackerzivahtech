<div align="center">
  <img src="public/logo.png" alt="KippaMe logo" width="520" />
  <p><strong>A clean, secure expense tracker for understanding where every naira goes.</strong></p>
  <p>Built with Next.js, Supabase, and Google Gemini.</p>
</div>

## About KippaMe

KippaMe is a personal expense manager designed for fast daily logging and clear monthly insights. Each user has a private account and can record spending, review category totals, find entries, and request an AI-generated overview of the current month.

For everyday instructions, see the [KippaMe User Guide](USER_GUIDE.md).

## Features

- Email/password registration, sign-in, and sign-out
- Private per-user data protected by Supabase Row Level Security
- Add, edit, and delete expenses with status feedback
- Eight built-in categories: Food, Transport, Rent, Utilities, Shopping, Health, Entertainment, and Other
- Current-month total, transaction count, top category, and category percentages
- Search by description and filter by category
- Sortable columns and paginated results
- Recent history containing up to 100 expenses
- Profile details including name, email, date of birth, and membership date
- On-demand Gemini summaries with previous-month comparisons when data is available
- Responsive desktop and mobile interface

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router and Server Actions) |
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Authentication | Supabase Auth |
| Database | Supabase Postgres with Row Level Security |
| AI | Google Gemini API (`gemini-3.1-flash-lite`) |
| Analytics | Vercel Analytics |
| Code quality | ESLint with Next.js configuration |

## Prerequisites

- Node.js 20 or later and npm
- A [Supabase](https://supabase.com/) project
- A [Google AI Studio](https://aistudio.google.com/) API key for AI summaries

Supabase is required for the application. The Gemini key is only required for AI summaries.

## Environment variables

Copy `.env.example` to `.env.local` and replace the placeholders.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Public URL of the Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase publishable/anonymous key used by the app |
| `GEMINI_API_KEY` | For AI summaries | Server-side key used for monthly summaries |

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

Do not commit `.env.local` or expose `GEMINI_API_KEY` in client-side code. The Supabase anonymous key is designed for client use; the included Row Level Security policies protect data access.

## Installation

1. Clone the repository and enter it:

   ```bash
   git clone <repository-url>
   cd expensetrackerzivahtech
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your environment file, then add your credentials:

   ```bash
   cp .env.example .env.local
   ```

4. In the Supabase dashboard, open **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the tables, indexes, triggers, and access policies.

5. In **Supabase → Authentication → URL Configuration**, set the local site URL to `http://localhost:3000`. If email confirmation is enabled, allow the appropriate redirect URLs too.

6. Start the application:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000), create an account, and add your first expense.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project structure

```text
app/                  Routes, layouts, and UI components
  dashboard/          Dashboard, history, profile, and expense controls
lib/
  actions/            Authentication, expense, and summary server actions
  ai/                 Gemini integration
  supabase/            Browser/server clients and database types
public/                Static assets, including the KippaMe logo
supabase/schema.sql    Database schema and security policies
proxy.ts               Supabase session refresh middleware
```

## Limitations

- The app tracks expenses only—not income, budgets, savings goals, or recurring transactions.
- Currency and formatting are fixed to Nigerian naira (NGN).
- Dashboard analytics cover the current calendar month only; there is no month selector or custom date range.
- History displays only the 100 most recent expenses and has no filters or pagination.
- Categories are predefined and cannot be customized.
- The profile is read-only, with no in-app password reset or account deletion flow.
- CSV/PDF import and export, receipt uploads, bank synchronization, and offline use are not available.
- AI summaries require current-month data, a valid Gemini key, network access, and API quota. Generated text may be imperfect and is not financial advice.
- Automated tests and continuous integration are not currently included.

## Security and privacy

Supabase Authentication identifies users, and database Row Level Security restricts profile and expense operations to the owning account. The Gemini summary receives calculated spending information derived from the signed-in user's records. Never place a Supabase service-role key in a public environment variable.

## Deployment

KippaMe can run on any platform supporting Next.js. To deploy on Vercel:

1. Import the repository.
2. Add the variables from `.env.example` in project settings.
3. Deploy.
4. Add the production domain to the allowed URLs in Supabase Authentication.

Run `npm run build` before deployment to catch type and build errors.

## Contributing

Create a focused branch, keep changes scoped, run `npm run lint` and `npm run build`, and open a pull request describing the problem and solution.

## License

No license file is currently included. Unless one is added, all rights remain with the project owner.
