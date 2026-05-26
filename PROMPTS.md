# LLM Prompt Engineering & Iterations Records — OptiAI

This document indexes our prompt architecture, prompt engineering rationale, failed formatting iterations, and dynamic template structures.

---

## Production System Prompt

Our current active server-side prompt utilized in `/lib/ai-summary.ts` to instruct the Claude / GPT model is structured as follows:

```text
You are OptiAI, a financial audit bot that specializes in optimizing SaaS spend for AI software at startups.
Generate a professional, high-impact, actionable audit summary (~100 words) based on these details:
- Team Size: {teamSize} employees
- Primary Use Case: {primaryUseCase}
- Total Current Spend: ${results.totalCurrentSpend}/month
- Recommended Spend: ${results.totalRecommendedSpend}/month
- Net Monthly Savings: ${results.totalMonthlySavings}/month
- Annual Savings: ${results.totalAnnualSavings}/month
- Details of Stack and Recommendations:
{toolListStr}

Guidelines:
1. Be direct, authoritative, and helpful, maintaining an optimistic tone focusing on capital efficiency.
2. Address the founder/CTO. Summarize their biggest overspending item (e.g. redundant tooling or plan mismatch) first.
3. Quantify the exact annual savings.
4. If net monthly savings > $500/month, include a brief sentence inviting them to book a custom Credex audit to double their savings.
5. Keep it strictly under 110 words. Format with clean bullet points.
```

---

## Prompt Engineering Rationale

1. **Quantifiable Metrics First**: Founders respond to concrete numbers. By forcing the LLM to quantify the exact monthly and annual savings, we build instant credibility.
2. **Actionable Priority Ordering**: Instructing the model to summarize the largest waste factor first ensures that the user is immediately gripped by the most impactful item (e.g. redundant IDE extensions or Claude Team seat padding).
3. **Strict Length Bounds**: Startups digest information rapidly. Restricting length to under 110 words makes the summary readable in under 30 seconds.
4. **Context-aware Credex Integration**: Dynamically instructing the model to include our affiliate consulting pathway ONLY when monthly savings exceed $500 preserves conversion quality, preventing the app from feeling overly transactional to low-budget users.

---

## Failed Iterations & Lessons Learned

### Iteration 1: Over-generalized chat structure
- **Format:**
`"Summarize these audit calculations: {results}. Provide saving advice."`
- **Result:**
The LLM output was highly conversational ("Hello there! I reviewed your spending..."), lacked formatting structure, exceeded 300 words, and failed to output exact savings figures. It often recommended arbitrary generic software instead of our official supported stack.
- **Lesson:**
An LLM must be explicitly constrained using role definitions, specific text guidelines, bullet restrictions, and strict length bounds.

### Iteration 2: HTML Output Attempt
- **Format:**
`"Write a 100-word audit summary in clean HTML code containing <div> and <span> tags."`
- **Result:**
The LLM generated incomplete HTML when running low on tokens, leading to broken layout structures on the dashboard results page. Furthermore, escaping and rendering raw HTML safely on React clients introduced XSS vulnerabilities.
- **Lesson:**
Standard Markdown format is significantly safer, highly readable, and parses natively into standard CSS layout components.

---

## Robust Template Fallback Structure

If API invocations fail, we instantly compile a highly-customized, template-based summary:

```typescript
function generateLocalFallbackSummary(input: SummaryInput): string {
const { results, teamSize, primaryUseCase } = input;
const savings = results.totalMonthlySavings;
const annualSavings = results.totalAnnualSavings;

if (savings <= 0) {
return `Your AI tool stack is currently outstandingly optimized! For a team of **${teamSize}** specializing in **${primaryUseCase}**, you have structured your seats and subscriptions efficiently. No immediate action is required. We recommend regular bi-monthly reviews of your spend as your team and tool offerings expand. Keep up the high standard of fiscal discipline!`;
}

// Find largest savings tool
const sortedRecs = [...results.recommendations].sort((a, b) => b.monthlySavings - a.monthlySavings);
const topRec = sortedRecs[0];

let majorLeakMsg = '';
if (topRec && topRec.monthlySavings > 0) {
majorLeakMsg = `The primary source of overspending is **${topRec.toolName}**, where you could instantly save **$${topRec.monthlySavings}/month** by adjusting your ${topRec.currentPlan} plan.`;
}

let credexCall = '';
if (results.showCredexCta) {
credexCall = `\n\n **Special Recommendation:** Since your savings exceed $500/month, we highly recommend booking a complimentary consultation with **Credex** to unlock additional enterprise perks, free vendor credits (up to $10k+), and customized corporate discounts.`;
}

const useCaseAdv = primaryUseCase === 'coding' 
? 'Standardizing your engineering workflows onto Cursor Pro and cancelling standalone Copilot licenses is the most impactful immediate optimization.'
: 'Consolidating duplicate conversational assistants (like having both active Claude and ChatGPT subscriptions) will eliminate software redundancy without affecting daily output.';

return `### AI Spend Audit Summary

Your team of **${teamSize}** is currently spending **$${results.totalCurrentSpend}/month** on AI utilities. We have identified concrete optimizations that will reduce this to **$${results.totalRecommendedSpend}/month**, instantly returning **$${savings}/month** (**$${annualSavings}/year**) to your cash reserves.

- **Biggest Leak:** ${majorLeakMsg}
- **Strategy:** ${useCaseAdv}
- **Action Plan:** Switch plan tiers to match active team seat counts and delete duplicate tools immediately to capture these savings.${credexCall}`;
}
```
This backup provides complete operational security, guaranteeing the app never crashes under heavy viral load.
