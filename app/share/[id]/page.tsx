'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  Legend, 
  PieChart, 
  Cell, 
  Pie,
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Lock,
  ArrowRight,
  Activity,
  Zap,
  TrendingDown,
  Clock,
  Download,
  Copy,
  FileText,
  Users,
  Award
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { AuditInput } from '@/lib/audit-engine';

// Helper component for count-up numbers
function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.abs(Math.floor(totalMiliseconds / end));
    const step = Math.max(1, Math.ceil(end / 60)); // 60fps roughly

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

// Markdown formatting helper
function formatMessageContent(text: string) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    let cleanLine = line;
    let isBullet = false;
    let isHeader = false;

    if (line.trim().startsWith('* ')) {
      cleanLine = line.trim().substring(2);
      isBullet = true;
    } else if (line.trim().startsWith('- ')) {
      cleanLine = line.trim().substring(2);
      isBullet = true;
    } else if (line.trim().startsWith('### ')) {
      cleanLine = line.trim().substring(4);
      isHeader = true;
    }

    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(cleanLine)) !== null) {
      if (match.index > lastIndex) {
        parts.push(cleanLine.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index} className="font-bold text-white">{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }
    if (lastIndex < cleanLine.length) {
      parts.push(cleanLine.substring(lastIndex));
    }

    const rendered = parts.length > 0 ? parts : cleanLine;

    if (isBullet) {
      return (
        <li key={idx} className="ml-4 list-disc text-slate-355 my-1 text-xs">
          {rendered}
        </li>
      );
    }
    if (isHeader) {
      return (
        <h4 key={idx} className="text-xs font-bold text-emerald-405 mt-4 mb-2 uppercase tracking-wide">
          {rendered}
        </h4>
      );
    }
    return (
      <p key={idx} className="my-2 min-h-[1em] text-xs text-slate-300 leading-relaxed">
        {rendered}
      </p>
    );
  });
}

// Types matching expanded engine
interface HealthCategoryScore {
  score: number;
  label: string;
  description: string;
}

interface HealthScoreData {
  overallScore: number;
  overallLabel: string;
  categories: {
    planEfficiency: HealthCategoryScore;
    toolRedundancy: HealthCategoryScore;
    collaborationEfficiency: HealthCategoryScore;
    apiCostEfficiency: HealthCategoryScore;
    stackComplexity: HealthCategoryScore;
  };
}

interface RedundantInsight {
  overlappingTools: string[];
  message: string;
  consolidationStrategy: string;
  potentialSavings: number;
}

interface CategoryAnalysisItem {
  category: string;
  currentSpend: number;
  recommendedSpend: number;
  savings: number;
  percent: number;
}

interface BenchmarkMetrics {
  spendPerDeveloper: number;
  industryAverage: number;
  percentile: number;
  comparisonPercentage: number;
  comparisonLabel: 'higher' | 'lower' | 'optimized';
  industryLabel: string;
}

interface PersonaAnalysis {
  archetype: string;
  tagline: string;
  maturityScore: number;
  observation: string;
  strategy: string;
}

interface RoadmapMilestone {
  id: string;
  stage: 'Immediate' | '30-Day' | '90-Day' | 'Enterprise';
  title: string;
  description: string;
  savings: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  complexity: 'Low' | 'Medium' | 'High';
  roi: string;
}

interface FounderInsight {
  title: string;
  observation: string;
  impact: string;
  actionableStep: string;
}

interface RecommendationExtended {
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
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: 'High' | 'Medium' | 'Situational';
  confidenceReason: string;
  effort: 'Low' | 'Medium' | 'High';
}

