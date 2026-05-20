import { NextRequest, NextResponse } from 'next/server';
import { saveLead } from '@/lib/supabase';

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

    // Save lead to database (with automatic in-memory fallback)
    const saved = await saveLead({
      audit_id: auditId,
      email,
      company_name: companyName,
      role,
      team_size: teamSize ? parseInt(teamSize, 10) : undefined
    });

    // Send email using Resend
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
            subject: 'Your AI Spend Optimization Report - OptiAI',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #0f766e; font-size: 24px; font-weight: bold; margin-bottom: 16px;">OptiAI Spend Audit</h2>
                <p style="font-size: 16px; color: #334155; line-height: 1.6;">Thank you for running an AI spend audit with OptiAI! Your personalized report has been compiled and is ready for review.</p>
                <div style="margin: 24px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${auditId}" 
                     style="background-color: #0f766e; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                    View My Shareable Audit Report
                  </a>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="font-size: 14px; color: #64748b; line-height: 1.5;">Want to unlock even deeper savings or get custom startup credits? Reply to this email or book a consultation directly through your dashboard!</p>
                <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">© ${new Date().getFullYear()} OptiAI. Optimize your AI tool spend in seconds.</p>
              </div>
            `
          })
        });
        
        if (response.ok) {
          console.log(`Resend: Confirmation email successfully sent to ${email}`);
        } else {
          console.warn('Resend email failed to send:', await response.text());
        }
      } catch (err) {
        console.error('Resend email sending exception:', err);
      }
    } else {
      // Graceful local logging fallback
      console.log('--------------------------------------------------');
      console.log(`[LOCAL DEV MODE] Resend email confirmation:`);
      console.log(`To: ${email}`);
      console.log(`Subject: Your AI Spend Optimization Report - OptiAI`);
      console.log(`URL: http://localhost:3000/share/${auditId}`);
      console.log('--------------------------------------------------');
    }

    return NextResponse.json({ success: true, lead: saved }, { status: 201 });
  } catch (error: unknown) {
    console.error('Lead record error:', error);
    return NextResponse.json({ error: 'Failed to record lead information.' }, { status: 500 });
  }
}
