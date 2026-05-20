'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Lock,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Recommendation {
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

interface AuditRecord {
  id: string;
  results_data: {
    totalCurrentSpend: number;
    totalRecommendedSpend: number;
    totalMonthlySavings: number;
    totalAnnualSavings: number;
    recommendations: Recommendation[];
    showCredexCta: boolean;
    isWellOptimized: boolean;
  };
  ai_summary: string;
  total_monthly_savings: number;
  total_annual_savings: number;
  created_at: string;
}

export default function PublicSharePage() {
  const params = useParams();
  const id = params.id as string;

  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAudit = async () => {
      try {
        const response = await fetch(`/api/audit?id=${id}`);
        if (!response.ok) {
          throw new Error('Audit report not found.');
        }
        const data = await response.json();
        setAudit(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load public audit.');
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <Sparkles className="h-10 w-10 text-emerald-400 animate-spin" />
        <span className="text-sm font-semibold tracking-wide">Retrieving Public Audit Profile...</span>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass border-rose-500/20 text-center rounded-2xl space-y-6">
        <AlertCircle className="h-12 w-12 text-rose-400 mx-auto" />
        <h2 className="font-display font-bold text-xl text-white">Report Not Found</h2>
        <p className="text-slate-400 text-sm">This shareable URL is invalid or has expired.</p>
        <Link 
          href="/" 
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-sm shadow-md transition"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const { results_data, ai_summary } = audit;
  const savings = results_data.totalMonthlySavings;
  const annualSavings = results_data.totalAnnualSavings;

  return (
    <div className="relative overflow-hidden min-h-screen py-12 px-6 md:px-12 max-w-5xl mx-auto z-10 space-y-8">
      {/* Glowing Orb */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Public Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Lock className="h-3.5 w-3.5" />
            Anonymous Public Report
          </span>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white mt-1">
            OptiAI Cost Savings Summary
          </h1>
        </div>
        <Link
          href="/audit"
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg shadow-md transition whitespace-nowrap hidden sm:inline-block cursor-pointer"
        >
          Run My Free Audit
        </Link>
      </div>

      {/* Main Financial Metrics */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Total Monthly Savings */}
        <div className="glass p-6 rounded-2xl border-emerald-500/20 col-span-1 flex flex-col justify-between h-44">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Identified Monthly Savings</span>
          <div>
            <span className="font-display font-black text-4xl sm:text-5xl text-emerald-400 block tracking-tight">
              {formatCurrency(savings)}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">Slashed from monthly burn rate</span>
          </div>
        </div>

        {/* Total Annual Savings */}
        <div className="glass p-6 rounded-2xl border-emerald-500/20 col-span-1 flex flex-col justify-between h-44">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Identified Annual Savings</span>
          <div>
            <span className="font-display font-black text-4xl sm:text-5xl text-emerald-400 block tracking-tight">
              {formatCurrency(annualSavings)}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">Retained corporate capital</span>
          </div>
        </div>

        {/* Spend distribution */}
        <div className="glass p-6 rounded-2xl border-slate-800 col-span-1 flex flex-col justify-between h-44">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Spend Distribution</span>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Original Spend:</span>
              <span className="text-slate-200 font-bold">{formatCurrency(results_data.totalCurrentSpend)}/mo</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-medium">Optimized Spend:</span>
              <span className="text-emerald-400 font-bold">{formatCurrency(results_data.totalRecommendedSpend)}/mo</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(10, Math.min(100, (results_data.totalRecommendedSpend / (results_data.totalCurrentSpend || 1)) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="glass p-6 sm:p-8 rounded-2xl border-emerald-500/10 space-y-4">
        <h2 className="font-display font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <span>Personalized AI Audit Summary</span>
        </h2>
        <div className="prose prose-invert prose-xs text-slate-300 max-w-none text-xs sm:text-sm leading-relaxed border-t border-slate-800/80 pt-4 whitespace-pre-line">
          {ai_summary}
        </div>
      </div>

      {/* Optimization details */}
      {results_data.isWellOptimized ? (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
          <span><strong>Stack Optimized:</strong> This startup’s AI software subscriptions are already sized optimally.</span>
        </div>
      ) : results_data.showCredexCta ? (
        <div className="p-6 md:p-8 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-[-30%] right-[-20%] w-[250px] h-[250px] rounded-full bg-emerald-400/5 blur-[60px] pointer-events-none" />
          <div className="space-y-2 max-w-xl">
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-white">
              Sponsor Credits Opportunities Available
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Because identified annual savings exceed $500/month, this profile qualifies for accelerator-tier sponsor packages. Book a complimentary consult to get up to $10,000 in free startup API credits.
            </p>
          </div>
          <a
            href="https://credex.co/consultation"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-lg transition duration-200 cursor-pointer shrink-0"
          >
            <span>Book a Credex Consultation</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      ) : null}

      {/* Per-Tool Recommendations */}
      <div className="space-y-4">
        <h2 className="font-display font-extrabold text-lg text-white">
          Cost Optimization Roadmap
        </h2>
        
        <div className="space-y-4">
          {results_data.recommendations.map((rec, idx) => {
            const hasSavings = rec.monthlySavings > 0;
            return (
              <div 
                key={idx} 
                className={`p-6 rounded-2xl border ${hasSavings ? 'border-emerald-500/20 bg-slate-950/20 shadow-md shadow-emerald-500/2' : 'border-slate-800 bg-slate-950/40'} hover:border-slate-800/80 transition`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-extrabold text-base text-white">{rec.toolName}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${hasSavings ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {hasSavings ? 'Optimization Found' : 'Optimal Plan'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                      {rec.reason}
                    </p>
                  </div>

                  <div className="flex md:flex-col items-baseline md:items-end justify-between border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0 shrink-0 gap-1.5">
                    {hasSavings ? (
                      <>
                        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">Savings:</span>
                        <div className="text-right">
                          <span className="font-display font-extrabold text-lg text-emerald-400 block">{formatCurrency(rec.monthlySavings)}/mo</span>
                          <span className="text-[10px] text-slate-500 block">({formatCurrency(rec.annualSavings)}/yr)</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-500 block">Spend Optimized</span>
                        <span className="text-[10px] text-slate-600 block">{formatCurrency(rec.currentSpend)}/mo</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800/60 mt-4 pt-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase mb-0.5">Original Plan</span>
                    <span className="text-slate-300 font-bold">{rec.currentPlan}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase mb-0.5">Seats</span>
                    <span className="text-slate-300 font-bold">{rec.currentSeats || 'Usage API'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase mb-0.5">Optimal Plan</span>
                    <span className={`font-bold ${hasSavings ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {rec.recommendedPlan}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase mb-0.5">Optimal Spend</span>
                    <span className="text-slate-300 font-bold">
                      {formatCurrency(rec.recommendedSpend)}/mo
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Call-to-action bottom panel for other people visiting the share link */}
      <div className="glass p-8 rounded-3xl border border-emerald-500/20 text-center relative overflow-hidden space-y-4">
        <h2 className="font-display font-extrabold text-xl text-white">How optimized is your startup’s AI tool spend?</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Stop duplicate seat subscription billing and plan tier sizing waste. Run a rapid financial audit in seconds.
        </p>
        <div>
          <Link 
            href="/audit" 
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition duration-200 cursor-pointer text-xs"
          >
            <span>Run Free Audit Now</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