interface AuditRecordExtended {
  id: string;
  input_data: AuditInput;
  results_data: {
    totalCurrentSpend: number;
    totalRecommendedSpend: number;
    totalMonthlySavings: number;
    totalAnnualSavings: number;
    recommendations: RecommendationExtended[];
    showCredexCta: boolean;
    isWellOptimized: boolean;
    healthScore?: HealthScoreData;
    redundancies?: RedundantInsight[];
    categoriesSpend?: CategoryAnalysisItem[];
    benchmarks?: BenchmarkMetrics;
    persona?: PersonaAnalysis;
    roadmap?: RoadmapMilestone[];
    founderInsights?: FounderInsight[];
  };
  ai_summary: string;
  total_monthly_savings: number;
  total_annual_savings: number;
  created_at: string;
}

export default function PublicSharePage() {
  const params = useParams();
  const id = params.id as string;

  const [audit, setAudit] = useState<AuditRecordExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'charts' | 'redundancy' | 'roadmap' | 'breakdown' | 'insights'>('overview');
  const [benchmarkProfile, setBenchmarkProfile] = useState<'saas' | 'ai-first' | 'seed' | 'growth'>('saas');

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const scrollToSection = (sectionId: string, tabName: typeof activeTab) => {
    setActiveTab(tabName);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-slate-400">
        <div className="relative flex items-center justify-center h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin" />
          <Sparkles className="h-6 w-6 text-emerald-400 animate-pulse" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Retrieving Public Audit Profile...</span>
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
  const currentSpend = results_data.totalCurrentSpend;
  const optimizedSpend = results_data.totalRecommendedSpend;

  // Retrieve calculated custom metrics or set mock fallbacks
  const health = results_data.healthScore ?? {
    overallScore: 75,
    overallLabel: 'Moderate Overspend',
    categories: {
      planEfficiency: { score: 70, label: 'Moderate', description: 'Seat allocation optimizations.' },
      toolRedundancy: { score: 80, label: 'Optimized', description: 'Duplication filters.' },
      collaborationEfficiency: { score: 60, label: 'Wasteful', description: 'Enterprise plans sizing.' },
      apiCostEfficiency: { score: 90, label: 'Optimized', description: 'API prompt integrations.' },
      stackComplexity: { score: 80, label: 'Optimized', description: 'Tool counts limits.' }
    }
  };

  const redundanciesList = results_data.redundancies ?? [];
  const categoriesList = results_data.categoriesSpend ?? [];
  const persona = results_data.persona ?? {
    archetype: 'Tool-Sprawl Scaling Startup',
    tagline: 'Rapid tool adoption with redundant SaaS capability overlaps.',
    maturityScore: 68,
    observation: 'Your organization has quickly deployed several AI solutions, leading to cross-departmental shadow-billing.',
    strategy: 'Sunset standalone Copilot integrations and centralize core developer accounts.'
  };

  const roadmapList = results_data.roadmap ?? [];
  const founderInsightsList = results_data.founderInsights ?? [];

  // Benchmarking calculations
  const benchProfileData = {
    saas: { label: 'SaaS Startups', avg: 45 },
    'ai-first': { label: 'AI-First Tech Startups', avg: 85 },
    seed: { label: 'Seed-Stage Teams', avg: 30 },
    growth: { label: 'Growth-Stage Startups', avg: 60 }
  };
  const selectedBench = benchProfileData[benchmarkProfile];
  const userPerEngineerSpend = Math.round(currentSpend / (audit.input_data.teamSize || 1));
  const comparisonPercent = Math.round(Math.abs((userPerEngineerSpend - selectedBench.avg) / selectedBench.avg) * 100);
  const isUserHigher = userPerEngineerSpend > selectedBench.avg;

  const barChartData = [
    { name: 'Current Spend', amount: currentSpend },
    { name: 'Optimized Spend', amount: optimizedSpend }
  ];

  const pieChartData = categoriesList.map(c => ({
    name: c.category,
    value: c.currentSpend
  }));

  const COLORS = ['#10B981', '#06B6D4', '#6366F1', '#EC4899', '#F59E0B'];

  const timelineProjectionData = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    cumulativeSavings: savings * (i + 1)
  }));

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (health.overallScore / 100) * circumference;

  const scoreColorClass = health.overallScore >= 90 
    ? 'text-emerald-400' 
    : health.overallScore >= 70 
      ? 'text-amber-400' 
      : 'text-rose-400';

  return (
    <div className="relative overflow-hidden min-h-screen py-10 px-4 md:px-8 max-w-6xl mx-auto z-10 space-y-8 select-none">
      
      {/* Backdrops */}
      <div className="absolute top-[8%] left-[-15%] w-[450px] h-[450px] rounded-full bg-emerald-500/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[550px] h-[550px] rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none" />

      {/* STICKY MENU */}
      <div className="sticky top-4 z-50 w-full glass-header rounded-2xl border border-slate-800/80 p-2 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-2 overflow-x-auto print:hidden">
        <div className="flex items-center gap-2 pl-3">
          <Award className="h-4.5 w-4.5 text-emerald-400" />
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Public Share Audit: {id.substring(0, 8)}</span>
        </div>
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => scrollToSection('overview-sec', 'overview')}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${activeTab === 'overview' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-455 hover:text-slate-205'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => scrollToSection('health-sec', 'health')}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${activeTab === 'health' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-455 hover:text-slate-205'}`}
          >
            Health Score
          </button>
          <button 
            onClick={() => scrollToSection('charts-sec', 'charts')}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${activeTab === 'charts' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-455 hover:text-slate-205'}`}
          >
            Analytics
          </button>
          {redundanciesList.length > 0 && (
            <button 
              onClick={() => scrollToSection('redundancy-sec', 'redundancy')}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${activeTab === 'redundancy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-455 hover:text-slate-205'}`}
            >
              Redundancy
            </button>
          )}
          <button 
            onClick={() => scrollToSection('roadmap-sec', 'roadmap')}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${activeTab === 'roadmap' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-455 hover:text-slate-205'}`}
          >
            Roadmap
          </button>
          <button 
            onClick={() => scrollToSection('breakdown-sec', 'breakdown')}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${activeTab === 'breakdown' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-455 hover:text-slate-205'}`}
          >
            Per-Tool Breakdown
          </button>
          <button 
            onClick={() => scrollToSection('insights-sec', 'insights')}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${activeTab === 'insights' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-455 hover:text-slate-205'}`}
          >
            Founder Insights
          </button>
        </div>
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6 print:pb-2 print:border-slate-300">
        <div>
          <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 print:text-emerald-700">
            <Lock className="h-3.5 w-3.5" />
            Anonymous Public Report
          </span>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white mt-1.5 tracking-tight print:text-black">
            AI Spend Cost Savings Dashboard
          </h1>
        </div>
        <Link
          href="/audit"
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition whitespace-nowrap inline-block cursor-pointer print:hidden"
        >
          Run My Free Audit
        </Link>
      </div>

      {/* OVERVIEW CARDS */}
      <div id="overview-sec" className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
        <div className="glass p-5 rounded-2xl border-emerald-500/20 shadow-xl shadow-emerald-500/2 col-span-1 flex flex-col justify-between h-40 relative print:border-slate-300 print:bg-white print:shadow-none print:h-32">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block print:text-slate-600">Monthly Savings</span>
          <div>
            <span className="font-display font-black text-4xl text-emerald-400 block tracking-tight print:text-emerald-700">
              {formatCurrency(savings)}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block print:text-slate-600">Recurrent runway returned</span>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border-emerald-500/20 shadow-xl shadow-emerald-500/2 col-span-1 flex flex-col justify-between h-40 relative print:border-slate-300 print:bg-white print:shadow-none print:h-32">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block print:text-slate-600">Annual Return (ROI)</span>
          <div>
            <span className="font-display font-black text-4xl text-cyan-400 block tracking-tight print:text-cyan-700">
              {formatCurrency(annualSavings)}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block print:text-slate-600">Released back to reserves</span>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border-slate-800 shadow-xl col-span-1 flex flex-col justify-between h-40 print:border-slate-300 print:bg-white print:shadow-none print:h-32">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block print:text-slate-600">Cost Efficiency Ratio</span>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] print:text-slate-700">
              <span className="text-slate-450 font-medium">Current Spend:</span>
              <span className="text-slate-205 font-bold">{formatCurrency(currentSpend)}/mo</span>
            </div>
            <div className="flex items-center justify-between text-[10px] print:text-slate-700">
              <span className="text-emerald-400 font-medium print:text-emerald-700">Optimized Spend:</span>
              <span className="text-emerald-405 font-bold print:text-emerald-700">{formatCurrency(optimizedSpend)}/mo</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1 print:bg-slate-200">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.max(10, Math.min(100, (optimizedSpend / (currentSpend || 1)) * 100))}%` }} />
            </div>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border-slate-800 shadow-xl col-span-1 flex flex-col justify-between h-40 print:border-slate-300 print:bg-white print:shadow-none print:h-32">
          <span className="text-[10px] font-bold text-slate-405 uppercase tracking-widest block print:text-slate-600">SaaS Stack Profile</span>
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-white block truncate print:text-black">{persona.archetype}</span>
            <p className="text-[9px] text-slate-400 leading-normal line-clamp-2 print:text-slate-600">{persona.tagline}</p>
            <div className="flex items-center gap-1.5 mt-1 border-t border-slate-800/80 pt-1.5 print:border-slate-200">
              <Activity className="h-3 w-3 text-cyan-400" />
              <span className="text-[9px] font-bold text-slate-450">Maturity Index: <strong className="text-cyan-400">{persona.maturityScore}%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* AUDIT SCORE */}
      <div id="health-sec" className="glass p-6 rounded-3xl border border-slate-800/80 shadow-2xl print:border-slate-300 print:bg-white print:shadow-none">
        <h2 className="font-display font-extrabold text-lg text-white mb-6 flex items-center gap-2 print:text-black">
          <Activity className="h-5 w-5 text-emerald-400 print:text-emerald-700" />
          <span>AI Spend Health Audit Score</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
          <div className="lg:col-span-2 flex flex-col items-center justify-center border-r border-slate-800/80 pr-6 print:border-slate-200">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="absolute transform -rotate-90 w-full h-full">
                <circle cx="64" cy="64" r={radius} className="stroke-slate-850 print:stroke-slate-200" strokeWidth="8" fill="transparent" />
                <circle cx="64" cy="64" r={radius} className="stroke-emerald-400" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
              </svg>
              <div className="text-center z-10">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Health</span>
                <span className={`font-display font-black text-4xl ${scoreColorClass}`}>{health.overallScore}</span>
                <span className="text-[9px] font-bold text-slate-450">/ 100</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                health.overallScore >= 90 ? 'bg-emerald-500/10 text-emerald-400' : health.overallScore >= 70 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                <Zap className="h-3 w-3" />
                {health.overallLabel}
              </span>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/45 border border-slate-900 print:bg-slate-50 print:border-slate-200">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="print:text-slate-700">Plan Efficiency</span>
                  <span className="text-emerald-400 font-extrabold print:text-emerald-700">{health.categories.planEfficiency.score}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden print:bg-slate-200">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${health.categories.planEfficiency.score}%` }} />
                </div>
              </div>
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/45 border border-slate-900 print:bg-slate-50 print:border-slate-200">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="print:text-slate-700">Tool Redundancy</span>
                  <span className="text-emerald-400 font-extrabold print:text-emerald-700">{health.categories.toolRedundancy.score}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden print:bg-slate-200">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${health.categories.toolRedundancy.score}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS CHARTS */}
      <div id="charts-sec" className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1">
        <div className="glass p-5 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col justify-between print:border-slate-300 print:bg-white print:shadow-none">
          <div className="border-b border-slate-800 pb-3 mb-4 print:border-slate-200">
            <h3 className="font-display font-extrabold text-sm text-white flex items-center gap-1.5 print:text-black">
              <TrendingDown className="h-4 w-4 text-emerald-400 print:text-emerald-700" />
              <span>Spend Optimisation Analysis</span>
            </h3>
          </div>
          <div className="h-64 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <ChartTooltip contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="amount" fill="#10B981" radius={[8, 8, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 1 ? '#06b6d4' : '#10B981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 w-full bg-slate-900/50 rounded-xl animate-pulse" />
            )}
          </div>
        </div>

        <div className="glass p-5 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col justify-between print:border-slate-300 print:bg-white print:shadow-none">
          <div className="border-b border-slate-800 pb-3 mb-4 print:border-slate-200">
            <h3 className="font-display font-extrabold text-sm text-white flex items-center gap-1.5 print:text-black">
              <PieChart className="h-4 w-4 text-cyan-400 print:text-cyan-700" />
              <span>AI Spend Categorisation Breakdown</span>
            </h3>
          </div>
          <div className="h-64 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={8} wrapperStyle={{ fontSize: '9px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 w-full bg-slate-900/50 rounded-xl animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* REDUNDANCIES */}
      {redundanciesList.length > 0 && (
        <div id="redundancy-sec" className="glass p-6 rounded-3xl border border-rose-500/20 shadow-2xl print:border-slate-300 print:bg-white print:shadow-none">
          <h2 className="font-display font-extrabold text-base sm:text-lg text-white mb-4 flex items-center gap-2 print:text-black">
            <AlertCircle className="h-5 w-5 text-rose-400 print:text-rose-700" />
            <span>High-Risk Redundant AI stack Overlaps Detected</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {redundanciesList.map((red, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950/45 border border-slate-900 flex flex-col justify-between print:bg-slate-50 print:border-slate-200">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {red.overlappingTools.map((t, i) => (
                      <span key={i} className="text-[10px] bg-rose-500/10 text-rose-450 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{t}</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-350">{red.message}</p>
                  <p className="text-[10px] text-emerald-400 font-bold">{red.consolidationStrategy}</p>
                </div>
                <div className="border-t border-slate-900 mt-4 pt-3 flex items-center justify-between text-xs print:border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expected Savings:</span>
                  <strong className="text-rose-400 font-black">{formatCurrency(red.potentialSavings)}/mo</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TIMELINE ROADMAP & BENCHMARKING */}
      <div id="roadmap-sec" className="grid grid-cols-1 lg:grid-cols-5 gap-6 print:grid-cols-1">
        <div className="glass p-6 rounded-3xl border border-slate-800/80 shadow-2xl lg:col-span-3 flex flex-col justify-between print:border-slate-300 print:bg-white print:shadow-none print:col-span-1">
          <div className="space-y-4">
            <h3 className="font-display font-extrabold text-base text-white flex items-center gap-2 print:text-black">
              <Users className="h-5 w-5 text-cyan-400 print:text-cyan-700" />
              <span>Benchmark Comparison Tool</span>
            </h3>
            <div className="p-4 rounded-2xl bg-slate-950/45 border border-slate-900 space-y-4 print:bg-slate-50 print:border-slate-200">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-450 font-bold">Your AI Cost / Developer:</span>
                <strong className="text-white font-black">{formatCurrency(userPerEngineerSpend)}/mo</strong>
              </div>
              <p className="text-xs text-slate-300">
                Your AI spend is comparable to peer teams in the <strong className="text-white">{selectedBench.label}</strong> cluster. You are in the <strong className="text-emerald-400">{results_data.benchmarks?.percentile ?? 50}th percentile</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-slate-800/80 shadow-2xl lg:col-span-2 flex flex-col justify-between print:border-slate-300 print:bg-white print:shadow-none print:col-span-1">
          <h3 className="font-display font-extrabold text-base text-white flex items-center gap-2 print:text-black">
            <Clock className="h-5 w-5 text-emerald-400 print:text-emerald-700" />
            <span>SaaS Savings Roadmap</span>
          </h3>
          <div className="relative border-l border-slate-855 pl-4 ml-2.5 py-1 space-y-4 print:border-slate-200">
            {roadmapList.map((ms, index) => (
              <div key={index} className="relative space-y-1">
                <div className="absolute left-[-22px] top-1.5 h-3.5 w-3.5 rounded-full bg-slate-950 border-2 border-emerald-400" />
                <h4 className="text-[11px] font-bold text-white tracking-tight">{ms.title}</h4>
                <p className="text-[9px] text-slate-455 leading-relaxed">{ms.description}</p>
                <span className="text-[9px] text-emerald-450 font-bold block">Saves {formatCurrency(ms.savings)}/mo</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DETAILED PER-TOOL BREAKDOWN */}
      <div id="breakdown-sec" className="space-y-4">
        <h2 className="font-display font-extrabold text-lg text-white print:text-black">Cost Optimization Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results_data.recommendations.map((rec, idx) => {
            const hasSavings = rec.monthlySavings > 0;
            return (
              <div key={idx} className={`p-5 rounded-2xl border ${hasSavings ? 'border-emerald-500/20 bg-slate-950/20' : 'border-slate-800 bg-slate-950/40'} print:border-slate-305 print:bg-white`}>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h3 className="font-display font-extrabold text-sm text-white print:text-black">{rec.toolName}</h3>
                  <span className={`text-[8px] px-2 py-0.5 rounded-md font-semibold ${hasSavings ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-850 text-slate-500'}`}>
                    {hasSavings ? 'Optimization Found' : 'Optimal Plan'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">{rec.reason}</p>
                <div className="grid grid-cols-4 gap-2 border-t border-slate-900 pt-3 text-[10px] print:border-slate-200">
                  <div>
                    <span className="text-[8px] text-slate-500 block uppercase">Original</span>
                    <span className="text-slate-300 font-bold print:text-black">{rec.currentPlan} ({rec.currentSeats})</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 block">Spend</span>
                    <span className="text-slate-300 font-bold print:text-black">{formatCurrency(rec.currentSpend)}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 block">Rec. Plan</span>
                    <span className={`font-bold ${hasSavings ? 'text-emerald-400' : 'text-slate-300'}`}>{rec.recommendedPlan}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 block">Rec. Spend</span>
                    <span className="text-slate-300 font-bold print:text-black">{formatCurrency(rec.recommendedSpend)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOUNDER INSIGHTS */}
      <div id="insights-sec" className="glass p-6 rounded-3xl border border-slate-800/80 shadow-2xl print:border-slate-300 print:bg-white">
        <h2 className="font-display font-extrabold text-base sm:text-lg text-white mb-6 flex items-center gap-2 print:text-black">
          <Sparkles className="h-5 w-5 text-cyan-400 print:text-cyan-700" />
          <span>Strategic Founder Consultant Insights</span>
        </h2>
        <div className="space-y-6">
          {founderInsightsList.map((ins, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-slate-900 pb-5 last:border-b-0 print:border-slate-200">
              <h4 className="text-xs font-black text-white md:col-span-1 print:text-black">{ins.title}</h4>
              <div className="md:col-span-3 space-y-2">
                <p className="text-[11px] text-slate-300 leading-relaxed">{ins.observation}</p>
                <p className="text-[10px] text-slate-450">Action: <strong className="text-emerald-400">{ins.actionableStep}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CALL TO ACTION */}
      <div className="glass p-8 rounded-3xl border border-emerald-500/20 text-center space-y-4 print:hidden">
        <h2 className="font-display font-extrabold text-xl text-white">How optimized is your startup’s AI tool spend?</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Stop duplicate seat subscription billing and plan tier sizing waste. Run a rapid financial audit in seconds.
        </p>
        <div>
          <Link href="/audit" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition text-xs cursor-pointer">
            <span>Run Free Audit Now</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
