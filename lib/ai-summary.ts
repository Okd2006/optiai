import { AuditResults } from './audit-engine';

export interface SummaryInput {
  teamSize: number;
  primaryUseCase: string;
  results: AuditResults;
}

export async function generateAiSummary(input: SummaryInput): Promise<string> {
  const { teamSize, primaryUseCase, results } = input;
  
  // Format details for the prompt
  const toolListStr = results.recommendations
    .map(r => `- ${r.toolName} (${r.currentPlan}, Spend: $${r.currentSpend}/mo, Seats: ${r.currentSeats}) => Rec: ${r.recommendedPlan} (Spend: $${r.recommendedSpend}/mo). Savings: $${r.monthlySavings}/mo. Reason: ${r.reason}`)
    .join('\n');

  const prompt = `You are OptiAI, a financial audit bot that specializes in optimizing SaaS spend for AI software at startups.
Generate a professional, high-impact, actionable audit summary based on these details:
- Team Size: ${teamSize} employees
- Primary Use Case: ${primaryUseCase}
- Total Current Spend: $${results.totalCurrentSpend}/month
- Recommended Spend: $${results.totalRecommendedSpend}/month
- Net Monthly Savings: $${results.totalMonthlySavings}/month
- Annual Savings: $${results.totalAnnualSavings}/month
- Details of Stack and Recommendations:
${toolListStr}

Guidelines for Copywriting Tone, Structure and Format:
1. Copywriting Tone: Use highly professional, executive-grade, startup-realistic B2B SaaS consultant language.
- Avoid robotic AI phrases (e.g. NEVER write "We identified concrete optimizations that will reduce this to...", or "delete duplicate tools immediately to capture savings").
- Instead, use calm, analytical, founder-oriented, and operational insights (e.g., "Your current AI stack shows significant overspending in collaborative tooling tiers relative to your active team size of [X].", or "Standardizing engineering workflows around Cursor Pro while removing duplicate Copilot seats reduces monthly spend substantially.").
2. Output format must STRICTLY match this template (do not include any conversational preamble, introductory labels, or markdown notes):

### AI Spend Audit Summary

[An executive summary paragraph summarizing the team size, current monthly spend, optimized monthly spend, and net monthly/annual savings returned to active runway.]

- **Biggest Leak:** [Detail the primary source of overspending, quantifying the monthly savings from resolving this specific item.]
- **Strategy:** [A strategic consultant recommendation tailored to their primary use case and team constraints.]
- **Action Plan:** [A precise, immediate action plan to execute in 2-3 concise bullets.]

3. Keep the entire response under 135 words. Do not write anything else.`;

  // We will check environment variables for Anthropic and OpenAI.
  // Since we are running in local, if the user hasn't supplied them, we will use our smart, highly-customized local fallback template.
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;

  if (hasAnthropic) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 250,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.content?.[0]?.text) {
          return data.content[0].text.trim();
        }
      }
    } catch (e) {
      console.warn('Anthropic API failed, attempting OpenAI fallback:', e);
    }
  }

  if (hasOpenAI) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY!}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 250,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          return data.choices[0].message.content.trim();
        }
      }
    } catch (e) {
      console.warn('OpenAI API fallback failed:', e);
    }
  }

  // Graceful fallback: Smart, highly personalized template generator based on audit calculations
  return generateLocalFallbackSummary(input);
}

function generateLocalFallbackSummary(input: SummaryInput): string {
  const { results, teamSize, primaryUseCase } = input;
  const savings = results.totalMonthlySavings;
  const annualSavings = results.totalAnnualSavings;

  if (savings <= 0) {
    return `### AI Spend Audit Summary

Your AI application ecosystem is highly optimized. For a scaling team of ${teamSize} specializing in ${primaryUseCase}, your seat allocations and plan selections reflect absolute fiscal discipline. No redundant seat clusters or plan overprovisioning were detected across your active subscriptions.

- **Biggest Leak:** None identified. Active software licenses perfectly match active headcount.
- **Strategy:** Standardize subscription workflows and conduct bi-monthly operational reviews to monitor shadow IT spend as the stack scales.
- **Action Plan:** Maintain current seat counts, track developer tool utilization rates, and establish automated spending alerts.`;
  }

  // Find largest savings tool
  const sortedRecs = [...results.recommendations].sort((a, b) => b.monthlySavings - a.monthlySavings);
  const topRec = sortedRecs[0];
  
  let majorLeakMsg = '';
  if (topRec && topRec.monthlySavings > 0) {
    majorLeakMsg = `${topRec.toolName} ${topRec.currentPlan} plan. Consolidating active seat counts to match actual users yields $${topRec.monthlySavings}/month in capital recovery.`;
  } else {
    majorLeakMsg = `Unoptimized license tiers across collaborative subscription channels, contributing to monthly operational drain.`;
  }

  let credexCall = '';
  if (results.showCredexCta) {
    credexCall = `\n- **Special Recommendation:** Standardize enterprise transaction pathways via Credex to claim custom vendor rebates and up to $10,000 in active software platform credits.`;
  }

  const useCaseAdv = primaryUseCase === 'coding' 
    ? 'Standardizing engineering workflows around Cursor Pro while removing duplicate standalone Copilot seats reduces monthly spend substantially.'
    : 'Consolidating duplicate conversational assistants (Claude and ChatGPT subscriptions) will eliminate redundant software overhead without affecting baseline operational velocity.';

  const actionPlanMsg = primaryUseCase === 'coding'
    ? 'Resize Gemini seats, consolidate duplicate copilots, and standardize engineering tooling.'
    : 'Standardize chat assistants, downsize unused developer accounts, and streamline subscription governance.';

  return `### AI Spend Audit Summary

Your current AI stack shows significant overspending in collaborative tooling tiers relative to your active team size of ${teamSize}. Refining these allocations returns $${savings}/month ($${annualSavings}/year) in recurrent capital efficiency directly to your active runway.

- **Biggest Leak:** ${majorLeakMsg}
- **Strategy:** ${useCaseAdv}
- **Action Plan:** ${actionPlanMsg}${credexCall}`;
}
