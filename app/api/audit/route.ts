import { NextRequest, NextResponse } from 'next/server';
import { runAudit } from '@/lib/audit-engine';
import { generateAiSummary } from '@/lib/ai-summary';
import { saveAudit, getAudit, getAuditsByUserId } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamSize, primaryUseCase, tools, userId } = body;

    if (!teamSize || !primaryUseCase || !Array.isArray(tools)) {
      return NextResponse.json({ error: 'Invalid or missing fields in request body.' }, { status: 400 });
    }

    // 1. Run audit calculations
    const results = runAudit({ teamSize, primaryUseCase, tools });

    // 2. Generate personalized AI summary
    const aiSummary = await generateAiSummary({
      teamSize,
      primaryUseCase,
      results
    });

    const auditId = crypto.randomUUID();

    // 3. Save to database (with automatic in-memory fallback)
    const saved = await saveAudit({
      id: auditId,
      user_id: userId,
      input_data: { teamSize, primaryUseCase, tools },
      results_data: results,
      ai_summary: aiSummary,
      total_monthly_savings: results.totalMonthlySavings,
      total_annual_savings: results.totalAnnualSavings
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error: unknown) {
    console.error('Audit processing error:', error);
    return NextResponse.json({ error: 'Server failed to process audit calculations.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id && !userId) {
      return NextResponse.json({ error: 'Missing required parameter: id or userId.' }, { status: 400 });
    }

    if (userId) {
      const audits = await getAuditsByUserId(userId);
      return NextResponse.json(audits, { status: 200 });
    }

    const audit = await getAudit(id!);

    if (!audit) {
      return NextResponse.json({ error: 'Audit record not found.' }, { status: 404 });
    }

    return NextResponse.json(audit, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching audit:', error);
    return NextResponse.json({ error: 'Failed to retrieve audit record.' }, { status: 500 });
  }
}

