'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { 
  Layers, 
  Users, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  TrendingDown,
  DollarSign,
  Activity,
  Bot,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { TOOL_LOGOS, OptiAiLogo } from '@/components/BrandLogos';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [dashboardOptimized, setDashboardOptimized] = useState(false);
  const [benchmarkProfile, setBenchmarkProfile] = useState<'seed' | 'saas' | 'ai-first'>('saas');

  // 1. Gating/Redirect logic to login page
  useEffect(() => {
    if (loading) return;
    if (!user) {
      try {
        const isGuest = localStorage.getItem('optiai_guest_mode') === 'true';
        if (!isGuest) {
          router.push('/login');
        }
      } catch (e) {}
    }
  }, [user, loading, router]);

  // 2. Set mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const supportedTools = [
    { name: 'Cursor', desc: 'AI Coding IDE', logoKey: 'cursor' },
    { name: 'Claude', desc: 'Anthropic Assistant', logoKey: 'claude' },
    { name: 'ChatGPT', desc: 'OpenAI Plus & Teams', logoKey: 'chatgpt' },
    { name: 'GitHub Copilot', desc: 'IDE Completion', logoKey: 'copilot' },
    { name: 'Gemini', desc: 'Google Pro Assistant', logoKey: 'gemini' },
    { name: 'Windsurf', desc: 'AI Code Editor', logoKey: 'windsurf' },
    { name: 'OpenAI API', desc: 'GPT-4o API costs', logoKey: 'openai_api' },
    { name: 'Anthropic API', desc: 'Claude API costs', logoKey: 'anthropic_api' }
  ];

  const benchmarkData = {
    seed: { label: 'Seed-Stage Teams', avg: 30, userAvg: 48, desc: 'Highly bootstrapped environments prioritizing lean engineering runway.' },
    saas: { label: 'Series-A SaaS Startups', avg: 55, userAvg: 92, desc: 'Growing businesses managing scaling AI seat distribution models.' },
    'ai-first': { label: 'AI-First Tech Labs', avg: 85, userAvg: 165, desc: 'Advanced engineering teams running high-payload direct LLM calls.' }
  };

  const currentBenchmark = benchmarkData[benchmarkProfile];

  const faqItems = [
    {
      q: 'How does the OptiAI audit work?',
      a: 'We evaluate your team size, primary engineering or editing use case, and active software plans. Using our precise rule engine, we flag redundant tools (e.g. paying for both Claude and ChatGPT when one suffices) and advise downgrading oversized plans (e.g. ChatGPT Team for 1 seat).'
    },
    {
      q: 'Do you require live API or subscription logins?',
      a: 'No. OptiAI is completely privacy-first. You do not need to share passwords, connect accounts, or grant workspace APIs. You just enter your current subscriptions, seats, and monthly bills, and we run the calculations instantly.'
    },
    {
      q: 'What is the Credex partnership about?',
      a: 'Credex is an official startup accelerator credits broker. If our audit detects that your company spends over $500/month, we invite you to book a free call with Credex. They help startups secure up to $10,000+ in free OpenAI/Anthropic credits and unlock enterprise discounts!'
    },
    {
      q: 'Is my audit data private?',
      a: 'Absolutely. We do not sell or share company information. When you click the share URL, we strip out all personal metadata (such as your email, company name, or roles) so your public page only contains anonymous, shareable savings stats.'
    }
  ];

  return (
    <div className="relative overflow-hidden min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      {/* Background Calm Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] rounded-full bg-emerald-500/[0.02] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/[0.015] blur-[180px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-20 pb-16 md:pt-28 md:pb-20 text-center space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[11px] font-semibold text-zinc-400 shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>Real-time Capital Optimisation Engine</span>
        </motion.div>
        
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight leading-[1.05] text-zinc-100 max-w-3xl mx-auto"
          >
            Optimize Your <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">AI Spend</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm md:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed"
          >
            Most startups overpay for AI tools. OptiAI identifies hidden inefficiencies across Cursor, Claude, ChatGPT, Copilot, and more. No account connections required.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
        >
          <Link 
            href="/audit" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold px-6 py-3 rounded-lg shadow-sm hover:shadow-zinc-100/5 transition cursor-pointer text-xs"
          >
            <span>Run Free Audit</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <a 
            href="#how-it-works" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60 px-6 py-3 rounded-lg text-zinc-300 hover:text-white transition font-semibold text-xs"
          >
            See Methodology
          </a>
        </motion.div>

        {/* Dynamic Hydrated Interactive Dashboard Preview (FEATURE 1) */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl mx-auto bg-zinc-950 border border-zinc-900 shadow-2xl rounded-2xl overflow-hidden text-left mt-8 shadow-premium"
          >
            {/* Header controls bar */}
            <div className="bg-zinc-900/60 border-b border-zinc-900/80 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Interactive Audit Simulation</span>
                <span className="text-[9px] text-zinc-650 font-bold hidden sm:inline">•</span>
                <span className="text-[9px] text-zinc-600 font-bold hidden sm:inline">Benchmark updated using May 2026 pricing</span>
                <span className="text-[9px] text-zinc-650 font-bold hidden sm:inline">•</span>
                <span className="text-[9px] text-emerald-500/70 font-semibold hidden sm:inline">Confidence: High</span>
              </div>
              <div className="flex bg-zinc-950 p-0.5 border border-zinc-800 rounded-lg">
                <button
                  onClick={() => setDashboardOptimized(false)}
                  className={`text-[9px] font-semibold px-3 py-1 rounded-md transition ${!dashboardOptimized ? 'bg-zinc-900 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Before Optimization
                </button>
                <button
                  onClick={() => setDashboardOptimized(true)}
                  className={`text-[9px] font-semibold px-3 py-1 rounded-md transition ${dashboardOptimized ? 'bg-zinc-900 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  After Optimization
                </button>
              </div>
            </div>

            {/* Dashboard Contents */}
            <div className="p-6 grid md:grid-cols-5 gap-6">
              
              {/* Left Column stats */}
              <div className="md:col-span-2 space-y-4 pr-0 md:pr-4 border-r border-zinc-900/60">
                <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Audit Spend Health Score</span>
                  <div className="flex items-baseline gap-2">
                    <span className={`font-display font-black text-3xl transition duration-500 ${dashboardOptimized ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {dashboardOptimized ? '92' : '54'}
                    </span>
                    <span className="text-[9px] text-zinc-600 font-bold">/ 100</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${dashboardOptimized ? 'bg-emerald-400' : 'bg-amber-400'}`} 
                      style={{ width: dashboardOptimized ? '92%' : '54%' }}
                    />
                  </div>
                  <span className="text-[9px] text-zinc-500 block leading-tight pt-1">
                    {dashboardOptimized ? '✓ Optimized license provisioning' : '⚠ Significant waste on redundant seats'}
                  </span>
                </div>

                <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Current AI Tool Bill</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-extrabold text-2xl text-zinc-200">
                      {dashboardOptimized ? '$620' : '$1,440'}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-bold">/ month</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 block leading-tight">
                    {dashboardOptimized ? 'Reallocated to reserves' : 'Sustaining license overlaps'}
                  </span>
                </div>
              </div>

              {/* Right Column recommendations */}
              <div className="md:col-span-3 space-y-3">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Identified Inefficiencies</span>
                
                <div className="space-y-2">
                  {/* Item 1 */}
                  <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <h4 className="text-[11px] font-bold text-zinc-200">ChatGPT Team minimum overspend</h4>
                      <p className="text-[9px] text-zinc-500">Startup has 1 user billed on a strict 2-seat minimum plan tier.</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold block ${dashboardOptimized ? 'text-zinc-500 line-through' : 'text-rose-400'}`}>$60/mo</span>
                      <span className="text-[9px] text-emerald-400 font-semibold block">{dashboardOptimized ? 'Saves $30/mo' : 'Overpaying'}</span>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <h4 className="text-[11px] font-bold text-zinc-200">Redundant GitHub Copilot seats</h4>
                      <p className="text-[9px] text-zinc-500">Developers already converted to Cursor IDE with native completions.</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold block ${dashboardOptimized ? 'text-zinc-500 line-through' : 'text-rose-400'}`}>$200/mo</span>
                      <span className="text-[9px] text-emerald-400 font-semibold block">{dashboardOptimized ? 'Saves $200/mo' : 'Redundant'}</span>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <h4 className="text-[11px] font-bold text-zinc-200">Claude Team seat sprawl</h4>
                      <p className="text-[9px] text-zinc-500">Small group of 3 paying for Anthropic\'s 5-seat minimum plan.</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold block ${dashboardOptimized ? 'text-zinc-500 line-through' : 'text-rose-400'}`}>$150/mo</span>
                      <span className="text-[9px] text-emerald-400 font-semibold block">{dashboardOptimized ? 'Saves $90/mo' : 'Unused seats'}</span>
                    </div>
                  </div>
                </div>

                {dashboardOptimized && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-emerald-500/[0.04] border border-emerald-500/10 rounded-xl text-center text-[10px] text-emerald-400 font-semibold tracking-wide"
                  >
                    🎉 Optimization Complete: Reclaimed $320/month ($3,840/year) in capital runway!
                  </motion.div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </section>

      {/* Supported Tools Registry Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-12 border-t border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-sm">
        <h2 className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-8">
          Supported AI Stack Subscriptions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {supportedTools.map((t, idx) => {
            const logoConfig = TOOL_LOGOS[t.logoKey];
            return (
              <div 
                key={idx} 
                className="flex flex-col items-center justify-center p-4 border border-zinc-900 rounded-xl bg-zinc-900/10 text-center hover:border-zinc-800 transition duration-200 group cursor-default shadow-sm"
              >
                {/* Monochrome inline SVG logo with subtle hover branded transitions */}
                <div className="p-3 rounded-lg mb-2.5 bg-zinc-950 border border-zinc-900 flex items-center justify-center grayscale group-hover:grayscale-0 transition duration-300">
                  {logoConfig ? logoConfig.logo({ className: "w-5 h-5" }) : null}
                </div>
                <span className="font-semibold text-xs text-zinc-300 mb-0.5 tracking-tight group-hover:text-white transition">{t.name}</span>
                <span className="text-[9px] text-zinc-500 font-medium">{t.desc.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Benchmarking Comparison Section (FEATURE 2) */}
      {mounted && (
        <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 space-y-12">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-zinc-100 tracking-tight">
              Active Data <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Comparisons</span>
            </h2>
            <p className="text-zinc-400 text-xs md:text-sm">
              See how typical early-stage startup clusters allocate budgets per developer. Click different team stages to view active baseline variations.
            </p>
          </div>

          <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6 md:p-8 space-y-6 shadow-premium">
            {/* Benchmark Tab controls */}
            <div className="flex bg-zinc-950 p-1 border border-zinc-800 rounded-xl gap-1 max-w-md mx-auto">
              <button 
                onClick={() => setBenchmarkProfile('seed')}
                className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition ${benchmarkProfile === 'seed' ? 'bg-zinc-900 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Seed Stage Team
              </button>
              <button 
                onClick={() => setBenchmarkProfile('saas')}
                className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition ${benchmarkProfile === 'saas' ? 'bg-zinc-900 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Series-A SaaS
              </button>
              <button 
                onClick={() => setBenchmarkProfile('ai-first')}
                className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition ${benchmarkProfile === 'ai-first' ? 'bg-zinc-900 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                AI-First Tech
              </button>
            </div>

            {/* Benchmarking Comparative Details */}
            <div className="grid md:grid-cols-5 gap-6 items-center">
              {/* Descriptions (2/5) */}
              <div className="md:col-span-2 space-y-3">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Median Spends Summary</span>
                <h3 className="text-sm font-bold text-zinc-200">{currentBenchmark.label}</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed leading-4">
                  {currentBenchmark.desc}
                </p>
                <div className="border-t border-zinc-900 pt-3 flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Median Cost/Engineer:</span>
                  <strong className="text-zinc-100">${currentBenchmark.avg}/mo</strong>
                </div>
              </div>

              {/* Graphical Comparators (3/5) */}
              <div className="md:col-span-3 space-y-4 p-4 rounded-xl bg-zinc-950/40 border border-zinc-900">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold block">Typical Unaudited Spends vs Optimized Median</span>
                
                {/* Unaudited Developer Spend */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Average Startup Developer (Sprawl)</span>
                    <strong className="text-rose-400 font-bold">${currentBenchmark.userAvg}/mo</strong>
                  </div>
                  <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Optimized Baseline */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Optimized Baseline (OptiAI Target)</span>
                    <strong className="text-emerald-400 font-bold">${currentBenchmark.avg}/mo</strong>
                  </div>
                  <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.round((currentBenchmark.avg / currentBenchmark.userAvg) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-[9px] text-zinc-500 italic pt-1 border-t border-zinc-900 text-center">
                  Startup spend audits yield an average of **{Math.round((1 - currentBenchmark.avg / currentBenchmark.userAvg) * 100)}% cost reductions** per seat.
                </div>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* Founder Insights Preview Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 border-t border-zinc-900 space-y-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest block">Executive Intelligence</span>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-zinc-100 tracking-tight">
            Founder <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Consulting Insights</span>
          </h2>
          <p className="text-zinc-400 text-xs md:text-sm">
            Audits produce strategic cost observations mapped to actionable next steps to recover your capital runway.
          </p>
        </div>

        <div className="glass p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6 shadow-premium max-w-3xl mx-auto hover:border-zinc-800 transition duration-200">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3.5">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Active Audit Simulation Insights</span>
            <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-emerald-400/90 px-2 py-0.5 rounded-md font-bold uppercase ml-auto">
              Confidence: High
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start pt-2">
            <div className="md:col-span-1 space-y-1">
              <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest block">Observation Type</span>
              <h4 className="text-xs font-black text-white leading-snug">Shadow-IT Seat Sprawl</h4>
            </div>
            <div className="md:col-span-3 space-y-4">
              <div className="space-y-1">
                <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold block">Consultant Observation</span>
                <p className="text-[11px] text-zinc-300 leading-relaxed leading-4">
                  Multiple team leads purchased Claude Pro subscriptions using individual cards, failing to realize Claude Team plans are already active.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-900 pt-3">
                <div className="space-y-1">
                  <span className="text-[8px] text-rose-400 uppercase tracking-widest font-bold block">Runway Impact</span>
                  <p className="text-[10px] text-zinc-450 leading-normal font-medium">Sustaining $1,200/year in duplicate license waste.</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] text-emerald-400 uppercase tracking-widest font-bold block">Actionable Step</span>
                  <p className="text-[10px] text-zinc-450 leading-normal font-medium">Migrate all standalone users into your primary Claude Team organization.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-6 py-20 border-t border-zinc-900">
        <div className="text-center mb-12 space-y-2">
          <HelpCircle className="h-6 w-6 text-emerald-400 mx-auto" />
          <h2 className="font-display font-extrabold text-2xl text-zinc-100 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {faqItems.map((item, idx) => (
            <div key={idx} className="glass p-5 rounded-xl border border-zinc-900 flex flex-col justify-between hover:border-zinc-805 transition duration-200">
              <h3 className="font-bold text-xs sm:text-sm text-zinc-200 mb-2">
                {item.q}
              </h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed leading-5">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Call-to-Action CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20 text-center">
        <div className="glass p-10 md:p-14 rounded-2xl border border-zinc-900 relative overflow-hidden shadow-premium hover:border-zinc-800 transition duration-200">
          <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] rounded-full bg-emerald-500/[0.015] blur-[80px]" />
          
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-zinc-100 mb-2 tracking-tight">
            Ready to optimize your burn rate?
          </h2>
          <p className="text-zinc-400 text-xs max-w-md mx-auto mb-6">
            Run a completely free spend analysis in seconds and reclaim your engineering capital.
          </p>
          <Link 
            href="/audit" 
            className="inline-flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold px-6 py-3 rounded-lg text-xs shadow-sm hover:shadow-zinc-100/5 transition cursor-pointer"
          >
            <span>Run Free Audit Now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
