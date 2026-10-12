import Image from "next/image";
import Link from "next/link";

function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="KippaMe"
      width={943}
      height={265}
      priority
      className={className}
    />
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center">
          <Logo className="h-8 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-text-muted md:flex">
          <a href="#features" className="transition-colors hover:text-primary">
            Features
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-primary">
            How it works
          </a>
          <a href="#why" className="transition-colors hover:text-primary">
            Why KippaMe
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-button px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-muted sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="inline-flex rounded-button bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-lime/35 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-[-8%] h-80 w-80 rounded-full bg-gold/20 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Personal finance, simplified
          </span>

          <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Track every naira.
            <span className="block text-primary">Know where it goes.</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg text-text-muted">
            KippaMe is the simple expense tracker that helps you log daily
            spending, see exactly how your money splits across categories, and
            get AI-powered summaries of your spending habits — all in one clean
            dashboard.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-button bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-button border border-border bg-surface px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-muted"
            >
              Log in
            </Link>
          </div>

          <p className="mt-4 text-sm text-text-muted">
            Free to use · Secure sign-in · No card required
          </p>
        </div>

        <div className="relative">
          <div className="rounded-card border border-border bg-surface p-6 shadow-xl shadow-forest/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  Spent this month
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight">
                  ₦248,500
                </p>
              </div>
              <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-primary">
                October
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-button bg-surface-muted p-3">
                <p className="text-xs text-text-muted">Income</p>
                <p className="mt-0.5 text-sm font-semibold text-income">
                  + ₦520,000
                </p>
              </div>
              <div className="rounded-button bg-surface-muted p-3">
                <p className="text-xs text-text-muted">Expenses</p>
                <p className="mt-0.5 text-sm font-semibold text-expense">
                  − ₦248,500
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                { label: "Food", value: "₦96,000", pct: 78, color: "bg-primary" },
                { label: "Transport", value: "₦54,000", pct: 44, color: "bg-info" },
                { label: "Rent", value: "₦45,000", pct: 36, color: "bg-gold" },
                { label: "Shopping", value: "₦32,000", pct: 26, color: "bg-lime" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{row.label}</span>
                    <span className="text-text-muted">{row.value}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className={`h-full rounded-full ${row.color}`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-button border border-border bg-surface-muted/60 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                AI summary
              </p>
              <p className="mt-1.5 text-sm text-text">
                Food is your largest category this month at 39% of spending — up
                from last month. Trimming eating out could free up about ₦24,000.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TaglineStrip() {
  const taglines = ["Log it.", "Track it.", "Own it."];
  return (
    <section className="border-y border-border bg-forest">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 px-6 py-8 text-center sm:flex-row sm:gap-8">
        {taglines.map((tagline, index) => (
          <div key={tagline} className="flex items-center gap-8">
            <span className="text-2xl font-bold tracking-tight text-white">
              {tagline}
            </span>
            {index < taglines.length - 1 && (
              <span className="hidden h-2 w-2 rounded-full bg-lime sm:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

const FEATURES = [
  {
    title: "Effortless logging",
    body: "Add an expense in seconds with just an amount, category, and date. No clutter, no complicated forms.",
    icon: (
      <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
    ),
  },
  {
    title: "AI spending summaries",
    body: "Get a plain-English read on where your money went and what stands out, generated from your own data.",
    icon: (
      <path
        d="M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "Category insights",
    body: "See your top spending categories and how each month breaks down, with clear visual percentages.",
    icon: (
      <path
        d="M4 19V5m0 14h16M8 15v-4m4 4V8m4 7v-6"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "Monthly history",
    body: "Scroll back through past months, filter and search your records, and spot trends before they become habits.",
    icon: (
      <path
        d="M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Private by default",
    body: "Your records are tied to your account and secured with Supabase auth. Your finances stay yours.",
    icon: (
      <path
        d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6l-7-3Z"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Anywhere access",
    body: "A fast, responsive dashboard that works just as well on your phone as it does on your laptop.",
    icon: (
      <path
        d="M8 21h8m-4-4v4M5 3h14v14H5V3Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Value proposition
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need to stay on top of your spending
        </h2>
        <p className="mt-4 text-lg text-text-muted">
          KippaMe turns scattered spending into a clear picture — so you can make
          decisions with confidence instead of guesswork.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-card border border-border bg-surface p-6 transition-shadow hover:shadow-lg hover:shadow-forest/5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-button bg-surface-muted text-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-5 w-5"
              >
                {feature.icon}
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              {feature.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  {
    title: "Create your free account",
    body: "Sign up in under a minute with your name, email, and a password. No payment details needed.",
  },
  {
    title: "Log your expenses",
    body: "Record what you spend as it happens. Pick a category, enter the amount, and you're done.",
  },
  {
    title: "Read your insights",
    body: "Watch your monthly totals, category breakdowns, and AI summaries update automatically.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Up and running in three simple steps
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-card bg-primary text-lg font-bold text-white">
                {index + 1}
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const DIFFERENTIATORS = [
  "Built around daily logging — not monthly budgeting spreadsheets.",
  "Designed for real spending in naira, with figures you recognise instantly.",
  "AI summaries that explain the numbers instead of just charting them.",
  "One clean dashboard for totals, categories, history, and insight.",
];

function Positioning() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Positioning
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Not a spreadsheet. Not a bank statement. KippaMe.
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Most people know roughly what they earn but not exactly what they
            spend. KippaMe is built for the everyday spender who wants clarity
            without complexity — a tool that respects your time and your wallet.
          </p>

          <ul className="mt-8 space-y-4">
            {DIFFERENTIATORS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-surface-muted text-primary">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                  >
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                </span>
                <span className="text-text">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-card border border-border bg-surface p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-text-muted">
              The old way
            </p>
            <ul className="mt-4 space-y-3 text-sm text-text-muted">
              <li>Receipts lost in your pocket</li>
              <li>Guessing what you spent last month</li>
              <li>Bank alerts you ignore</li>
              <li>Spreadsheets you never update</li>
            </ul>
          </div>
          <div className="rounded-card border border-primary/25 bg-forest p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-wider text-lime">
              With KippaMe
            </p>
            <ul className="mt-4 space-y-3 text-sm text-white/90">
              <li>Every expense logged in seconds</li>
              <li>Month-by-month history at a glance</li>
              <li>Categories that show where money goes</li>
              <li>AI summaries that actually explain it</li>
            </ul>
          </div>
          <div className="rounded-card bg-lime p-6 sm:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-forest">
              Our promise
            </p>
            <p className="mt-2 text-lg font-semibold text-forest">
              Simple enough to use every day, powerful enough to change how you
              spend.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 lg:pb-24">
      <div className="relative overflow-hidden rounded-card bg-primary px-8 py-14 text-center sm:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-lime/25 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-gold/20 blur-2xl"
        />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start tracking in minutes
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
            Join KippaMe and turn everyday spending into clear, actionable
            insight — free.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-button bg-white px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-lime"
            >
              Create your free account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-button border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo className="h-7 w-auto" />
          <p className="text-sm text-text-muted">
            Track every naira. Know where it goes.
          </p>
        </div>

        <nav className="flex items-center gap-6 text-sm font-medium text-text-muted">
          <a href="#features" className="transition-colors hover:text-primary">
            Features
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-primary">
            How it works
          </a>
          <Link href="/login" className="transition-colors hover:text-primary">
            Log in
          </Link>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-6 py-5 text-center text-xs text-text-muted sm:text-left">
          © {new Date().getFullYear()} KippaMe. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <TaglineStrip />
        <Features />
        <HowItWorks />
        <Positioning />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
