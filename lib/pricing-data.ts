export interface PricingPlan {
  name: string;
  pricePerUserMonth: number;
  minSeats?: number;
  billingFrequency: 'monthly' | 'annual' | 'usage';
  features: string[];
}

export interface ToolPricing {
  id: string;
  name: string;
  plans: PricingPlan[];
  pricingUrl: string;
  verificationDate: string;
}

export const PRICING_DATA: Record<string, ToolPricing> = {
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    pricingUrl: 'https://cursor.sh/pricing',
    verificationDate: '2026-05-20',
    plans: [
      { name: 'Hobby', pricePerUserMonth: 0, billingFrequency: 'monthly', features: ['Basic autocomplete', 'Slow requests limit'] },
      { name: 'Pro', pricePerUserMonth: 20, billingFrequency: 'monthly', features: ['500 fast Premium requests/month', 'Unlimited slow requests', '10 Claude 3.5 Sonnet queries/day'] },
      { name: 'Business', pricePerUserMonth: 40, billingFrequency: 'monthly', features: ['Privacy mode by default', 'Centralized billing', 'Unlimited fast Premium requests', 'Admin controls'] }
    ]
  },
  copilot: {
    id: 'copilot',
    name: 'GitHub Copilot',
    pricingUrl: 'https://github.com/features/copilot#pricing',
    verificationDate: '2026-05-20',
    plans: [
      { name: 'Individual', pricePerUserMonth: 10, billingFrequency: 'monthly', features: ['Code completions', 'Chat in IDE'] },
      { name: 'Business', pricePerUserMonth: 19, billingFrequency: 'monthly', features: ['Organization management', 'Policy management', 'IP indemnity'] },
      { name: 'Enterprise', pricePerUserMonth: 39, billingFrequency: 'monthly', features: ['Custom models tuning', 'Pull request summaries', 'Enterprise CLI'] }
    ]
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    pricingUrl: 'https://www.anthropic.com/claude',
    verificationDate: '2026-05-20',
    plans: [
      { name: 'Free', pricePerUserMonth: 0, billingFrequency: 'monthly', features: ['Access to Claude 3.5 Sonnet'] },
      { name: 'Pro', pricePerUserMonth: 20, billingFrequency: 'monthly', features: ['5x more usage than Free', 'Access to Claude 3.5 Opus, Haiku', 'Create Projects'] },
      { name: 'Team', pricePerUserMonth: 30, minSeats: 5, billingFrequency: 'monthly', features: ['Minimum 5 seats', 'Increased usage limits', 'Admin console', 'SSO/SAML'] }
    ]
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    pricingUrl: 'https://openai.com/chatgpt/pricing',
    verificationDate: '2026-05-20',
    plans: [
      { name: 'Free', pricePerUserMonth: 0, billingFrequency: 'monthly', features: ['Access to GPT-4o mini', 'Limited GPT-4o usage'] },
      { name: 'Plus', pricePerUserMonth: 20, billingFrequency: 'monthly', features: ['5x more usage than Free', 'Access to GPT-4o, DALL-E, custom GPTs'] },
      { name: 'Team', pricePerUserMonth: 30, minSeats: 2, billingFrequency: 'monthly', features: ['Minimum 2 seats', 'Admin console', 'No data training on chats', 'Higher limits'] },
      { name: 'Enterprise', pricePerUserMonth: 60, minSeats: 15, billingFrequency: 'monthly', features: ['Customizable context', 'Dedicated support', 'Uncapped high-speed GPT-4o'] }
    ]
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    pricingUrl: 'https://one.google.com/explore-plan/gemini-advanced',
    verificationDate: '2026-05-20',
    plans: [
      { name: 'Free', pricePerUserMonth: 0, billingFrequency: 'monthly', features: ['Standard Gemini access'] },
      { name: 'Advanced', pricePerUserMonth: 20, billingFrequency: 'monthly', features: ['Access to Gemini 1.5 Pro', '2TB Google One storage'] },
      { name: 'Business', pricePerUserMonth: 20, billingFrequency: 'monthly', features: ['Gemini in Workspace apps (Docs, Gmail)', 'Enterprise-grade data protection'] },
      { name: 'Enterprise', pricePerUserMonth: 30, billingFrequency: 'monthly', features: ['Full translation capabilities', 'Uncapped Gemini usage', 'Ad-hoc agent creation'] }
    ]
  },
  windsurf: {
    id: 'windsurf',
    name: 'Windsurf',
    pricingUrl: 'https://codeium.com/windsurf/pricing',
    verificationDate: '2026-05-20',
    plans: [
      { name: 'Free', pricePerUserMonth: 0, billingFrequency: 'monthly', features: ['Basic AI autocomplete'] },
      { name: 'Pro', pricePerUserMonth: 15, billingFrequency: 'monthly', features: ['Unlimited Cascade chat', 'Advanced code-base indexing'] },
      { name: 'Team', pricePerUserMonth: 30, billingFrequency: 'monthly', features: ['Admin dashboard', 'Shared context controls', 'Priority support'] }
    ]
  },
  openai_api: {
    id: 'openai_api',
    name: 'OpenAI API',
    pricingUrl: 'https://openai.com/api/pricing',
    verificationDate: '2026-05-20',
    plans: [
      { name: 'Pay As You Go', pricePerUserMonth: 0, billingFrequency: 'usage', features: ['Access to GPT-4o, GPT-4o mini, o1, o3-mini', 'Usage-based monthly billing'] }
    ]
  },
  anthropic_api: {
    id: 'anthropic_api',
    name: 'Anthropic API',
    pricingUrl: 'https://www.anthropic.com/api',
    verificationDate: '2026-05-20',
    plans: [
      { name: 'Pay As You Go', pricePerUserMonth: 0, billingFrequency: 'usage', features: ['Access to Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus', 'Usage-based monthly billing'] }
    ]
  }
};
