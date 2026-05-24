'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { OptiAiLogo } from '@/components/BrandLogos';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft,
  Loader2,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { loginWithGoogle, user } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setSigningIn(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      setError('Failed to securely establish Google OAuth session.');
      setSigningIn(false);
    }
  };

  // Score circular properties for preview
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (82 / 100) * circumference;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row relative overflow-hidden select-none">
      
      {/* Background Calm Gradients */}
      <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/[0.015] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-cyan-500/[0.015] blur-[150px] pointer-events-none" />

      {/* Left side: Premium positioning & interactive previews (3/5 width on lg) */}
      <div className="lg:w-3/5 p-8 sm:p-12 lg:p-20 flex flex-col justify-between relative border-r border-zinc-900/60 bg-zinc-950/40 backdrop-blur-sm z-10 space-y-12 lg:space-y-0">
        
        {/* Top Header Back Button */}
        <div>
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition group font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition" />
            <span>Back to Homepage</span>
          </Link>
        </div>

        {/* Content & Previews */}
        <div className="max-w-xl space-y-10">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-850 rounded-full text-[10px] font-bold text-zinc-400"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Capital Runway Optimization</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-extrabold text-3xl sm:text-5xl text-zinc-100 tracking-tight leading-[1.1]"
            >
              Optimize Your <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">AI Spend</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs sm:text-sm text-zinc-400 leading-relaxed"
            >
              Understand where your startup is overspending on AI tools across Cursor, Claude, ChatGPT, Copilot, Gemini, and more. No billing accounts required.
            </motion.p>
          </div>

          {/* Interactive Preview Widget Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="p-5 bg-zinc-900/10 border border-zinc-900 rounded-2xl grid sm:grid-cols-2 gap-5 shadow-premium"
          >
            {/* Health Score Mini Widget */}
            <div className="flex items-center gap-4 bg-zinc-950/40 border border-zinc-900/80 p-3.5 rounded-xl">
              <div className="relative h-14 w-14 flex items-center justify-center shrink-0">
                <svg className="absolute transform -rotate-90 w-full h-full">
                  <circle cx="28" cy="28" r={radius} className="stroke-zinc-800" strokeWidth="4.5" fill="transparent" />
                  <circle 
                    cx="28" 
                    cy="28" 
                    r={radius} 
                    className="stroke-emerald-400" 
                    strokeWidth="4.5" 
                    fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <span className="font-display font-extrabold text-sm text-zinc-150 z-10">82%</span>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Spend Health</h3>
                <span className="text-xs font-bold text-zinc-200">Highly Optimized</span>
                <span className="text-[9px] text-zinc-500 block leading-tight">Post-audit configuration</span>
              </div>
            </div>

            {/* Benchmarking Mini Widget */}
            <div className="flex flex-col justify-between bg-zinc-950/40 border border-zinc-900/80 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                <span>Monthly AI Cost/Dev</span>
                <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-zinc-300">
                  <span className="text-zinc-500">Benchmark Avg:</span>
                  <span className="font-bold">$55</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-emerald-400">
                  <span className="font-semibold">Your Target:</span>
                  <span className="font-black">$38</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer info links */}
        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>OptiAI standard guest data is anonymized. Authentication unlocks saved audits history.</span>
        </div>

      </div>

      {/* Right side: Login Auth Card (2/5 width on lg) */}
      <div className="lg:w-2/5 p-8 flex items-center justify-center relative bg-zinc-950 z-10">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-zinc-900/40 border border-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl w-full max-w-sm shadow-premium space-y-8 flex flex-col justify-between"
        >
          {/* Brand header */}
          <div className="text-center space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <OptiAiLogo className="h-6 w-12" />
              <span className="font-display font-extrabold text-xl tracking-tight text-white flex items-center">
                Opti<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent ml-0.5 font-bold">AI</span>
              </span>
            </Link>
            <div className="space-y-1 pt-2">
              <h2 className="font-display font-extrabold text-lg text-zinc-150">Welcome back</h2>
              <p className="text-[11px] text-zinc-500 leading-normal max-w-[240px] mx-auto">
                Sign in to securely access saved audits, persistent benchmark histories, and export reports.
              </p>
            </div>
          </div>

          {/* Social Sign-in Trigger */}
          <div className="space-y-3">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl text-[10px] text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={signingIn}
              className="w-full inline-flex items-center justify-center gap-3 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-200 hover:text-white px-4 py-3 rounded-xl text-xs font-semibold shadow-inner hover:shadow-zinc-900/40 transition cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed group h-[48px]"
            >
              {signingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                  <span>Securely signing in...</span>
                </>
              ) : (
                <>
                  {/* Google SVG Emblem */}
                  <svg className="h-4 w-4 shrink-0 group-hover:scale-105 transition" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Footnotes legal */}
          <div className="text-center">
            <span className="text-[9px] text-zinc-550 leading-normal max-w-[200px] block mx-auto">
              By standardizing credentials, you consent to our security terms and anonymized audit cache routing policies.
            </span>
          </div>

        </motion.div>

      </div>

    </div>
  );
}
