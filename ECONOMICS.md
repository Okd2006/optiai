# Unit Economics & Monetization Model — OptiAI

OptiAI functions as a free utility that monetizes high-value qualified traffic through B2B affiliate brokerages and startup credits broker commissions. This document details our operational expenses, customer lifetime value (LTV), acquisition cost targets (CAC), and overall financial sustainability.

---

## 📈 The Business Monetization Pathway

OptiAI is entirely free for the end user, which eliminates conversion friction. We monetize through our strategic partnership with **Credex**, a premier accelerator perks broker that helps startups source free credits ($10,000+ OpenAI/Anthropic API vouchers) and enterprise subscription discounts.

Our referral economics function as follows:
- **Lead Qualification**: Any company running an audit that identifies **$500/month ($6,000/year) or greater** in AI overspend is flagged as a "Qualified Lead".
- **The CTA Trigger**: We present a high-visibility, priority invitation to book a complimentary "Credex Partner Credits Consultation" to source corporate credits and vendor perks.
- **Broker Commissions**: Once the referred startup books a call and successfully secures credits or contracts through Credex, Credex pays OptiAI a premium B2B referral broker commission:
  - **Flat Fee per Successful Booking**: $150
  - **Revenue Share on Contract Discounts**: 15% of the total contract savings secured (Average commission: **$350 to $1,000+ per converted startup**).

---

## 🔬 Cost Structure (Operational Expenses)

Hosting a modern serverless Next.js 15 application is highly cost-efficient, resulting in extremely low operational overhead per audit run:

1. **Frontend Hosting (Vercel Serverless)**:
   - *Cost*: $0 (Free Tier) or $20/month (Vercel Pro). Edge function execution easily handles millions of requests.
2. **Database Engine (Supabase Starter PG)**:
   - *Cost*: $0 (Free Tier) or $25/month (Pro Tier). Easily sustains over 50,000 audit records and contact logs.
3. **AI Summary Generation (Anthropic/OpenAI APIs)**:
   - *Cost*: Average of $0.002 per summary generated (Claude 3.5 Sonnet / GPT-4o mini). 10,000 summaries cost **~$20**.
4. **Email Dispatch Gateway (Resend)**:
   - *Cost*: $0 (Free tier provides 3,000 emails/month) or $20/month (for up to 50,000 emails).

**Total Cost per Audit Run**: **~$0.005** (half a cent).

---

## 📊 Financial Model Projection (CAC & LTV)

Let us project our unit economics assuming a standard volume of **10,000 completed audits**:

- **Total Audits Completed**: 10,000
- **Conversion to Lead (Email Form Submit)**: 25% (2,500 leads captured)
- **High-Savings Qualification Rate ($500+/mo overspend)**: 15% of leads (375 startups qualified)
- **Credex Consultation Booking Conversion**: 8% of qualified leads (30 booked consultations)
- **Broker Commission Revenue**:
  - 30 conversions * $350 average payout = **$10,500 total revenue**.

### Unit Economics Ratios
- **Customer Lifetime Value (LTV)**:
  - LTV = Total Revenue / Total Converted Leads = $10,500 / 2,500 = **$4.20 per captured lead**.
- **Customer Acquisition Cost (CAC) Threshold**:
  - To maintain a highly profitable **3:1 LTV-to-CAC ratio**, our target customer acquisition cost must not exceed:
  - Max Target CAC = LTV / 3 = **$1.40 per captured lead** (or **$0.35 per landing page visitor** assuming a 25% form completion rate).

By prioritizing organic social sharing loops (founders sharing `/share` dashboards), our actual organic CAC is targeted at **<$0.10**, guaranteeing an exceptionally profitable and scalable business model from day one.
