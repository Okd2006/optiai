# Metrics & Instrumentation Framework — OptiAI

This document defines the North Star metric, key input variables, event tracking schema, and strategic business pivot triggers for OptiAI.

---

## 🌟 The North Star Metric

### **Total Monthly Spend Savings Identified (TMSSI)**
*Definition*: The cumulative sum of all monthly savings computed and delivered to founders through completed audits.

### Why this is our North Star Metric:
1. **Direct Value Alignment**: If TMSSI is growing, it means OptiAI is successfully helping startups optimize their cash reserves.
2. **Predictive of Revenue**: The higher the identified overspend savings, the more qualified leads we route to **Credex** for consulting referrals, directly driving company broker commissions.
3. **Viral Velocity Indicator**: Large numbers incentivize screenshot sharing on Twitter/X and LinkedIn, organically increasing new user acquisition.

---

## 📊 Key Input Metrics (Friction Funnel)

To grow our North Star, we optimize three critical input variables:

```
[Traffic / Audits Initiated] ──► [Form Completion Rate] ──► [Lead Registration Rate] ──► [Credex CTA Click Rate]
```

### 1. Daily Active Audits Run (DAAR)
- *What it measures*: Top-of-funnel reach and marketing channel strength.
- *Growth Strategy*: Drive traffic through organic Product Hunt launches, VC portfolio referrals, and cold developer outreach.

### 2. Audit Completion Rate (ACR)
- *What it measures*: Onboarding form friction and UI ease.
- *Calculation*: `(Completed Audits / Started Forms) * 100`
- *Growth Strategy*: Maintain strict zero-login anonymous form models, utilize local caching, and leverage simple selectors to prevent abandonment.

### 3. Lead Registration Rate (LRR)
- *What it measures*: Value delivery strength on the Results dashboard.
- *Calculation*: `(Leads Captured via Save Form / Completed Audits) * 100`
- *Growth Strategy*: Emphasize report backups and accelerator credits application perks in our CTA copy.

---

## 🔌 Instrumentation Event Schema

We instrument tracking using a standard event broker (like PostHog or Segment) embedded in our React client components:

### Event 1: `audit_initiated`
*Trigger*: User lands on `/audit` page.
- `team_size_default`: Number (e.g. 5)

### Event 2: `tool_added` / `tool_removed`
*Trigger*: User adds/deletes a subscription panel in the repeatable list.
- `tool_id`: String (e.g. 'cursor')
- `total_active_tools`: Number

### Event 3: `audit_completed`
*Trigger*: User successfully submits form and `/api/audit` returns 201.
- `audit_id`: UUID
- `team_size`: Number
- `total_current_spend`: Number
- `total_monthly_savings`: Number
- `show_credex_cta`: Boolean

### Event 4: `lead_submitted`
*Trigger*: User completes contact form on results dashboard.
- `audit_id`: UUID
- `has_company_name`: Boolean
- `has_role`: Boolean

### Event 5: `credex_cta_clicked`
*Trigger*: User clicks the "Book a Credex Consultation" button.
- `audit_id`: UUID
- `total_monthly_savings`: Number

---

## 🎯 Strategic Business Pivot Trigger

As a B2B SaaS lead broker, we maintain a strict **Pivot Threshold** to ensure business model viability:

### **The Trigger: Qualified Lead Referral to Booking Conversion drops below 3%**
If less than 3% of users who qualify for the Credex CTA ($500+/mo savings) book a credits consultation over a 60-day window, our primary monetization pathway is unviable.

### The Pivot Playbook:
If triggered, OptiAI will pivot from a **B2B Referral Affiliate Model** to a **Direct SaaS Utility Model**:
1. **Premium Feature Gating**: Offer the initial audit for free, but restrict the detailed per-tool recommendations list and the shareable public dashboard URL behind a one-time charge of **$29** or a **$9/month** team subscription.
2. **Active Subscription Management (SaaS)**: Pivot into a direct integration platform. Charge startups **$19/month** to actively connect Workspace APIs and automatically dowgrade/prorate empty seats across Claude/Cursor/ChatGPT via background scripts, shifting from diagnostic auditing to active cost saving enforcement.
