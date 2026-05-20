# Developer Log — OptiAI

Daily tracking of building a production-ready, highly-optimized AI SaaS spend auditor.

---

## Day 1 — 2026-05-20
- **Hours worked:** 5.0
- **What I did:** Researched target personas (startup CTOs, engineering managers) and gathered pricing matrices for the primary AI providers (Cursor, Claude, ChatGPT, GitHub Copilot, Gemini, Windsurf, Anthropic API, OpenAI API). Formulated unified JSON structures for pricing tiers and drafted the initial project architecture.
- Implemented advanced features to enhance the OptiAI Spend Audit UX:
  1. **Strict AI Summary Alignment:** Upgraded prompt instructions in `lib/ai-summary.ts` to enforce a standardized layout consisting of a concise intro paragraph and exactly three bullet points (**Biggest Leak**, **Strategy**, **Action Plan**).
  2. **Spend Copilot Integration:** Developed a server-side `/api/chat` Route Handler featuring OpenAI/Anthropic support and a highly-consultative, keyword-matching fallback system. Built a premium Spend Copilot Chatbox on `/results/[id]` featuring automatic scrolling, typing indicators, error alerts, and quick suggestion chips.
  3. **Visual Stack Selector:** Replaced the legacy form dropdown with an 8-tool visual logo selection grid in `/audit` with beautiful active glowing borders and single-click toggle sync. Cleaned up form configuration details by rendering read-only, colored logo-name badges.
  4. **Zero-Warning Code Quality:** Resolved all TypeScript, ESLint, and React cascading render warnings.
- **What I learned:** Discovered that subscription plan boundaries are highly convoluted. For example, Claude Team has a strict 5-seat billing minimum ($150/mo), and ChatGPT Team has a 2-seat minimum ($60/mo). These strict thresholds are the exact points where early-stage startups lose hundreds of dollars by buying plans for single users.
- **Blockers / what I'm stuck on:** Designing pricing data shapes to support both static seat-based pricing and usage-based API bills was complex, but resolved with standard interface attributes.
- Discovered that a custom, token-based markdown renderer in React can perfectly render simple formatting (bolding, lists, subheaders) client-side in less than 50 lines of code, bypassing the need for heavy external markdown libraries.
- **Bug Fixes Implemented:**
  - Resolved a critical client-side hydration race condition in `app/audit/page.tsx` where cached `localStorage` data would get overwritten by default tools state on initial mount layout effect. Added `isLoaded` state gating to prevent premature writing to `localStorage`.
  - Implemented a beautiful, premium, theme-matching skeletal loader during hydration to completely eliminate hydration mismatches.
  - Added defensive programming checks (`Array.isArray`) across all state mutator helpers (`addToolRow`, `removeToolRow`, `handleToolChange`, etc.) and JSX mapping statements to prevent unhandled React null-reference exceptions.
- **Plan for tomorrow:** Initialize the Next.js 15 project codebase, configure custom dark Tailwind CSS tokens, and prepare the core pricing data files.Work on custom Resend email templates and automated background dispatching for lead generation follow-ups.



