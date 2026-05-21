import { NextRequest, NextResponse } from 'next/server';
import { saveLead, getAudit } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

// Simple in-memory rate-limiter: stores IP => timestamp list
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  
  // Filter out expired timestamps
  const activeTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
  
  if (activeTimestamps.length >= MAX_REQUESTS) {
    return true;
  }
  
  activeTimestamps.push(now);
  rateLimitMap.set(ip, activeTimestamps);
  return false;
}

// Simple local markdown parser for beautiful HTML transactional email rendering
function parseMarkdownToEmailHtml(markdown: string): string {
  if (!markdown) return '';
  return markdown
    .split('\n')
    .map(line => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith('### ')) {
        return `<h3 style="color: #10b981; font-family: sans-serif; font-size: 16px; font-weight: bold; margin-top: 24px; margin-bottom: 8px; text-transform: uppercase; tracking-wider: 0.05em;">${cleanLine.substring(4)}</h3>`;
      }
      
      if (cleanLine.startsWith('- **') || cleanLine.startsWith('* **')) {
        const boldMatch = cleanLine.match(/^[-*]\s*\*\*(.*?)\*\*(.*)/);
        if (boldMatch) {
          return `
            <div style="margin: 12px 0; padding-left: 12px; border-left: 2px solid #10b981; font-family: sans-serif; font-size: 13px; line-height: 1.6; color: #cbd5e1;">
              <strong style="color: #ffffff;">${boldMatch[1]}</strong>${boldMatch[2].replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffffff;">$1</strong>')}
            </div>
          `;
        }
      }

      const formatted = cleanLine.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffffff;">$1</strong>');
      if (formatted.length > 0) {
        return `<p style="margin: 10px 0; font-family: sans-serif; font-size: 13px; line-height: 1.6; color: #94a3b8;">${formatted}</p>`;
      }
      return '';
    })
    .join('');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { auditId, email, companyName, role, teamSize, honeypot } = body;

    // Honeypot detection - if field is populated, silently return success to prevent crawler alerts
    if (honeypot) {
      console.warn('Honeypot triggered! Spam lead ignored silently.');
      return NextResponse.json({ success: true, message: 'Lead recorded.' }, { status: 201 });
    }

    if (!auditId || !email) {
      return NextResponse.json({ error: 'Missing audit ID or email.' }, { status: 400 });
    }

    // Basic rate limit verification
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local-client';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many submissions. Please wait a minute and try again.' }, { status: 429 });
    }

    // Fetch the full audit record to compile rich email context
    const audit = await getAudit(auditId);
    if (!audit) {
      return NextResponse.json({ error: 'Associated spend audit could not be found.' }, { status: 404 });
    }

    // Save lead to database (with automatic in-memory fallback)
    const saved = await saveLead({
      audit_id: auditId,
      email,
      company_name: companyName,
      role,
      team_size: teamSize ? parseInt(teamSize, 10) : undefined
    });

    const results = audit.results_data;
    const monthlySavings = formatCurrency(results.totalMonthlySavings);
    const annualSavings = formatCurrency(results.totalAnnualSavings);
    const currentSpend = formatCurrency(results.totalCurrentSpend);
    const optimizedSpend = formatCurrency(results.totalRecommendedSpend);

    // Build the dynamic tool recommendations comparison table
    const tableRowsHtml = results.recommendations.map(rec => {
      const hasSavings = rec.monthlySavings > 0;
      return `
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 10px 8px; font-family: sans-serif; font-size: 13px; color: #ffffff; font-weight: 600; text-align: left;">
            ${rec.toolName}
          </td>
          <td style="padding: 10px 8px; font-family: sans-serif; font-size: 12px; color: #64748b; text-align: left;">
            ${rec.currentPlan} (${rec.currentSeats || 'Usage'})
          </td>
          <td style="padding: 10px 8px; font-family: sans-serif; font-size: 12px; color: #10b981; font-weight: 600; text-align: left;">
            ${rec.recommendedPlan}
          </td>
          <td style="padding: 10px 8px; font-family: sans-serif; font-size: 13px; color: ${hasSavings ? '#10b981' : '#475569'}; font-weight: bold; text-align: right;">
            ${hasSavings ? `${formatCurrency(rec.monthlySavings)}/mo` : 'Optimized'}
          </td>
        </tr>
      `;
    }).join('');

    const formattedAiSummaryHtml = parseMarkdownToEmailHtml(audit.ai_summary);

    // Construct the personalized greeting
    const greetingText = role && companyName
      ? `Hi ${role} at ${companyName},`
      : companyName
        ? `Hi team at ${companyName},`
        : `Hi there,`;

    const nextPublicAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const auditDashboardLink = `${nextPublicAppUrl}/share/${auditId}`;

    const emailSubject = `Your AI Spend Optimization Report - OptiAI`;
    const emailHtmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your AI Spend Optimization Report</title>
        </head>
        <body style="background-color: #0b0f19; margin: 0; padding: 40px 20px; font-family: sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #0d1527; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
            
            <!-- Banner Header -->
            <div style="background-color: #10b981; padding: 24px; text-align: center;">
              <h1 style="color: #090d16; font-size: 24px; font-weight: 800; margin: 0; font-family: sans-serif; letter-spacing: -0.025em;">
                OptiAI Spend Audit
              </h1>
              <p style="color: #064e3b; font-size: 12px; font-weight: 700; margin: 6px 0 0 0; text-transform: uppercase; tracking-wider: 0.05em;">
                Financial Optimization Report Completed
              </p>
            </div>

            <!-- Content Area -->
            <div style="padding: 32px 24px;">
              <p style="font-size: 14px; color: #ffffff; font-weight: 600; margin-top: 0;">
                ${greetingText}
              </p>
              <p style="font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">
                We successfully compiled your startup's AI spend audit. By standardizing licensing tiers and eliminating overlaps, you can instantly recapture capital for your reserves.
              </p>

              <!-- Financial Metric Cards -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <tr>
                  <td style="width: 50%; padding-right: 8px;">
                    <div style="background-color: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 16px; text-align: center;">
                      <span style="display: block; font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">Monthly Savings</span>
                      <strong style="font-size: 24px; color: #10b981; font-weight: 800;">${monthlySavings}</strong>
                    </div>
                  </td>
                  <td style="width: 50%; padding-left: 8px;">
                    <div style="background-color: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 16px; text-align: center;">
                      <span style="display: block; font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">Annual Savings</span>
                      <strong style="font-size: 24px; color: #10b981; font-weight: 800;">${annualSavings}</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Spend Summary Info -->
              <div style="border-top: 1px solid #1e293b; border-bottom: 1px solid #1e293b; padding: 12px 4px; margin-bottom: 28px; font-size: 12px; color: #94a3b8;">
                <table style="width: 100%;">
                  <tr>
                    <td style="text-align: left;">Current Spend: <strong>${currentSpend}/mo</strong></td>
                    <td style="text-align: right;">Optimized Spend: <strong style="color: #10b981;">${optimizedSpend}/mo</strong></td>
                  </tr>
                </table>
              </div>

              <!-- AI Audit Summary Plan -->
              <div style="margin-bottom: 32px;">
                ${formattedAiSummaryHtml}
              </div>

              <!-- Tool Recommendations Breakdown -->
              <div style="margin-bottom: 32px;">
                <h3 style="color: #ffffff; font-family: sans-serif; font-size: 14px; font-weight: bold; margin-bottom: 12px; text-transform: uppercase; border-bottom: 2px solid #1e293b; padding-bottom: 6px;">
                  Per-Tool Breakdown
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="border-bottom: 2px solid #1e293b;">
                      <th style="padding: 8px; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; text-align: left;">Tool</th>
                      <th style="padding: 8px; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; text-align: left;">Current Plan</th>
                      <th style="padding: 8px; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; text-align: left;">Recommendation</th>
                      <th style="padding: 8px; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; text-align: right;">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRowsHtml}
                  </tbody>
                </table>
              </div>

              <!-- Action Button CTA -->
              <div style="text-align: center; margin: 36px 0 20px 0;">
                <a href="${auditDashboardLink}" 
                   style="background-color: #10b981; color: #090d16; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(16,185,129,0.25);">
                  View Complete Audit Dashboard
                </a>
              </div>

            </div>

            <!-- Footer Area -->
            <div style="background-color: #090d16; padding: 24px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="font-size: 12px; color: #475569; margin: 0 0 8px 0; line-height: 1.5;">
                Want to claim up to $10,000 in free startup API credits or seek customized corporate SaaS discounts? Reply directly to this report to kickstart our broker services.
              </p>
              <p style="font-size: 10px; color: #334155; margin: 16px 0 0 0;">
                © ${new Date().getFullYear()} OptiAI. All rights reserved. Secure and code-free spend intelligence.
              </p>
            </div>

          </div>
        </body>
      </html>
    `;

    // Dispatch email using Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'OptiAI <audits@optiai.co>',
            to: email,
            subject: emailSubject,
            html: emailHtmlBody
          })
        });
        
        if (response.ok) {
          console.log(`[RESEND SUCCESS] Rich audit confirmation email sent to ${email}`);
        } else {
          console.warn('[RESEND FAILURE] Failed to dispatch via Resend:', await response.text());
        }
      } catch (err) {
        console.error('[RESEND EXCEPTION] Email exception in route:', err);
      }
    } else {
      // Graceful local logging fallback - dumps details and HTML preview structure
      console.log('\n======================================================================');
      console.log('📬 [LOCAL DEV MODE] HTML Transactional Email Template Compiled Successfully');
      console.log(`To:      ${email}`);
      console.log(`Subject: ${emailSubject}`);
      console.log(`Audit:   ${auditDashboardLink}`);
      console.log('----------------------------------------------------------------------');
      console.log('HTML STRUCTURE PREVIEW GENERATED SUCCESSFULLY');
      console.log('======================================================================\n');
    }

    return NextResponse.json({ success: true, lead: saved }, { status: 201 });
  } catch (error: unknown) {
    console.error('Lead record error:', error);
    return NextResponse.json({ error: 'Failed to record lead information.' }, { status: 500 });
  }
}
