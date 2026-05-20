import { PRICING_DATA } from './pricing-data';

export interface AuditToolInput {
  toolId: string;
  planName: string;
  seats: number;
  monthlySpend: number;
}

export interface AuditInput {
  teamSize: number;
  primaryUseCase: 'coding' | 'writing' | 'research' | 'data' | 'mixed';
  tools: AuditToolInput[];
}

export interface Recommendation {
  toolId: string;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  currentSeats: number;
  recommendedPlan: string;
  recommendedSpend: number;
  recommendedSeats: number;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
}

export interface AuditResults {
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  recommendations: Recommendation[];
  showCredexCta: boolean;
  isWellOptimized: boolean;
}

export function runAudit(input: AuditInput): AuditResults {
  const recommendations: Recommendation[] = [];
  let totalCurrentSpend = 0;
  
  // Track tools present for cross-tool redundancy checks
  const toolMap = new Map<string, AuditToolInput>();
  for (const t of input.tools) {
    toolMap.set(t.toolId, t);
    totalCurrentSpend += t.monthlySpend;
  }

  const hasCursor = toolMap.has('cursor');
  const hasChatGPT = toolMap.has('chatgpt');
  const hasClaude = toolMap.has('claude');
  const hasWindsurf = toolMap.has('windsurf');

  for (const toolInput of input.tools) {
    const { toolId, planName, seats, monthlySpend } = toolInput;
    const pricing = PRICING_DATA[toolId];
    
    if (!pricing) {
      // Fallback if tool not found in dataset
      recommendations.push({
        toolId,
        toolName: toolId.toUpperCase(),
        currentPlan: planName,
        currentSpend: monthlySpend,
        currentSeats: seats,
        recommendedPlan: planName,
        recommendedSpend: monthlySpend,
        recommendedSeats: seats,
        monthlySavings: 0,
        annualSavings: 0,
        reason: 'Spend is already at optimal level for this custom configuration.'
      });
      continue;
    }

    let recommendedPlan = planName;
    let recommendedSeats = seats;
    let recommendedSpend = monthlySpend;
    let reason = 'Your subscription is already sized optimally for your team size and workflow.';

    // 1. CURSOR OPTIMIZATION RULES
    if (toolId === 'cursor') {
      if (planName.toLowerCase() === 'business' && seats <= 2) {
        recommendedPlan = 'Pro';
        const price = pricing.plans.find(p => p.name === 'Pro')?.pricePerUserMonth ?? 20;
        recommendedSpend = price * seats;
        reason = 'Centralized admin controls and corporate compliance are unnecessary for team sizes under 3. Downgrading to Pro saves $20/month per seat.';
      }
    }

    // 2. COPILOT OPTIMIZATION RULES
    else if (toolId === 'copilot') {
      // Redundancy check: Cursor Pro / Windsurf Pro + Copilot is a duplicate spend
      if (hasCursor || hasWindsurf) {
        recommendedPlan = 'Hobby'; // Basically cancel it
        recommendedSeats = 0;
        recommendedSpend = 0;
        reason = `Your developers are already using ${hasCursor ? 'Cursor' : 'Windsurf'} which has built-in AI code-completions. GitHub Copilot is a redundant expenditure.`;
      } else if (planName.toLowerCase() === 'enterprise' && input.teamSize <= 10) {
        recommendedPlan = 'Business';
        const price = pricing.plans.find(p => p.name === 'Business')?.pricePerUserMonth ?? 19;
        recommendedSpend = price * seats;
        reason = 'GitHub Copilot Enterprise custom model fine-tuning and advanced telemetry are overkill for teams under 10. Switch to Copilot Business.';
      }
    }

    // 3. CLAUDE OPTIMIZATION RULES
    else if (toolId === 'claude') {
      // Duplication with ChatGPT check (if coding or writing is primary, favor Claude and downgrade ChatGPT, or vice versa)
      if (hasChatGPT && (input.primaryUseCase === 'coding' || input.primaryUseCase === 'writing')) {
        // Here we keep Claude at Pro/Team, but for Claude we say: "Optimized. Standardize chat tools onto Claude Pro."
        // We will do the actual cancellation recommendation on the ChatGPT item, or Claude depending on preference.
        // Let's optimize individual plans
      }

      if (planName.toLowerCase() === 'team' && seats < 5) {
        recommendedPlan = 'Pro';
        const price = pricing.plans.find(p => p.name === 'Pro')?.pricePerUserMonth ?? 20;
        recommendedSpend = price * seats;
        reason = 'Claude Team has a strict 5-seat billing minimum ($150/mo). Downgrading to Claude Pro is more economical for fewer than 5 users.';
      }
    }

    // 4. CHATGPT OPTIMIZATION RULES
    else if (toolId === 'chatgpt') {
      // Redundancy check: ChatGPT + Claude
      if (hasClaude && (input.primaryUseCase === 'writing' || input.primaryUseCase === 'coding')) {
        recommendedPlan = 'Free';
        recommendedSeats = 0;
        recommendedSpend = 0;
        reason = 'Your team relies on Claude for specialized writing/coding tasks. Drop ChatGPT to eliminate redundant chat assistant subscriptions.';
      } else if (planName.toLowerCase() === 'team' && seats === 1) {
        recommendedPlan = 'Plus';
        const price = pricing.plans.find(p => p.name === 'Plus')?.pricePerUserMonth ?? 20;
        recommendedSpend = price;
        reason = 'ChatGPT Team requires a 2-seat minimum ($60/mo). Switch to a standalone Plus subscription to save on unused seats.';
      } else if (planName.toLowerCase() === 'enterprise' && input.teamSize < 15) {
        recommendedPlan = 'Team';
        const price = pricing.plans.find(p => p.name === 'Team')?.pricePerUserMonth ?? 30;
        recommendedSpend = price * seats;
        reason = 'Enterprise tier pricing is unnecessary for teams under 15 users. Standardize on ChatGPT Team to unlock 50% savings.';
      }
    }

    // 5. GEMINI OPTIMIZATION RULES
    else if (toolId === 'gemini') {
      if (hasChatGPT || hasClaude) {
        recommendedPlan = 'Free';
        recommendedSeats = 0;
        recommendedSpend = 0;
        reason = 'Gemini duplicates chat-assistant features already covered by your active Claude or ChatGPT subscriptions. Consolidate to save.';
      }
    }

    // 6. WINDSURF OPTIMIZATION RULES
    else if (toolId === 'windsurf') {
      if (planName.toLowerCase() === 'team' && seats <= 2) {
        recommendedPlan = 'Pro';
        const price = pricing.plans.find(p => p.name === 'Pro')?.pricePerUserMonth ?? 15;
        recommendedSpend = price * seats;
        reason = 'Windsurf Team features are redundant for teams of 2 or fewer. Windsurf Pro offers identical coding features for half the price.';
      }
    }

    // 7. API OPTIMIZATION RULES
    else if (toolId === 'openai_api' || toolId === 'anthropic_api') {
      if (monthlySpend >= 200) {
        recommendedSpend = Math.round(monthlySpend * 0.7); // 30% savings
        reason = 'Implement API context caching and request routing (e.g. Claude Haiku or GPT-4o mini for simple tasks) to instantly save 30% of API bills.';
      }
    }

    // Finalize recommendation numbers
    const monthlySavings = Math.max(0, monthlySpend - recommendedSpend);
    const annualSavings = monthlySavings * 12;

    recommendations.push({
      toolId,
      toolName: pricing.name,
      currentPlan: planName,
      currentSpend: monthlySpend,
      currentSeats: seats,
      recommendedPlan,
      recommendedSpend,
      recommendedSeats,
      monthlySavings,
      annualSavings,
      reason: monthlySavings > 0 ? reason : 'Your spend on this tool is already optimized.'
    });
  }

  // Calculate totals
  let totalRecommendedSpend = 0;
  let totalMonthlySavings = 0;
  
  for (const rec of recommendations) {
    totalRecommendedSpend += rec.recommendedSpend;
    totalMonthlySavings += rec.monthlySavings;
  }

  const totalAnnualSavings = totalMonthlySavings * 12;
  const showCredexCta = totalMonthlySavings > 500;
  const isWellOptimized = totalMonthlySavings < 100;

  return {
    totalCurrentSpend,
    totalRecommendedSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    recommendations,
    showCredexCta,
    isWellOptimized
  };
}
