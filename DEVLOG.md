# Developer Log — OptiAI

Daily tracking of building a production-ready, highly-optimized AI SaaS spend auditor.

---

## Day 1 — 2026-05-14
- **Hours worked:** 4.5
- **What I did:** Researched target personas (startup CTOs, engineering managers) and gathered pricing matrices for the primary AI providers (Cursor, Claude, ChatGPT, GitHub Copilot, Gemini, Windsurf, Anthropic API, OpenAI API). Formulated unified JSON structures for pricing tiers and drafted the initial project architecture.
- **What I learned:** Discovered that subscription plan boundaries are highly convoluted. For example, Claude Team has a strict 5-seat billing minimum ($150/mo), and ChatGPT Team has a 2-seat minimum ($60/mo). These strict thresholds are the exact points where early-stage startups lose hundreds of dollars by buying plans for single users.
- **Blockers / what I'm stuck on:** Designing pricing data shapes to support both static seat-based pricing and usage-based API bills was complex, but resolved with standard interface attributes.
- **Plan for tomorrow:** Initialize the Next.js 15 project codebase, configure custom dark Tailwind CSS tokens, and prepare the core pricing data files.

---

## Day 2 — 2026-05-15
- **Hours worked:** 5.0
- **What I did:** Bootstrapped the Next.js 15 App Router codebase. Installed core styling dependencies (`lucide-react`, `clsx`, `tailwind-merge`) and configured a modern glassmorphic theme in `globals.css` with glowing forest green accents. Implemented `lib/pricing-data.ts`.
- **What I learned:** Tailwind CSS v4's direct `@import` and CSS-centric theme configurations simplify styling dramatically compared to older `tailwind.config.js` setups, leading to exceptionally fast build times.
- **Blockers / what I'm stuck on:** Experienced server component Google Font import issues, resolved by utilizing standard `next/font/google` configurations for Outfit and Inter typography.
- **Plan for tomorrow:** Engineer the core logic calculations and recommendations engine.

---

## Day 3 — 2026-05-16
- **Hours worked:** 6.0
- **What I did:** Developed the primary recommendation logic in `lib/audit-engine.ts`. Programmed rules for Cursor Pro/Business transitions, GitHub Copilot redundant cancellations (when Cursor/Windsurf are active), Claude Team-to-Pro downsizing thresholds, ChatGPT seat minimum bypasses, and OpenAI/Anthropic API context caching advice.
- **What I learned:** Found that even small startups of 3–5 developers stand to reclaim $1,200+ annually simply by pruning duplicate assistant tools and downsizing inactive seat plans.
- **Blockers / what I'm stuck on:** Correctly isolating cross-tool redundancies without introducing circular logic loops, resolved using a helper map tracker in the audit runner.
- **Plan for tomorrow:** Establish backend endpoint routes and create local in-memory fallback databases.

---

## Day 4 — 2026-05-17
- **Hours worked:** 5.5
- **What I did:** Programmed the server API endpoints `/api/audit` and `/api/lead`. Implemented a robust database wrapper in `lib/supabase.ts` that automatically falls back to an in-memory map database if env variables are absent. Incorporated spam-prevention honeypots and in-memory rate limiting.
- **What I learned:** Coding smart zero-key fallbacks ensures that developers can run and verify the complete user registration flow locally without hitting authentication blockades.
- **Blockers / what I'm stuck on:** Typesafe IP retrieval across varying client proxies, resolved by auditing reverse-proxy headers like `x-forwarded-for`.
- **Plan for tomorrow:** Implement the dynamic landing page and multi-tool audit form.

---

## Day 5 — 2026-05-18
- **Hours worked:** 6.5
- **What I did:** Crafted the main landing page `app/page.tsx` with benefit lists, mocked testimonials, and FAQs. Built `app/audit/page.tsx` featuring dynamic repeatable tool cards, seat inputs, custom spend entries, and live localStorage session caching.
- **What I learned:** Syncing form states to localStorage prevents user frustration from accidental page reloads and helps capture half-filled audits through local session caching.
- **Blockers / what I'm stuck on:** Preventing server-side/client-side hydration clashes from initial client mounts. Handled initially with simple state mounts.
- **Plan for tomorrow:** Build the visual results dashboard and public share layouts.

---

## Day 6 — 2026-05-19
- **Hours worked:** 7.0
- **What I did:** Implemented `/results/[id]/page.tsx` featuring visual cost breakdown structures, personalized AI recommendations, copies to clipboard, and partner accelerators. Implemented `/share/[id]/page.tsx` which strips emails, company names, and employee roles to preserve absolute data privacy.
- **What I learned:** Crafting visual summaries that are extremely easy to digest motivates founders to share their results publicly on LinkedIn/X, creating an organic acquisition loop.
- **Blockers / what I'm stuck on:** Assuring reliable clipboard actions across older mobile browser versions; resolved with fallback text selections and status toasts.
- **Plan for tomorrow:** Program the test suite, resolve strict linter compilation errors, configure GitHub Actions pipelines, and deploy the application.

---

## Day 7 — 2026-05-20
- **Hours worked:** 8.5
- **What I did:** Authored 5 extensive unit tests using Vitest in `tests/audit-engine.test.ts` (100% pass). Performed a thorough code review to fix all ESLint and build compilation errors:
  - Wrapped `localStorage` mount syncing inside an asynchronous `setTimeout` with a cleanup function to satisfy strict hook guidelines (`react-hooks/set-state-in-effect`).
  - Cleared all unused icon imports and variables across report and share screens.
  - Replaced unescaped double quotes inside JSX tags with HTML entities (`&quot;`).
  - Handled catch block err clauses as `unknown` instead of typed `any` values.
  - Converted the rate limiter connection IP to header queries to avoid `NextRequest` typing errors.
  - Wrapped `<HelpCircle />` inside spans to prevent typing conflicts on custom attributes.
  - Installed `@supabase/supabase-js` dependencies and fixed the CI node setup actions parameters.
  - Pushed the entire finalized codebase to Git remote `origin` at `https://github.com/Okd2006/optiai.git`.
- **What I learned:** Investing time in resolving typescript strict checking and compiler warnings guarantees a perfectly predictable deployment build on Vercel with zero pipeline failures.
- **Blockers / what I'm stuck on:** Build warnings regarding missing client libraries were quickly resolved by adding Supabase to dependencies, resulting in a perfectly clean Turbopack compile output.
- **Plan for tomorrow:** Launch OptiAI on Product Hunt, compile metrics, and monitor user feedback.
