# Developer Log — OptiAI

Daily tracking of building a production-ready, highly-optimized AI SaaS spend auditor.

---

## Day 1 — 2026-05-14
- **Hours worked:** 5.0
- **What I did:** Researched target personas (startup CTOs, engineering managers) and gathered pricing matrices for the primary AI providers (Cursor, Claude, ChatGPT, GitHub Copilot, Gemini, Windsurf, Anthropic API, OpenAI API). Formulated unified JSON structures for pricing tiers and drafted the initial project architecture.
- **What I learned:** Discovered that subscription plan boundaries are highly convoluted. For example, Claude Team has a strict 5-seat billing minimum ($150/mo), and ChatGPT Team has a 2-seat minimum ($60/mo). These strict thresholds are the exact points where early-stage startups lose hundreds of dollars by buying plans for single users.
- **Blockers / what I'm stuck on:** Designing pricing data shapes to support both static seat-based pricing and usage-based API bills was complex, but resolved with standard interface attributes.
- **Bug Fixes Implemented:**
  - Resolved a critical client-side hydration race condition in `app/audit/page.tsx` where cached `localStorage` data would get overwritten by default tools state on initial mount layout effect. Added `isLoaded` state gating to prevent premature writing to `localStorage`.
  - Implemented a beautiful, premium, theme-matching skeletal loader during hydration to completely eliminate hydration mismatches.
  - Added defensive programming checks (`Array.isArray`) across all state mutator helpers (`addToolRow`, `removeToolRow`, `handleToolChange`, etc.) and JSX mapping statements to prevent unhandled React null-reference exceptions.
- **Plan for tomorrow:** Initialize the Next.js 15 project codebase, configure custom dark Tailwind CSS tokens, and prepare the core pricing data files.

