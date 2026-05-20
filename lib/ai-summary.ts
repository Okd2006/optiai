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
Generate a professional, high-impact, actionable audit summary (~100 words) based on these details:
- Team Size: ${teamSize} employees
- Primary Use Case: ${primaryUseCase}
- Total Current Spend: $${results.totalCurrentSpend}/month
- Recommended Spend: $${results.totalRecommendedSpend}/month
- Net Monthly Savings: $${results.totalMonthlySavings}/month
- Annual Savings: $${results.totalAnnualSavings}/month
- Details of Stack and Recommendations:
${toolListStr}

Guidelines:
1. Be direct, authoritative, and helpful, maintaining an optimistic tone focusing on capital efficiency.
2. Address the founder/CTO. Summarize their biggest overspending item (e.g. redundant tooling or plan mismatch) first.
3. Quantify the exact annual savings.
4. If net monthly savings > $500/month, include a brief sentence inviting them to book a custom Credex audit to double their savings.
5. Keep it strictly under 110 words. Format with clean bullet points.`;

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
    credexCall = `\n\n🎯 **Special Recommendation:** Since your savings exceed $500/month, we highly recommend booking a complimentary consultation with **Credex** to unlock additional enterprise perks, free vendor credits (up to $10k+), and customized corporate discounts.`;
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
