import { PRICING_DATA } from './pricing-data';
import { formatCurrency } from './utils';

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

// PREMIUM EXPANSION INTERFACES
export interface HealthCategoryScore {
  score: number;
  label: string; // "Optimized" | "Moderate Overspend" | "Significant Waste"
  description: string;
}

export interface HealthScoreData {
  overallScore: number;
  overallLabel: string;
  categories: {
    planEfficiency: HealthCategoryScore;
    toolRedundancy: HealthCategoryScore;
    collaborationEfficiency: HealthCategoryScore;
    apiCostEfficiency: HealthCategoryScore;
    stackComplexity: HealthCategoryScore;
  };
}

export interface RedundantInsight {
  overlappingTools: string[];
  message: string;
  consolidationStrategy: string;
  potentialSavings: number;
}

export interface CategoryAnalysisItem {
  category: string; // "Coding" | "Writing" | "Research" | "APIs" | "Collaboration"
  currentSpend: number;
  recommendedSpend: number;
  savings: number;
  percent: number;
}

export interface BenchmarkMetrics {
  spendPerDeveloper: number;
  industryAverage: number;
  percentile: number; // e.g. 72
  comparisonPercentage: number; // percentage difference
  comparisonLabel: 'higher' | 'lower' | 'optimized';
  industryLabel: string; // e.g. "SaaS Startups"
}

export interface PersonaAnalysis {
  archetype: string; // e.g. "Tool-Sprawl Scaling Startup"
  tagline: string;
  maturityScore: number;
  observation: string;
  strategy: string;
}

export interface RoadmapMilestone {
  id: string;
  stage: 'Immediate' | '30-Day' | '90-Day' | 'Enterprise';
  title: string;
  description: string;
  savings: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  complexity: 'Low' | 'Medium' | 'High';
  roi: string;
}

export interface FounderInsight {
  title: string;
  observation: string;
  impact: string;
  actionableStep: string;
}

export interface RecommendationExtended extends Recommendation {
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: 'High' | 'Medium' | 'Situational';
  confidenceReason: string;
  effort: 'Low' | 'Medium' | 'High';
}

export interface AuditResults {
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  recommendations: RecommendationExtended[];
  showCredexCta: boolean;
  isWellOptimized: boolean;
  
  // NEW EXTENDED SAAS METRICS
  healthScore?: HealthScoreData;
  redundancies?: RedundantInsight[];
  categoriesSpend?: CategoryAnalysisItem[];
  benchmarks?: BenchmarkMetrics;
  persona?: PersonaAnalysis;
  roadmap?: RoadmapMilestone[];
  founderInsights?: FounderInsight[];
}

