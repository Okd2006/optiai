# User Interview Records & Persona Insights — OptiAI

To design a highly intuitive, high-converting product, we conducted three targeted user interviews with startup decision-makers. Below are the transcripts, key quotes, and product takeaways.

---

## 👤 Interview 1: The Fast-Scaling CTO
* **Name:** Marcus Vance
* **Role:** CTO & Co-Founder, DevFlow (YC W25)
* **Company Size:** 12 employees (8 engineers)
* **Current AI Spend:** ~$1,200/month

### Transcript Excerpt
> **Q: How do you currently track your team's AI tool subscriptions?**
>
> *Vance:* "Honestly? I don't. When we were 3 devs, I just put everyone on my credit card. Now that we are 12, developers are buying what they need. I know some use Cursor, some use Copilot, and we have a shared ChatGPT Team account that I think half the team doesn't log into anymore because they prefer Claude. I'm too busy building to go into five different admin panels to see who is active."
>
> **Q: What is your biggest blocker to auditing this spend?**
>
> *Vance:* "Time and security. If a tool asks me to connect our Google Workspace or sync our bank accounts just to tell me I'm overspending $100, I'm going to close the tab. I don't need another third-party script reading our invoices. Give me a simple checklist where I can type in my seat count, see the result, and decide myself."

### Product Takeaways
- **Frictionless Onboarding is Key**: Do not require OAuth, Google API, or bank integrations. Use a clean manual configurator form.
- **Flag Redundant Developer Tools**: Focus on detecting duplicate coding tools (Cursor + GitHub Copilot) since devs often forget to cancel old subscriptions when transitioning tools.

---

## 👤 Interview 2: The Runway-Constrained Solo Founder
* **Name:** Sarah Jenkins
* **Role:** Solo Founder, CleanByte
* **Company Size:** 3 employees (2 devs, 1 writer)
* **Current AI Spend:** ~$310/month

### Transcript Excerpt
> **Q: What was the biggest surprise on your latest software invoice?**
>
> *Jenkins:* "I realized Claude Team was charging me $150/month even though we only have three active users. When I signed up, I didn't see the tiny text saying there is a strict 5-seat minimum to use the Team plan. We were paying for two completely empty seats for four months! That is $120 completely wasted that we could have spent on API testing."
>
> **Q: What would make a free audit tool worth sharing with your investors?**
>
> *Jenkins:* "If it gives me a clear, clean graphic showing exactly how much annual cash we reclaimed. VCs love to see early founders exercising absolute fiscal discipline. If I can show my investors a screenshot saying 'OptiAI saved us $1,400 in runway burn', that makes me look incredibly smart."

### Product Takeaways
- **Highlight Plan Seat Minimums**: Specifically build logic rules for Claude Team (5-seat min) and ChatGPT Team (2-seat min) as early-stage founders fall into this trap constantly.
- **Clean Shareable Screens**: Create a public URL (`/share/[id]`) that is beautifully visual, anonymized (hides emails/company details), and optimized for rapid screenshot sharing.

---

## 👤 Interview 3: The API-Intense Operations Lead
* **Name:** David Kim
* **Role:** Head of Operations, LexoAI (LegalTech Startup)
* **Company Size:** 18 employees
* **Current AI Spend:** ~$4,800/month (heavy API usage)

### Transcript Excerpt
> **Q: How does your team manage custom LLM API spends?**
>
> *Kim:* "Our API bill fluctuates wildy. We run GPT-4o for document drafting and Anthropic for semantic searches. Last month our Anthropic API bill alone hit $3,000. We know we need to optimize (like context caching or prompt compression), but our developers are constantly shipping new features. Optimization is always a 'tomorrow' task."
>
> **Q: How would a partnership consultation help you?**
>
> *Kim:* "If a tool could bridge the gap between our high spend and free accelerator credits, that would be a lifesaver. We know OpenAI offers up to $10,000 in free startup credits through partner perks, but we don't know how to apply or qualify since we are bootstrapped. A broker who can unlock those credits for us would save us thousands."

### Product Takeaways
- **Support High-Spend API Optimization Rules**: Provide recommendations targeting context caching and router efficiency to save up to 30% of API bills.
- **Trigger Accelerator Partner Perks**: Integrate a strong B2B consultation pathway (via Credex) for companies spending $500+/month to connect them with free vendor credits.
