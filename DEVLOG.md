# Developer Log — OptiAI

Daily tracking of building a production-ready AI SaaS spend auditor.

---

## Day 1 — 2026-05-14
- **Hours worked:** 4.5
- **What I did:** Researched the target market of startup CTOs and gathered pricing matrices for the primary AI providers (Cursor, Claude, ChatGPT, GitHub Copilot, Gemini, Windsurf, Anthropic API, OpenAI API). Created the initial core engineering system architecture design and drafted the database schemas.
- **What I learned:** Discovered that subscription plan boundaries are highly convoluted. For example, Claude Team has a strict 5-seat billing minimum ($150/mo), and ChatGPT Team has a 2-seat minimum ($60/mo). These strict thresholds are the exact points where early-stage startups lose hundreds of dollars by buying plans for single users.
- **Blockers / what I'm stuck on:** Nothing major. Setting up standard data shapes to handle both static seat subscriptions and variable usage-based API bills was complex, but we resolved it with a unified JSON pricing structure.
- **Plan for tomorrow:** Initialize the Next.js 15 project codebase, configure Tailwind CSS v4 variables, and prepare the core pricing data files.

---

## Day 2 — 2026-05-15
- **Hours worked:** 5.0
- **What I did:** Bootstrapped the Next.js 15 App Router codebase. Installed core libraries (`lucide-react`, `clsx`, `tailwind-merge`) and customized the CSS theme palette in `globals.css` with sleek dark glassmorphism and optimization forest green tokens. Written `lib/pricing-data.ts`.
- **What I learned:** Tailwind CSS v4's new `@import "tailwindcss"` and native `@theme` CSS structures make color configuration extremely elegant compared to old complex `tailwind.config.js` setups, yielding much smaller bundle outputs.
- **Blockers / what I'm stuck on:** Spent an hour debugging font imports in Server Component layouts, resolved by utilizing `next/font/google`'s Outfit and Inter modules.
- **Plan for tomorrow:** Design and program the logic pricing rules in the audit calculator engine.

---

## Day 3 — 2026-05-16
- **Hours worked:** 6.0
- **What I did:** Engineered the primary logic in `lib/audit-engine.ts`. Coded rules targeting down-sizing Cursor and Windsurf tiers, flagging GitHub Copilot duplicate extensions in teams active on Cursor, Claude Team minimum seat overrides, ChatGPT Team downgrades, and Gemini redundant chat tools.
- **What I learned:** Calculated that a single startup team with 4 developers utilizing duplicate Cursor and Copilot subscriptions alongside 2 idle Claude Team seats stands to reclaim over $1,200 annually from simple consolidation.
- **Blockers / what I'm stuck on:** Ensuring that variable usage API tools like Anthropic and OpenAI did not break standard seat calculations. Handled this with a dynamic `billingFrequency` usage handler.
- **Plan for tomorrow:** Develop backend API endpoints and compile database adapters supporting local memory mock fallbacks.

---

## Day 4 — 2026-05-17
- **Hours worked:** 5.5
- **What I did:** Created `/api/audit` and `/api/lead` routes. Programmed `lib/supabase.ts` adapter supporting automatic fallback to memory mapping if Supabase tokens are missing. Programmed invisible honeypot parameters and local rate limiters on the lead collection endpoint.
- **What I learned:** Incorporating fallback modes directly into server database calls makes local dev testing and demoing significantly smoother, as there is zero environmental config setup required to run a full product loop.
- **Blockers / what I'm stuck on:** Handling IP rate limiting across varying reverse-proxy headers in next serverless environments. Solved by reading `x-forwarded-for` and fallback server connections.
- **Plan for tomorrow:** Implement the dynamic landing page and multi-tool audit form.

---

## Day 5 — 2026-05-18
- **Hours worked:** 6.5
- **What I did:** Developed `app/page.tsx` with dynamic cards, FAQs, and pricing grids. Developed the multi-step form at `app/audit/page.tsx` with live seat calculations, plan selectors, dynamic repeatable additions, and active localStorage state caching.
- **What I learned:** Syncing form states to localStorage prevents user frustration from page reloads and helps capture half-filled audits through local session caching.
- **Blockers / what I'm stuck on:** Ensuring react client-side hydration did not collide with server-side page render timestamps. Resolved by running the localStorage cache fetch inside a mounted `useEffect`.
- **Plan for tomorrow:** Program the visual Results dashboard and public Share layout page.

---

## Day 6 — 2026-05-19
- **Hours worked:** 7.0
- **What I did:** Designed the visual dashboard `/results/[id]` incorporating cost breakdown comparisons, savings summaries, Credex consultative buttons, and lead form registers. Designed `/share/[id]` removing emails and company properties.
- **What I learned:** Designing reports to be extremely visual and uncluttered makes users significantly more eager to screenshot and share them on social platforms, acting as an organic acquisition loop.
- **Blockers / what I'm stuck on:** Clipboard copywriting actions occasionally failed on specific mobile browsers; fixed by wrapping standard navigator copy in robust try-catch handlers with toast notifications.
- **Plan for tomorrow:** Develop automated tests, configure CI/CD pipelines, and compile root technical analysis files.

---

## Day 7 — 2026-05-20
- **Hours worked:** 8.0
- **What I did:** Created a 5-case test suite using Vitest. Verified seat downgrades, redundant IDE extensions, optimal stack compliance, low-savings honesty messaging, and Credex credit CTAs. Configured the GitHub Actions CI pipeline and authored all business root markdown files.
- **What I learned:** Writing modular logic code makes unit testing incredibly simple and helps isolate calculations from Next.js server frameworks, bringing average test speeds down to under 20ms.
- **Blockers / what I'm stuck on:** An initial test failed due to a misaligned team size parameter in ChatGPT Enterprise rules; successfully fixed and re-run to secure 100% test success.
- **Plan for tomorrow:** Launch OptiAI on Product Hunt, gather initial feedback, and monitor analytics.
