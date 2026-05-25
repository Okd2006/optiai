'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Activity, 
  TrendingDown, 
  Users, 
  ArrowRight, 
  Lock,
  Loader2,
  Calendar,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { AuditRecord } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Protected Route Check & Audits Fetch
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setLoadingHistory(false);
      return;
    }

    async function fetchHistory() {
      try {
        const response = await fetch(`/api/audit?userId=${user!.id}`);
        if (!response.ok) {
          throw new Error('Failed to retrieve calculation archives.');
        }
        const data = await response.json();
        setAudits(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Database sync failed.');
      } finally {
        setLoadingHistory(false);
      }
    }

    fetchHistory();
  }, [user, loading]);

  if (loading || loadingHistory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-zinc-500">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Syncing Dashboard Vault...</span>
      </div>
    );
  }

  // Access Denied State (Protected Route Gate)
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass border-zinc-900 text-center rounded-3xl space-y-6 shadow-premium">
        <Lock className="h-10 w-10 text-rose-450 mx-auto" />
        <div className="space-y-1.5">
          <h2 className="font-display font-extrabold text-lg text-zinc-100">Protected Dashboard Vault</h2>
          <p className="text-zinc-500 text-xs leading-relaxed leading-4 max-w-[280px] mx-auto">
            This workspace requires a secure session. Sign in with Google to view saved audits and track benchmarks.
          </p>
        </div>
        <Link 
          href="/login" 
          className="inline-flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold px-6 py-2.5 rounded-lg text-xs shadow-md transition cursor-pointer"
        >
          <span>Sign In with Google</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  // Derived dashboard stats
  const totalSavings = audits.reduce((acc, curr) => acc + curr.total_monthly_savings, 0);
  const totalAnnualSavings = audits.reduce((acc, curr) => acc + curr.total_annual_savings, 0);
  const averageHealth = audits.length > 0 
    ? Math.round(audits.reduce((acc, curr) => acc + (curr.results_data.healthScore?.overallScore ?? 75), 0) / audits.length) 
    : 0;

  // Mock historical baseline dataset if they only have 1 run (visual stats check)
  const historicalBenchmarks = audits.length > 0
    ? audits.map((a, i) => ({
        run: `Run ${audits.length - i}`,
        spend: Math.round(a.results_data.totalCurrentSpend / (a.results_data.recommendations[0]?.currentSeats || 5)),
        date: new Date(a.created_at).toLocaleDateString()
      }))
    : [];

  return (
    <div className="relative overflow-hidden min-h-screen py-12 px-6 md:px-12 max-w-6xl mx-auto z-10 space-y-8 select-none">
      
      {/* Dynamic Backdrop gradients */}
      <div className="absolute top-[5%] left-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-500/[0.01] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.01] blur-[130px] pointer-events-none" />

      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Startup Workspace</span>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-zinc-100 tracking-tight mt-1">
            Hi, {user.name}
          </h1>
          <span className="text-zinc-500 text-xs block mt-0.5">{user.role} • {user.companyName}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/audit" 
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold px-4 py-2 rounded-lg text-xs shadow-sm hover:shadow-zinc-100/5 transition cursor-pointer"
          >
            Run New Audit
          </Link>
          <button 
            onClick={logout}
            className="border border-zinc-900 hover:border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/50 text-zinc-400 hover:text-white px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* SECTION 1: CUMULATIVE STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total monthly savings */}
        <div className="glass p-5 rounded-2xl border border-zinc-900 col-span-1 flex flex-col justify-between h-36">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Total Monthly Savings</span>
          <div>
            <span className="font-display font-black text-3xl text-emerald-400 block tracking-tight">
              {formatCurrency(totalSavings)}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-1">Recurrent returned runway</span>
          </div>
        </div>

        {/* Total Annual savings */}
        <div className="glass p-5 rounded-2xl border border-zinc-900 col-span-1 flex flex-col justify-between h-36">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Total Annual Reclaimed</span>
          <div>
            <span className="font-display font-black text-3xl text-cyan-400 block tracking-tight">
              {formatCurrency(totalAnnualSavings)}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-1">Projected ROI runway</span>
          </div>
        </div>

        {/* Avg Health Score */}
        <div className="glass p-5 rounded-2xl border border-zinc-900 col-span-1 flex flex-col justify-between h-36">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Average Health Score</span>
          <div>
            <span className="font-display font-black text-3xl text-zinc-150 block tracking-tight">
              {averageHealth ? `${averageHealth}/100` : '—'}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-1">Workspace complexity weight</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: SAVED AUDITS HISTORY LIST & BENCHMARK CHARTS */}
      <div className="grid lg:grid-cols-5 gap-6">
        
        {/* Left Column: Calculation Archives Listing (3/5 width) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="border-b border-zinc-900 pb-2">
            <h2 className="font-display font-extrabold text-sm text-zinc-200 flex items-center gap-1.5 uppercase tracking-wide">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span>Saved Cost Audit Archives</span>
            </h2>
          </div>

          <div className="space-y-3">
            {audits.length > 0 ? (
              audits.map((a, index) => {
                const toolsCount = Array.isArray(a.input_data ? (a.input_data as { tools: unknown[] }).tools : null) 
                  ? (a.input_data as { tools: unknown[] }).tools.length 
                  : 0;

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    key={a.id}
                    className="p-4 bg-zinc-900/10 border border-zinc-900 rounded-xl hover:border-zinc-800 transition flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-[280px]">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-200">Audit ID: {a.id.substring(0, 8)}</span>
                        <span className="text-[8px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-md font-bold uppercase">
                          {toolsCount} {toolsCount === 1 ? 'Tool' : 'Tools'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-zinc-650 shrink-0" />
                        <span>Run on {new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 text-right shrink-0">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block leading-none">Savings</span>
                        <strong className="text-emerald-400 font-extrabold text-sm block mt-1">{formatCurrency(a.total_monthly_savings)}/mo</strong>
                      </div>
                      <Link 
                        href={`/results/${a.id}`} 
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
                        title="View Report"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 relative overflow-hidden space-y-4 hover:border-zinc-800 transition duration-200 shadow-inner">
                <div className="absolute top-[-30%] right-[-10%] w-[150px] h-[150px] rounded-full bg-emerald-500/[0.015] blur-[40px] pointer-events-none" />
                <Sparkles className="h-7 w-7 text-zinc-700 mx-auto animate-pulse" />
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">No Saved Calculations</h3>
                  <p className="text-[10.5px] text-zinc-500 max-w-[280px] mx-auto leading-relaxed">
                    Select your active startup software subscriptions and plan tiers in the configuration engine to save your first cost reduction roadmap.
                  </p>
                </div>
                <div>
                  <Link 
                    href="/audit" 
                    className="inline-flex items-center justify-center bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white font-semibold text-[10px] px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
                  >
                    <span>Run Your First Audit</span>
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Historical Benchmarking Tracker (2/5 width - FEATURE 2 IN dashboard) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-b border-zinc-900 pb-2">
            <h2 className="font-display font-extrabold text-sm text-zinc-200 flex items-center gap-1.5 uppercase tracking-wide">
              <BarChart2 className="h-4 w-4 text-cyan-400" />
              <span>Benchmark Tracking Over Time</span>
            </h2>
          </div>

          <div className="glass p-5 rounded-2xl border border-zinc-900 space-y-5">
            <div className="space-y-1">
              <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest">SaaS Sprawl Trend</span>
              <h4 className="text-[11px] font-bold text-zinc-200">Historical Developer cost comparison</h4>
              <p className="text-[9.5px] text-zinc-500 leading-relaxed leading-4">
                This timeline tracks your developer seat costs across consecutive audit configurations, charting your progression toward target industry averages.
              </p>
            </div>

            {audits.length > 0 ? (
              <div className="space-y-3.5 pt-2 border-t border-zinc-900">
                {historicalBenchmarks.map((bench, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-400 font-bold">{bench.run} ({bench.date})</span>
                      <strong className="text-zinc-200 font-black">${bench.spend}/mo per developer</strong>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${Math.min(100, (bench.spend / 150) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                
                <div className="p-3 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl text-[10px] leading-relaxed text-zinc-450 text-center">
                  Target industry average for seed SaaS: **$45/mo per developer**
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-650 text-[10px] italic border-t border-zinc-900">
                Benchmark trends will populate automatically once your first audit is calculated.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
