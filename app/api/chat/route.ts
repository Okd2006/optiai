import { NextRequest, NextResponse } from 'next/server';
import { getAudit } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { messages, auditId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid messages parameter.' }, { status: 400 });
    }

    if (!auditId) {
      return NextResponse.json({ error: 'Missing required auditId parameter.' }, { status: 400 });
    }

    const audit = await getAudit(auditId);
    if (!audit) {
      return NextResponse.json({ error: 'Audit record not found.' }, { status: 404 });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';
    const query = lastMessage.toLowerCase();

    // 1. Check for LLM keys and call API if available
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    const results = audit.results_data;
    const systemPrompt = `You are the OptiAI Spend Copilot, an expert startup SaaS finance consultant and AI spend optimization advisor.
Here is the context of the user's current AI spend audit:
- Team Size: ${results.recommendations[0]?.currentSeats || 1} employees
- Total Current Spend: $${results.totalCurrentSpend}/month
- Total Recommended Spend: $${results.totalRecommendedSpend}/month
- Net Monthly Savings: $${results.totalMonthlySavings}/month
- Net Annual Savings: $${results.totalAnnualSavings}/month
- Recommendations:
${results.recommendations.map(r => `- ${r.toolName}: Current ${r.currentPlan} ($${r.currentSpend}/mo) => Recommended ${r.recommendedPlan} ($${r.recommendedSpend}/mo). Savings: $${r.monthlySavings}/mo. Reason: ${r.reason}`).join('\n')}

Use this context to answer the user's questions about their spend audit, savings strategy, particular tools, or custom advice.
Be extremely professional, concise, encouraging, and clear. Maintain a high-end SaaS tone.
Keep responses under 150 words. Do not use generic filler. Format responses with clean markdown.`;

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
            max_tokens: 300,
            system: systemPrompt,
            messages: messages.map(m => ({ role: m.role, content: m.content }))
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.content?.[0]?.text) {
            return NextResponse.json({ content: data.content[0].text.trim() });
          }
        }
      } catch (e) {
        console.warn('Anthropic API in chat route failed, attempting OpenAI fallback:', e);
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
            max_tokens: 300,
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.map(m => ({ role: m.role, content: m.content }))
            ],
            temperature: 0.5
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.choices?.[0]?.message?.content) {
            return NextResponse.json({ content: data.choices[0].message.content.trim() });
          }
        }
      } catch (e) {
        console.warn('OpenAI API in chat route failed:', e);
      }
    }

    // 2. Intelligent, context-aware keyword analysis fallback
    let responseText = '';

    // Extract recommendations for specific tools to customize fallback messages
    const copilotRec = results.recommendations.find(r => r.toolName.toLowerCase().includes('copilot'));
    const cursorRec = results.recommendations.find(r => r.toolName.toLowerCase().includes('cursor'));
    const claudeRec = results.recommendations.find(r => r.toolName.toLowerCase().includes('claude'));
    const chatgptRec = results.recommendations.find(r => r.toolName.toLowerCase().includes('chatgpt'));
    const geminiRec = results.recommendations.find(r => r.toolName.toLowerCase().includes('gemini'));
    const openaiApiRec = results.recommendations.find(r => r.toolName.toLowerCase().includes('openai api'));
    const anthropicApiRec = results.recommendations.find(r => r.toolName.toLowerCase().includes('anthropic api'));

    const topRec = [...results.recommendations].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

    if (query.includes('cursor') || query.includes('copilot') || query.includes('windsurf') || query.includes('coding') || query.includes('developer') || query.includes('ide')) {
      if (copilotRec && copilotRec.monthlySavings > 0) {
        responseText = `### Coding Stack Optimization

Based on your audit, standardizing onto **Cursor Pro** ($20/mo) and **cancelling standalone GitHub Copilot licenses** ($10-19/mo) is highly recommended. 
This change alone will save you **$${copilotRec.monthlySavings}/month**! 

Standalone IDE extensions are redundant because modern AI-first editors (like Cursor or Windsurf) already feature premium, built-in code completions and chat. Having both active causes licensing duplication without increasing developer output.`;
      } else if (cursorRec && cursorRec.monthlySavings > 0) {
        responseText = `### Developer Tooling Review

Your developer environment is currently spending **$${cursorRec.currentSpend}/month** on Cursor. We recommend adjusting to the **${cursorRec.recommendedPlan}** tier to save **$${cursorRec.monthlySavings}/month** because:
* *${cursorRec.reason}*

Standardizing your engineering workspace onto a single, properly sized editor subscription eliminates licensing seat leaks while boosting code velocity.`;
      } else {
        responseText = `### IDE & Coding Optimization Advice

We reviewed your developer tools stack. Standalone plugins like GitHub Copilot ($10-$19/user/month) often overlap with full-featured editors like Cursor Pro ($20/user/month) or Windsurf Pro ($15/user/month). 

To optimize:
1. **Consolidate:** Standardize your engineering team on one tool. 
2. **De-duplicate:** Cancel standalone IDE extension licenses for anyone using a full AI editor.
3. **Audit Seats:** Ensure you aren't paying for unassigned seats or inactive contractor licenses.`;
      }
    } else if (query.includes('claude') || query.includes('anthropic') || query.includes('chatgpt') || query.includes('gpt') || query.includes('openai') || query.includes('gemini')) {
      const activeToolRecs = [];
      if (claudeRec && claudeRec.monthlySavings > 0) activeToolRecs.push(`Claude: save **$${claudeRec.monthlySavings}/mo** by adjusting to **${claudeRec.recommendedPlan}**`);
      if (chatgptRec && chatgptRec.monthlySavings > 0) activeToolRecs.push(`ChatGPT: save **$${chatgptRec.monthlySavings}/mo** by adjusting to **${chatgptRec.recommendedPlan}**`);
      if (geminiRec && geminiRec.monthlySavings > 0) activeToolRecs.push(`Gemini: save **$${geminiRec.monthlySavings}/mo** by adjusting to **${geminiRec.recommendedPlan}**`);

      if (activeToolRecs.length > 0) {
        responseText = `### Conversational AI Optimization

Yes, we found immediate optimizations for your chat tools:
${activeToolRecs.map(rec => `* ${rec}`).join('\n')}

**Key Strategy:** Startups often over-provision individual Pro/Plus subscriptions ($20/user/mo). If your employees have individual accounts for both ChatGPT Plus and Claude Pro, you're paying double. We recommend standardizing conversational tools on a single provider, or consolidating into a **Team tier** (minimum 2 seats for ChatGPT, 5 seats for Claude) to leverage admin seat control and robust data privacy.`;
      } else {
        responseText = `### Conversational Assistants Advice

For conversational tools (Claude, ChatGPT, Gemini), startups generally fall into the "seat-leak" trap where individual employees sign up on separate corporate cards.

**Our Recommendations:**
1. **Standardize:** Pick one core assistant (e.g. Claude for writing and reasoning, or ChatGPT for general tasks) and deprecate the other.
2. **Centralize Billing:** Move to a Team tier (e.g. ChatGPT Team is $25-30/seat) to manage subscriptions centrally and prevent inactive seats from leaking cash.
3. **Usage limits:** For casual users who just need occasional chat assistance, consider using a shared internal portal backed by the Pay-As-You-Go API, which is up to 90% cheaper.`;
      }
    } else if (query.includes('marketing') || query.includes('copywriting') || query.includes('sales') || query.includes('content') || query.includes('writing')) {
      responseText = `### Marketing & Content AI Spend

Marketing teams are heavy users of copywriting tools. However, paying $20/month per seat for multiple specialized tools can scale costs quickly.

**Optimization Framework:**
* **Centralize Assistants:** Standardize marketing on a single tool (like ChatGPT Team or Claude Team) where custom GPTs/Projects can be shared.
* **Leverage API:** For batch content generation pipelines, transition developers to pay-as-you-go API keys (OpenAI/Anthropic) instead of paying for fixed seats.
* **Consolidate Copywriters:** Audit if copywriters are using individual seats of external SaaS tools that can be replaced by standard GPT models.`;
    } else if (query.includes('credits') || query.includes('api') || query.includes('tokens') || query.includes('usage') || query.includes('pay as you go')) {
      const activeApiRecs = [];
      if (openaiApiRec && openaiApiRec.monthlySavings > 0) activeApiRecs.push(`OpenAI API: save **$${openaiApiRec.monthlySavings}/mo**`);
      if (anthropicApiRec && anthropicApiRec.monthlySavings > 0) activeApiRecs.push(`Anthropic API: save **$${anthropicApiRec.monthlySavings}/mo**`);

      if (activeApiRecs.length > 0) {
        responseText = `### API & Token Spend

Your API stack has potential optimizations:
${activeApiRecs.map(rec => `* ${rec}`).join('\n')}

API spend (OpenAI / Anthropic API) is inherently usage-based, which is highly efficient compared to fixed seats. However, developers must configure dashboard-level hard limits to prevent runaway loops from draining cards.`;
      } else {
        responseText = `### API & Token Optimization

Usage-based APIs (OpenAI API and Anthropic API) are incredibly cost-effective compared to individual user seats. You only pay for active requests (e.g., a few cents per million tokens of GPT-4o-mini).

**Best Practices:**
1. **Hard Limits:** Configure soft warnings and hard monthly spend ceilings directly in the OpenAI and Anthropic developer consoles.
2. **Standardize Models:** Ensure scripts default to high-efficiency models (like GPT-4o-mini or Claude 3.5 Haiku) for general tasks, reserving premium models (like Claude 3.5 Sonnet or GPT-4o) for high-reasoning tasks.
3. **Cache Prompt Tokens:** Enable Anthropic/OpenAI prompt caching features in your API code to reduce token costs by up to 50% for repetitive prompts.`;
      }
    } else if (query.includes('why') || query.includes('leak') || query.includes('downgrade') || query.includes('save') || query.includes('reduce') || query.includes('cost')) {
      responseText = `### Audit Savings Rationale

Let's break down why you're overspending:
* **Current Spend:** $${results.totalCurrentSpend}/month
* **Optimized Spend:** $${results.totalRecommendedSpend}/month
* **Net Monthly Savings:** **$${results.totalMonthlySavings}/month** (**$${results.totalAnnualSavings}/year**)

${topRec && topRec.monthlySavings > 0 ? `The biggest single leak is **${topRec.toolName}**, where adjusting your current plan can instantly save you **$${topRec.monthlySavings}/month**! ${topRec.reason}` : 'Your audit highlights savings from de-duplicating licensing across overlapping tools.'}

By aligning your seat counts strictly with active users, switching from redundant individual plans to consolidated organization plans, and cancelling overlapping coding extensions, you immediately recapture these funds.`;
      } else if (query.includes('credex') || query.includes('consult') || query.includes('book') || query.includes('partner') || query.includes('expert') || query.includes('help')) {
        responseText = `### 🎯 Credex Spend Optimization Partnership

Through our custom partnership with **Credex**, we offer advanced, hands-on optimization across your entire SaaS, cloud, and subscription infrastructure (including AWS, GCP, Vercel, Slack, HubSpot, and Salesforce).

**Credex Benefits:**
* **Free Vendor Credits:** Secure up to $10,000+ in free startup credits.
* **Corporate Discounts:** Access pre-negotiated corporate rates (up to 30% off).
* **Guaranteed Savings:** Credex consultants negotiate directly with vendors on your behalf.

Enter your email in the consultation card on this dashboard to submit a request, and a Credex specialist will reach out to you within 24 hours!`;
      } else {
        responseText = `### OptiAI Spend Copilot

I am your active spend optimization advisor! Based on your audit, your team is currently spending **$${results.totalCurrentSpend}/month** and could optimize this down to **$${results.totalRecommendedSpend}/month** — returning **$${results.totalMonthlySavings}/month** (**$${results.totalAnnualSavings}/year**) directly to your cash reserves.

**How can I help you optimize further today?**
* "Why should we downgrade ChatGPT/Claude?"
* "How do we handle engineering tools like Cursor and Copilot?"
* "What is the pay-as-you-go API strategy?"
* "Can you tell me more about Credex free vendor credits?"`;
      }

    return NextResponse.json({ content: responseText });
  } catch (error: unknown) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Server failed to process chat request.' }, { status: 500 });
  }
}
