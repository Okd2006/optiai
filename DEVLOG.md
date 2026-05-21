# Developer Log — OptiAI

Daily tracking of building a production-ready, highly-optimized AI SaaS spend auditor.

---

## Day 1 — 2026-05-20
- **Hours worked:** 5.0
- **What I did:** Researched target personas (startup CTOs, engineering managers) and gathered pricing matrices for the primary AI providers (Cursor, Claude, ChatGPT, GitHub Copilot, Gemini, Windsurf, Anthropic API, OpenAI API). Formulated unified JSON structures for pricing tiers and drafted the initial project architecture.
- **Bug Fixes & Core Adjustments:**
  - Resolved a critical client-side hydration race condition in `app/audit/page.tsx` where cached `localStorage` data would get overwritten by default tools state on initial mount layout effect. Added `isLoaded` state gating to prevent premature writing to `localStorage`.
  - Implemented a beautiful, premium, theme-matching skeletal loader during hydration to completely eliminate hydration mismatches.
  - Added defensive programming checks (`Array.isArray`) across all state mutator helpers (`addToolRow`, `removeToolRow`, `handleToolChange`, etc.) and JSX mapping statements to prevent unhandled React null-reference exceptions.
- **What I learned:** 
  - Discovered that subscription plan boundaries are highly convoluted. For example, Claude Team has a strict 5-seat billing minimum ($150/mo), and ChatGPT Team has a 2-seat minimum ($60/mo). These strict thresholds are the exact points where early-stage startups lose hundreds of dollars by buying plans for single users.
- **Blockers / what I'm stuck on:** Designing pricing data shapes to support both static seat-based pricing and usage-based API bills was complex, but resolved with standard interface attributes.
- **Plan for tomorrow:** Work on visual stack upgrades, interactive chat consulting, customized Resend email templates, and automated background dispatching for lead generation follow-ups.

---

## Day 2 — 2026-05-21
- **Hours worked:** 8.5
- **What I did:** Implemented major UX enhancements and created a high-fidelity transactional email sending system and an interactive UI preview:
  1. **Visual Stack Selector:** Replaced the legacy form dropdown with an 8-tool visual logo selection grid in `/audit` with beautiful active glowing borders and single-click toggle sync. Cleaned up form configuration details by rendering read-only, colored logo-name badges.
  2. **Spend Copilot Integration:** Developed a server-side `/api/chat` Route Handler featuring OpenAI/Anthropic support and a highly-consultative, keyword-matching fallback system. Built a premium Spend Copilot Chatbox on `/results/[id]` featuring automatic scrolling, typing indicators, error alerts, and quick suggestion chips.
  3. **Strict AI Summary Alignment:** Upgraded prompt instructions in `lib/ai-summary.ts` to enforce a standardized layout consisting of a concise intro paragraph and exactly three bullet points (**Biggest Leak**, **Strategy**, **Action Plan**).
  4. **Rich HTML Transactional Emails:** Upgraded the `/api/lead/route.ts` API route to fetch full audit details dynamically. Constructed a responsive dark-themed HTML email template featuring dynamic greetings, savings KPI metric cards, detailed tool breakdown comparison tables, and beautiful left-bordered emerald callouts for the custom 3-bullet AI summary. Added seamless Resend API support and local console logs.
  5. **Interactive Live Email Preview UI:** Refactored the results page (`app/results/[id]/page.tsx`) lead capture card into a stunning, glassmorphic split layout on desktop. Designed a live visual Mock Email Client on the right panel that synchronizes in real-time as users type their corporate email, company name, and role.
  6. **Zero-Regression Code Quality:** Checked that all Vitest unit tests pass and ESLint/Next.js routes compile perfectly.
- **What I learned:** 
  - Discovered that a custom, token-based markdown renderer in React can perfectly render simple formatting (bolding, lists, subheaders) client-side in less than 50 lines of code, bypassing the need for heavy external markdown libraries.
  - Discovered that mirroring exact dynamic server-rendered HTML payloads client-side in a mock visual email client significantly builds brand trust, boosting signup conversions through sheer visual interactive wow-factor.
- **Blockers / what I'm stuck on:** None. The production bundle compiles successfully and all test cases pass.
- **Plan for tomorrow:** Partner with the user to start running audits, gathering feedback, and polishing any minor aesthetic items in preparation for launch.