export function runAudit(input: AuditInput): AuditResults {
  const recommendations: RecommendationExtended[] = [];
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
  const hasCopilot = toolMap.has('copilot');
  const hasGemini = toolMap.has('gemini');

  for (const toolInput of input.tools) {
    const { toolId, planName, seats, monthlySpend } = toolInput;
    const pricing = PRICING_DATA[toolId];
    
    if (!pricing) {
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
        reason: 'Spend is already at optimal level for this custom configuration.',
        priority: 'Low',
        confidence: 'High',
        confidenceReason: 'Custom tool configuration checked against verified baseline pricing.',
        effort: 'Low'
      });
      continue;
    }

    let recommendedPlan = planName;
    let recommendedSeats = seats;
    let recommendedSpend = monthlySpend;
    let reason = 'Your subscription is already sized optimally for your team size and workflow.';
    let priority: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
    let confidence: 'High' | 'Medium' | 'Situational' = 'High';
    let confidenceReason = 'Perfect match with team size capabilities and tier definitions.';
    let effort: 'Low' | 'Medium' | 'High' = 'Low';

    // 1. CURSOR OPTIMIZATION RULES
    if (toolId === 'cursor') {
      if (planName.toLowerCase() === 'business' && seats <= 2) {
        recommendedPlan = 'Pro';
        const price = pricing.plans.find(p => p.name === 'Pro')?.pricePerUserMonth ?? 20;
        recommendedSpend = price * seats;
        reason = 'Centralized admin controls and corporate compliance are unnecessary for team sizes under 3. Downgrading to Pro saves $20/month per seat.';
        priority = 'Medium';
        confidence = 'High';
        confidenceReason = 'Team features are documented as redundant for sub-3 developer teams.';
        effort = 'Low';
      }
    }

    // 2. COPILOT OPTIMIZATION RULES
    else if (toolId === 'copilot') {
      if (hasCursor || hasWindsurf) {
        recommendedPlan = 'Hobby'; // Cancel it
        recommendedSeats = 0;
        recommendedSpend = 0;
        reason = `Your developers are already using ${hasCursor ? 'Cursor' : 'Windsurf'} which has built-in AI code-completions. GitHub Copilot is a redundant expenditure.`;
        priority = 'Critical';
        confidence = 'High';
        confidenceReason = 'IDE-level autocomplete features completely overlap with modern AI IDEs.';
        effort = 'Low';
      } else if (planName.toLowerCase() === 'enterprise' && input.teamSize <= 10) {
        recommendedPlan = 'Business';
        const price = pricing.plans.find(p => p.name === 'Business')?.pricePerUserMonth ?? 19;
        recommendedSpend = price * seats;
        reason = 'GitHub Copilot Enterprise custom model fine-tuning and advanced telemetry are overkill for teams under 10. Switch to Copilot Business.';
        priority = 'Medium';
        confidence = 'Medium';
        confidenceReason = 'Depends on whether custom organizational policies are actively utilized.';
        effort = 'Low';
      }
    }

    // 3. CLAUDE OPTIMIZATION RULES
    else if (toolId === 'claude') {
      if (planName.toLowerCase() === 'team' && seats < 5) {
        recommendedPlan = 'Pro';
        const price = pricing.plans.find(p => p.name === 'Pro')?.pricePerUserMonth ?? 20;
        recommendedSpend = price * seats;
        reason = 'Claude Team has a strict 5-seat billing minimum ($150/mo). Downgrading to Claude Pro is more economical for fewer than 5 users.';
        priority = 'High';
        confidence = 'High';
        confidenceReason = 'Anthropic enforces a strict 5-seat minimum on the Team tier.';
        effort = 'Low';
      }
    }

    // 4. CHATGPT OPTIMIZATION RULES
    else if (toolId === 'chatgpt') {
      if (hasClaude && (input.primaryUseCase === 'writing' || input.primaryUseCase === 'coding')) {
        recommendedPlan = 'Free';
        recommendedSeats = 0;
        recommendedSpend = 0;
        reason = 'Your team relies on Claude for specialized writing/coding tasks. Drop ChatGPT to eliminate redundant chat assistant subscriptions.';
        priority = 'High';
        confidence = 'Medium';
        confidenceReason = 'Consolidation of chat clients depends on team-wide preferences for GPT vs Claude models.';
        effort = 'Medium';
      } else if (planName.toLowerCase() === 'team' && seats === 1) {
        recommendedPlan = 'Plus';
        const price = pricing.plans.find(p => p.name === 'Plus')?.pricePerUserMonth ?? 20;
        recommendedSpend = price;
        reason = 'ChatGPT Team requires a 2-seat minimum ($60/mo). Switch to a standalone Plus subscription to save on unused seats.';
        priority = 'High';
        confidence = 'High';
        confidenceReason = 'OpenAI enforces a strict 2-seat minimum on their Team plans.';
        effort = 'Low';
      } else if (planName.toLowerCase() === 'enterprise' && input.teamSize < 15) {
        recommendedPlan = 'Team';
        const price = pricing.plans.find(p => p.name === 'Team')?.pricePerUserMonth ?? 30;
        recommendedSpend = price * seats;
        reason = 'Enterprise tier pricing is unnecessary for teams under 15 users. Standardize on ChatGPT Team to unlock 50% savings.';
        priority = 'Medium';
        confidence = 'Medium';
        confidenceReason = 'Depends on if enterprise compliance, SSO, or private dedicated models are contractually required.';
        effort = 'Medium';
      }
    }

    // 5. GEMINI OPTIMIZATION RULES
    else if (toolId === 'gemini') {
      if (hasChatGPT || hasClaude) {
        recommendedPlan = 'Free';
        recommendedSeats = 0;
        recommendedSpend = 0;
        reason = 'Gemini duplicates chat-assistant features already covered by your active Claude or ChatGPT subscriptions. Consolidate to save.';
        priority = 'High';
        confidence = 'High';
        confidenceReason = 'Identical foundational model prompt interface capabilities.';
        effort = 'Low';
      }
    }

    // 6. WINDSURF OPTIMIZATION RULES
    else if (toolId === 'windsurf') {
      if (planName.toLowerCase() === 'team' && seats <= 2) {
        recommendedPlan = 'Pro';
        const price = pricing.plans.find(p => p.name === 'Pro')?.pricePerUserMonth ?? 15;
        recommendedSpend = price * seats;
        reason = 'Windsurf Team features are redundant for teams of 2 or fewer. Windsurf Pro offers identical coding features for half the price.';
        priority = 'Medium';
        confidence = 'High';
        confidenceReason = 'Cascade autocomplete capabilities are fully identical in the Pro tier.';
        effort = 'Low';
      }
    }

    // 7. API OPTIMIZATION RULES
    else if (toolId === 'openai_api' || toolId === 'anthropic_api') {
      if (monthlySpend >= 200) {
        recommendedSpend = Math.round(monthlySpend * 0.7); // 30% savings
        reason = 'Implement API context caching and request routing (e.g. Claude Haiku or GPT-4o mini for simple tasks) to instantly save 30% of API bills.';
        priority = 'High';
        confidence = 'Situational';
        confidenceReason = 'Savings are highly dependent on request architecture, hit rate, and caching implementation.';
        effort = 'High';
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
      reason: monthlySavings > 0 ? reason : 'Your spend on this tool is already optimized.',
      priority: monthlySavings > 0 ? priority : 'Low',
      confidence,
      confidenceReason,
      effort: monthlySavings > 0 ? effort : 'Low'
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

  // ==========================================
  // EXTENDED SAAS BUSINESS INTELLIGENCE GENERATION
  // ==========================================

  // 1. Spend Health Score Mappings
  let planEfficiencyVal = 20;
  let toolRedundancyVal = 20;
  let collabEfficiencyVal = 20;
  let apiEfficiencyVal = 20;
  let complexityVal = 20;

  // Plan Efficiency Deductions
  if (toolMap.has('chatgpt') && toolMap.get('chatgpt')!.planName.toLowerCase() === 'team' && toolMap.get('chatgpt')!.seats === 1) {
    planEfficiencyVal -= 8;
  }
  if (toolMap.has('claude') && toolMap.get('claude')!.planName.toLowerCase() === 'team' && toolMap.get('claude')!.seats < 5) {
    planEfficiencyVal -= 8;
  }
  if (toolMap.has('cursor') && toolMap.get('cursor')!.planName.toLowerCase() === 'business' && toolMap.get('cursor')!.seats <= 2) {
    planEfficiencyVal -= 4;
  }
  planEfficiencyVal = Math.max(0, planEfficiencyVal);

  // Tool Redundancy Deductions
  if (hasCursor && hasCopilot) toolRedundancyVal -= 8;
  if (hasWindsurf && hasCopilot) toolRedundancyVal -= 8;
  if (hasChatGPT && hasClaude) toolRedundancyVal -= 6;
  if (hasChatGPT && hasGemini) toolRedundancyVal -= 4;
  if (hasClaude && hasGemini) toolRedundancyVal -= 4;
  toolRedundancyVal = Math.max(0, toolRedundancyVal);

  // Collaboration Efficiency Deductions
  if (input.teamSize === 1 && input.tools.some(t => ['team', 'business', 'enterprise'].includes(t.planName.toLowerCase()))) {
    collabEfficiencyVal -= 10;
  } else if (input.teamSize <= 3 && input.tools.some(t => ['business', 'enterprise'].includes(t.planName.toLowerCase()))) {
    collabEfficiencyVal -= 6;
  }
  collabEfficiencyVal = Math.max(0, collabEfficiencyVal);

  // API Cost Efficiency Deductions
  const hasAPI = toolMap.has('openai_api') || toolMap.has('anthropic_api');
  const apiSpend = (toolMap.get('openai_api')?.monthlySpend ?? 0) + (toolMap.get('anthropic_api')?.monthlySpend ?? 0);
  if (hasAPI) {
    if (apiSpend >= 300) {
      apiEfficiencyVal -= 12;
    } else if (apiSpend >= 100) {
      apiEfficiencyVal -= 6;
    }
  }
  apiEfficiencyVal = Math.max(0, apiEfficiencyVal);

  // Stack Complexity Deductions
  const uniquePaidToolsCount = input.tools.filter(t => t.monthlySpend > 0).length;
  if (uniquePaidToolsCount > 4) {
    complexityVal -= 12;
  } else if (uniquePaidToolsCount >= 3) {
    complexityVal -= 6;
  }
  complexityVal = Math.max(0, complexityVal);

  const overallScore = planEfficiencyVal + toolRedundancyVal + collabEfficiencyVal + apiEfficiencyVal + complexityVal;
  
  let overallLabel = 'Optimized';
  if (overallScore < 70) {
    overallLabel = 'Significant Waste';
  } else if (overallScore < 90) {
    overallLabel = 'Moderate Overspend';
  }

  const getScoreLabel = (score: number) => {
    if (score >= 18) return 'Optimized';
    if (score >= 14) return 'Moderate Overspend';
    return 'Significant Waste';
  };

  const healthScore: HealthScoreData = {
    overallScore,
    overallLabel,
    categories: {
      planEfficiency: {
        score: planEfficiencyVal * 5, // scale to 100
        label: getScoreLabel(planEfficiencyVal),
        description: 'Tuning seat sizes and plan tiers to eliminate vendor traps.'
      },
      toolRedundancy: {
        score: toolRedundancyVal * 5,
        label: getScoreLabel(toolRedundancyVal),
        description: 'Removing tools with overlapping features like separate chat and IDE plugins.'
      },
      collaborationEfficiency: {
        score: collabEfficiencyVal * 5,
        label: getScoreLabel(collabEfficiencyVal),
        description: 'Sizing collaboration features properly to match real active team sizes.'
      },
      apiCostEfficiency: {
        score: apiEfficiencyVal * 5,
        label: getScoreLabel(apiEfficiencyVal),
        description: 'Implementing API integrations with context caching and load-routing.'
      },
      stackComplexity: {
        score: complexityVal * 5,
        label: getScoreLabel(complexityVal),
        description: 'Managing overall tool count to avoid billing creep and administrative overhead.'
      }
    }
  };

  // 2. Redundancy Insights Detection
  const redundancies: RedundantInsight[] = [];
  if (hasCursor && hasCopilot) {
    const copilotSpend = toolMap.get('copilot')?.monthlySpend ?? 0;
    redundancies.push({
      overlappingTools: ['Cursor', 'GitHub Copilot'],
      message: 'You are paying for GitHub Copilot licenses while developers are standardizing on Cursor IDE. Cursor has native AI autocomplete capabilities, making Copilot unnecessary.',
      consolidationStrategy: 'Cancel all GitHub Copilot licenses and standardize the engineering team on Cursor Pro or Business.',
      potentialSavings: copilotSpend
    });
  }
  if (hasWindsurf && hasCopilot) {
    const copilotSpend = toolMap.get('copilot')?.monthlySpend ?? 0;
    redundancies.push({
      overlappingTools: ['Windsurf', 'GitHub Copilot'],
      message: 'You are paying for GitHub Copilot licenses while developers are standardizing on Windsurf IDE. Windsurf has native Cascade AI autocomplete, making Copilot redundant.',
      consolidationStrategy: 'Cancel Copilot individual/business licenses and rely entirely on Windsurf Cascade.',
      potentialSavings: copilotSpend
    });
  }
  if (hasChatGPT && hasClaude) {
    const chatGptSpend = toolMap.get('chatgpt')?.monthlySpend ?? 0;
    const claudeSpend = toolMap.get('claude')?.monthlySpend ?? 0;
    const minSpend = Math.min(chatGptSpend, claudeSpend);
    redundancies.push({
      overlappingTools: ['ChatGPT', 'Claude'],
      message: 'You have active subscriptions for both ChatGPT Plus/Team and Claude Pro/Team. These generic prompt interfaces duplicate specialized LLM tasks.',
      consolidationStrategy: 'Standardize writing and logic tasks onto Claude Pro/Team and downgrade ChatGPT to the Free tier, or vice versa.',
      potentialSavings: minSpend
    });
  }
  if ((hasChatGPT || hasClaude) && hasGemini) {
    const geminiSpend = toolMap.get('gemini')?.monthlySpend ?? 0;
    redundancies.push({
      overlappingTools: ['Gemini', 'ChatGPT/Claude'],
      message: 'Gemini Advanced duplicates standard writing, code support, and research operations already handled by Claude or ChatGPT.',
      consolidationStrategy: 'Consolidate onto a single core LLM assistant workspace (Claude or ChatGPT) and cancel Gemini Advanced.',
      potentialSavings: geminiSpend
    });
  }

  // 3. Spends by Category
  const categoriesSpend: CategoryAnalysisItem[] = [];
  const getToolCategory = (id: string): 'Coding' | 'Writing' | 'Research' | 'APIs' => {
    if (['cursor', 'copilot', 'windsurf'].includes(id)) return 'Coding';
    if (['chatgpt', 'gemini'].includes(id)) return 'Writing';
    if (['claude'].includes(id)) return 'Research';
    return 'APIs';
  };

  const tempCats: Record<string, { current: number; recommended: number; savings: number }> = {
    Coding: { current: 0, recommended: 0, savings: 0 },
    Writing: { current: 0, recommended: 0, savings: 0 },
    Research: { current: 0, recommended: 0, savings: 0 },
    APIs: { current: 0, recommended: 0, savings: 0 },
    Collaboration: { current: 0, recommended: 0, savings: 0 }
  };

  for (const rec of recommendations) {
    const cat = getToolCategory(rec.toolId);
    
    // Attribute seat minimum penalty or team features to 'Collaboration'
    const isCollabPlan = ['team', 'business', 'enterprise'].includes(rec.currentPlan.toLowerCase());
    if (isCollabPlan && rec.toolId !== 'openai_api' && rec.toolId !== 'anthropic_api') {
      const perSeatProCost = rec.toolId === 'cursor' ? 20 : rec.toolId === 'chatgpt' ? 20 : rec.toolId === 'claude' ? 20 : 15;
      const baseProSpend = perSeatProCost * rec.currentSeats;
      const collabCurrentSpend = Math.max(0, rec.currentSpend - baseProSpend);
      
      const recProSpend = perSeatProCost * rec.recommendedSeats;
      const collabRecSpend = Math.max(0, rec.recommendedSpend - recProSpend);
      
      tempCats.Collaboration.current += collabCurrentSpend;
      tempCats.Collaboration.recommended += collabRecSpend;
      tempCats.Collaboration.savings += Math.max(0, collabCurrentSpend - collabRecSpend);

      tempCats[cat].current += baseProSpend;
      tempCats[cat].recommended += recProSpend;
      tempCats[cat].savings += Math.max(0, baseProSpend - recProSpend);
    } else {
      tempCats[cat].current += rec.currentSpend;
      tempCats[cat].recommended += rec.recommendedSpend;
      tempCats[cat].savings += rec.monthlySavings;
    }
  }

  const finalTotalSpend = totalCurrentSpend || 1;
  Object.entries(tempCats).forEach(([cat, data]) => {
    if (data.current > 0 || data.savings > 0) {
      categoriesSpend.push({
        category: cat,
        currentSpend: data.current,
        recommendedSpend: data.recommended,
        savings: data.savings,
        percent: Math.round((data.current / finalTotalSpend) * 100)
      });
    }
  });

  // 4. Benchmarking
  const spendPerDeveloper = Math.round(totalCurrentSpend / (input.teamSize || 1));
  let industryLabel = 'SaaS Startups';
  let industryAverage = 45;
  
  if (input.primaryUseCase === 'coding') {
    industryLabel = 'AI-First Tech Startups';
    industryAverage = 75;
  } else if (input.teamSize <= 4) {
    industryLabel = 'Seed-Stage Bootstrapped Teams';
    industryAverage = 30;
  } else if (input.teamSize >= 15) {
    industryLabel = 'Growth-Stage SaaS Startups';
    industryAverage = 60;
  }

  let percentile = 50;
  const ratio = spendPerDeveloper / industryAverage;
  if (ratio > 2.0) percentile = 94;
  else if (ratio > 1.5) percentile = 82;
  else if (ratio > 1.2) percentile = 68;
  else if (ratio > 0.9) percentile = 48;
  else if (ratio > 0.6) percentile = 28;
  else percentile = 12;

  let comparisonPercentage = Math.round(Math.abs((spendPerDeveloper - industryAverage) / industryAverage) * 100);
  let comparisonLabel: 'higher' | 'lower' | 'optimized' = 'optimized';
  if (spendPerDeveloper > industryAverage + 5) {
    comparisonLabel = 'higher';
  } else if (spendPerDeveloper < industryAverage - 5) {
    comparisonLabel = 'lower';
  }

  const benchmarks: BenchmarkMetrics = {
    spendPerDeveloper,
    industryAverage,
    percentile,
    comparisonPercentage,
    comparisonLabel,
    industryLabel
  };

  // 5. Archetype Persona Analysis
  let archetype = 'Lean Optimizer';
  let tagline = 'Highly structured and focused AI tooling allocations.';
  let maturityScore = 95;
  let observation = 'Your organization demonstrates incredible SaaS discipline. You are standardizing licenses around actual team sizes and have systematically filtered redundant tool duplications.';
  let strategy = 'Maintain this baseline. Routinely inspect subscriptions bi-annually as tools release new unified feature sets (e.g. Cursor launching deeper model integrations).';

  if (apiSpend > 0 && apiSpend >= totalCurrentSpend * 0.4) {
    archetype = 'API-Heavy Infrastructure Team';
    tagline = 'High API integration with high context window utilization.';
    maturityScore = 75;
    observation = 'You are leveraging primary APIs (Anthropic/OpenAI) directly in engineering or customer-facing setups. While powerful, API payloads accumulate quickly without context optimization.';
    strategy = 'Integrate strict semantic caching layers (e.g., Redis) and fallback routing pipelines, routing smaller queries to GPT-4o mini or Claude 3.5 Haiku.';
  } else if (uniquePaidToolsCount > 3) {
    archetype = 'Tool-Sprawl Scaling Startup';
    tagline = 'Rapid tool adoption leading to massive billing creep.';
    maturityScore = 52;
    observation = 'Your organization has quickly approved multiple AI tools (Cursor, Copilot, ChatGPT, Claude) across overlapping workflows. Different units are building separate bills, causing a hidden margin leak.';
    strategy = 'Establish central SaaS provisioning. Sunset individual Copilot licenses in favor of Cursor IDE standard licenses and select either Claude Team or ChatGPT Team as the single corporate prompt suite.';
  } else if (categoriesSpend.find(c => c.category === 'Coding') && categoriesSpend.find(c => c.category === 'Coding')!.percent >= 55) {
    archetype = 'Engineering-Heavy Startup';
    tagline = 'Developer-centric environment with comprehensive IDE AI integration.';
    maturityScore = 80;
    observation = 'Your AI footprint is concentrated heavily within the development team, leveraging modern IDEs like Cursor or Windsurf. Other business components (marketing, sales) have minimal AI support.';
    strategy = 'Standardize code-base workspace compliance. Since engineers are already equipped, avoid licensing secondary autocomplete tools like GitHub Copilot or Tabnine.';
  } else if (categoriesSpend.find(c => c.category === 'Research' || c.category === 'Writing') && 
             ((categoriesSpend.find(c => c.category === 'Research')?.percent ?? 0) + 
              (categoriesSpend.find(c => c.category === 'Writing')?.percent ?? 0)) >= 55) {
    archetype = 'Research-Centric Team';
    tagline = 'Heavy knowledge-worker utilization with duplicate prompt seats.';
    maturityScore = 70;
    observation = 'Your team consists primarily of heavy content, product, and analysis teams utilizing standalone Claude and ChatGPT licenses. You pay separate premiums for identical chat tools.';
    strategy = 'Standardize the entire workspace on Claude Pro or Team, leveraging its Project artifacts system to coordinate prompt structures centrally.';
  }

  if (totalMonthlySavings > 150) maturityScore = Math.max(30, 90 - Math.round(totalMonthlySavings / 8));

  const persona: PersonaAnalysis = {
    archetype,
    tagline,
    maturityScore,
    observation,
    strategy
  };

  // 6. Staged Roadmap Timeline
  const roadmap: RoadmapMilestone[] = [];
  let milestoneId = 1;

  // Immediate Stage (1-3 Days)
  const immediateSavings = recommendations
    .filter(r => r.monthlySavings > 0 && r.priority === 'Critical')
    .reduce((acc, curr) => acc + curr.monthlySavings, 0);

  if (immediateSavings > 0) {
    roadmap.push({
      id: `ms-${milestoneId++}`,
      stage: 'Immediate',
      title: 'Consolidate Redundant Autocomplete Licenses',
      description: 'Cancel duplicate GitHub Copilot seats for developers already standardizing on Cursor or Windsurf. De-provision licenses in your GitHub Org panel.',
      savings: immediateSavings,
      priority: 'Critical',
      complexity: 'Low',
      roi: 'Instant ROI'
    });
  }

  // 30-Day Stage
  const monthly30Savings = recommendations
    .filter(r => r.monthlySavings > 0 && (r.priority === 'High' || r.priority === 'Medium') && r.effort === 'Low')
    .reduce((acc, curr) => acc + curr.monthlySavings, 0);

  if (monthly30Savings > 0) {
    roadmap.push({
      id: `ms-${milestoneId++}`,
      stage: '30-Day',
      title: 'Adjust Team Tiers & Sunset Unused Seats',
      description: 'De-scale Claude Team below the 5-seat minimum or switch chat GPT accounts to stand-alone Plus configurations, removing phantom seat billing.',
      savings: monthly30Savings,
      priority: 'High',
      complexity: 'Low',
      roi: '12x ROI'
    });
  }

  // 90-Day Stage
  const monthly90Savings = recommendations
    .filter(r => r.monthlySavings > 0 && r.effort === 'Medium')
    .reduce((acc, curr) => acc + curr.monthlySavings, 0);

  if (monthly90Savings > 0 || totalMonthlySavings > 0) {
    roadmap.push({
      id: `ms-${milestoneId++}`,
      stage: '90-Day',
      title: 'Standardize Corporate Prompt Suites',
      description: 'Establish central provisioning policies. Standardize business workflows on a single chat partner (Claude Pro) to leverage central Projects billing.',
      savings: monthly90Savings || Math.round(totalMonthlySavings * 0.1),
      priority: 'Medium',
      complexity: 'Medium',
      roi: '5x ROI'
    });
  }

  // Enterprise / Ongoing Caching Stage
  const apiSavings = recommendations
    .filter(r => r.toolId.includes('api') && r.monthlySavings > 0)
    .reduce((acc, curr) => acc + curr.monthlySavings, 0);

  if (hasAPI) {
    roadmap.push({
      id: `ms-${milestoneId++}`,
      stage: 'Enterprise',
      title: 'Implement Semantic Context Caching',
      description: 'Deploy context caching on OpenAI and Anthropic API models. Utilize prompt routing rules, directing structured parsing jobs to lightweight models.',
      savings: apiSavings || Math.round(apiSpend * 0.3),
      priority: 'High',
      complexity: 'High',
      roi: '15x ROI'
    });
  }

  // 7. Founder Consultant Insights
  const founderInsights: FounderInsight[] = [];
  
  if (totalMonthlySavings > 250) {
    founderInsights.push({
      title: 'Decentralized SaaS Sprawl Margin Leaks',
      observation: 'Different departments have independently approved premium AI subscriptions (Cursor, ChatGPT, Claude) without coordination, leading to overlapping seat counts.',
      impact: `You are sustaining a friction leak of **${formatCurrency(totalAnnualSavings)}/year** out of your cash reserves — equivalent to the cost of purchasing multiple developer MacBooks or critical server nodes.`,
      actionableStep: 'Enforce a strict software procurement policy. Standardize IDEs on Cursor Pro and de-provision duplicate external chat licenses immediatey.'
    });
  } else {
    founderInsights.push({
      title: 'Optimal Resource Leverage and AI Readiness',
      observation: 'Your SaaS footprint is extremely clean. Your spend ratio per developer aligns perfectly with early-stage bootstrapped benchmarks.',
      impact: 'Minimal operational overhead and zero shadow-IT billing leaks, ensuring highly predictable engineering runway margins.',
      actionableStep: 'Formulate automated monthly reviews to audit subscription additions as you scale the engineering team beyond 10 developers.'
    });
  }

  if (hasAPI && apiSpend >= 100) {
    founderInsights.push({
      title: 'Unoptimized LLM Payload Token Tax',
      observation: 'High raw API expenditures indicate that full contextual repositories or historical logs are repeatedly passed without caching layers.',
      impact: 'Sustaining a raw token multiplier fee of 30-40% on identical repeated prompt structures.',
      actionableStep: 'Incorporate Redis-based semantic cache layers and ensure all developer builds use lightweight GPT-4o mini/Claude Haiku fallbacks.'
    });
  }

  return {
    totalCurrentSpend,
    totalRecommendedSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    recommendations,
    showCredexCta,
    isWellOptimized,
    
    // NEW METRICS
    healthScore,
    redundancies,
    categoriesSpend,
    benchmarks,
    persona,
    roadmap,
    founderInsights
  };
}
