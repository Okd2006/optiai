'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  Share2, 
  Mail, 
  Building, 
  Users, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Lock,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Send,
  Bot,
  Activity,
  Award,
  Zap,
  TrendingDown,
  Clock,
  Download,
  Copy,
  FileText,
  HelpCircle,
  Code,
  DollarSign
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
        <li key={idx} className="ml-4 list-disc text-slate-350 my-1 text-xs">
          {rendered}
        </li>
      );
    }
    if (isHeader) {
      return (
        <h4 key={idx} className="text-xs font-bold text-emerald-400 mt-4 mb-2 uppercase tracking-wide">
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

interface ParsedSummary {
  execSummary: string;
  biggestLeak: string;
  strategy: string;
  actionPlan: string;
  special?: string;
}

function parseAuditSummary(text: string): ParsedSummary {
  if (!text) {
    return { execSummary: '', biggestLeak: '', strategy: '', actionPlan: '' };
  }

  // Strip all title headers like ### AI Spend Audit Summary
  const cleanText = text.replace(/###\s*(AI Spend Audit Summary|AI Spend Summary|Spend Audit Summary|Summary)/gi, '').trim();

  // Match fields robustly supporting both markdown-rich and standard headers
  const biggestLeakMatch = cleanText.match(/(?:-\s*|\*\s*|\•\s*)?(?:\*\*Biggest Leak:\*\*|Biggest Leak:)\s*([\s\S]*?)(?=(?:-\s*|\*\s*|\•\s*)?(?:\*\*Strategy:\*\*|Strategy:)|$)/i);
  const strategyMatch = cleanText.match(/(?:-\s*|\*\s*|\•\s*)?(?:\*\*Strategy:\*\*|Strategy:)\s*([\s\S]*?)(?=(?:-\s*|\*\s*|\•\s*)?(?:\*\*Action Plan:\*\*|Action Plan:)|$)/i);
  const actionPlanMatch = cleanText.match(/(?:-\s*|\*\s*|\•\s*)?(?:\*\*Action Plan:\*\*|Action Plan:)\s*([\s\S]*?)(?=(?:-\s*|\*\s*|\•\s*)?(?:\*\*Special Recommendation:\*\*|Special Recommendation:)|$)/i);
  const specialMatch = cleanText.match(/(?:-\s*|\*\s*|\•\s*)?(?:\*\*Special Recommendation:\*\*|Special Recommendation:)\s*([\s\S]*?)$/i);

  const cleanField = (val: string) => {
    if (!val) return '';
    return val
      .replace(/^[-\*\s\•\t]+/, '') // Strip leading bullet characters
      .replace(/\*\*/g, '')          // Strip all double asterisks (bold markdown)
      .replace(/\*/g, '')           // Strip single asterisks (italics)
      .replace(/^[:\s]+/, '')       // Strip leading colons and spaces
      .trim();
  };

  // Find where the first bullet section starts
  let firstKeyIndex = cleanText.search(/(?:-\s*|\*\s*|\•\s*)?(?:\*\*Biggest Leak:\*\*|Biggest Leak:)/i);
  if (firstKeyIndex === -1) {
    firstKeyIndex = cleanText.search(/(?:-\s*|\*\s*|\•\s*)?(?:\*\*Strategy:\*\*|Strategy:)/i);
  }
  if (firstKeyIndex === -1) {
    firstKeyIndex = cleanText.search(/(?:-\s*|\*\s*|\•\s*)?(?:\*\*Action Plan:\*\*|Action Plan:)/i);
  }

  const execSummary = firstKeyIndex > -1 
    ? cleanField(cleanText.substring(0, firstKeyIndex))
    : cleanField(cleanText);

  return {
    execSummary,
    biggestLeak: biggestLeakMatch ? cleanField(biggestLeakMatch[1]) : '',
    strategy: strategyMatch ? cleanField(strategyMatch[1]) : '',
    actionPlan: actionPlanMatch ? cleanField(actionPlanMatch[1]) : '',
    special: specialMatch ? cleanField(specialMatch[1]) : '',
  };
}

// Interfaces identical to audit-engine upgraded structure
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
    
    // Extends
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

export default function ResultsPage() {
  const params = useParams();
  const id = params.id as string;

  const [audit, setAudit] = useState<AuditRecordExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mount check for Recharts SSR
  const [isMounted, setIsMounted] = useState(false);

  // Lead Form state
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [leadTeamSize, setLeadTeamSize] = useState('');
  const [honeypot, setHoneypot] = useState('');
  
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  const [shareCopied, setShareCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'charts' | 'redundancy' | 'roadmap' | 'breakdown' | 'insights'>('overview');

  // Spend Copilot Chat State
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Interactive Benchmarking Category State
  const [benchmarkProfile, setBenchmarkProfile] = useState<'saas' | 'ai-first' | 'seed' | 'growth'>('saas');
  const [timeElapsed, setTimeElapsed] = useState('Just now');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!audit?.created_at) return;
    const updateElapsed = () => {
      const diffMs = Date.now() - new Date(audit.created_at).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) {
        setTimeElapsed('Just now');
      } else if (diffMins === 1) {
        setTimeElapsed('1 minute ago');
      } else {
        setTimeElapsed(`${diffMins} minutes ago`);
      }
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 30000);
    return () => clearInterval(interval);
  }, [audit?.created_at]);

  useEffect(() => {
    if (!audit) return;
    const savingsFormatted = formatCurrency(audit.results_data.totalMonthlySavings);
    setMessages([
      {
        role: 'assistant',
        content: `Hi! I am the **Spend Copilot** 🤖.\n\nI have calculated your AI Spend Health Score at **${audit.results_data.healthScore?.overallScore ?? 75}/100** and identified **${savingsFormatted}/mo** in total recurrent savings. \n\nAsk me how to implement semantic context caching, negotiate enterprise licenses, or get Credex credits!`
      }
    ]);
  }, [audit]);

  useEffect(() => {
    if (messages.length > 1 && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Fetch Audit Data
  useEffect(() => {
    if (!id) return;

    const fetchAudit = async () => {
      try {
        const response = await fetch(`/api/audit?id=${id}`);
        if (!response.ok) {
          throw new Error('Audit report not found or system was restarted.');
        }
        const data = await response.json();
        setAudit(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load audit calculations.');
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [id]);

  useEffect(() => {
    if (audit) {
      window.scrollTo(0, 0);
    }
  }, [audit]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || chatInput;
    if (!messageText.trim() || chatLoading) return;

    if (!textToSend) {
      setChatInput('');
    }

    const newMessages = [...messages, { role: 'user' as const, content: messageText }];
    setMessages(newMessages);
    setChatLoading(true);
    setChatError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: newMessages,
          auditId: id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reach Copilot. Please try again.');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err: unknown) {
      setChatError(err instanceof Error ? err.message : 'Connection to Copilot timed out.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadLoading(true);
    setLeadError(null);

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          auditId: id,
          email,
          companyName,
          role,
          teamSize: leadTeamSize ? parseInt(leadTeamSize, 10) : undefined,
          honeypot
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to record lead info.');
      }

      setLeadSubmitted(true);
    } catch (err: unknown) {
      setLeadError(err instanceof Error ? err.message : 'Failed to submit form.');
    } finally {
      setLeadLoading(false);
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  // Download high-fidelity vector SVG share card
  const downloadSnapshot = () => {
    if (!snapshotRef.current) return;
    const svgContent = new XMLSerializer().serializeToString(snapshotRef.current);
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `optiai_savings_snapshot_${id.substring(0, 8)}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Active navigation anchor click helper
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
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Compiling Spend Health Matrix...</span>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass border-rose-500/20 text-center rounded-2xl space-y-6">
        <AlertCircle className="h-12 w-12 text-rose-400 mx-auto" />
        <h2 className="font-display font-bold text-xl text-white">Error Loading Report</h2>
        <p className="text-slate-400 text-sm">{error || 'The audit identifier is invalid or does not exist.'}</p>
        <Link 
          href="/audit" 
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-sm shadow-md transition"
        >
          Run New Audit
        </Link>
      </div>
    );
  }

  const { results_data, ai_summary } = audit;

  const parsedSummary = parseAuditSummary(ai_summary);
  const isParsedValid = !!(parsedSummary.execSummary && (parsedSummary.biggestLeak || parsedSummary.strategy || parsedSummary.actionPlan));

  const getActionPlanBullets = (actionPlanText: string): string[] => {
    if (!actionPlanText) return [];
    return actionPlanText
      .split(/(?:\.|\;|\band\b|\,)\s+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 4)
      .map(sentence => {
        let s = sentence.replace(/^[-\*\s\•]+/, '').trim();
        if (s.toLowerCase().startsWith('and ')) {
          s = s.substring(4).trim();
        }
        s = s.replace(/\.$/, '');
        if (s) {
          s = s.charAt(0).toUpperCase() + s.slice(1);
        }
        return s;
      })
      .filter(Boolean);
  };

  const actionPlanBullets = getActionPlanBullets(parsedSummary.actionPlan);

  const topSavingsRec = results_data?.recommendations
    ?.filter((r: RecommendationExtended) => r.monthlySavings > 0)
    ?.sort((a: RecommendationExtended, b: RecommendationExtended) => b.monthlySavings - a.monthlySavings)[0];
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
  
  // Custom Dynamic Archetype
  const persona = results_data.persona ?? {
    archetype: 'Tool-Sprawl Scaling Startup',
    tagline: 'Rapid tool adoption with redundant SaaS capability overlaps.',
    maturityScore: 68,
    observation: 'Your organization has quickly deployed several AI solutions, leading to cross-departmental shadow-billing.',
    strategy: 'Sunset standalone Copilot integrations and centralize core developer accounts.'
  };

  // Staged Roadmap timeline
  const roadmapList = results_data.roadmap ?? [];
  const founderInsightsList = results_data.founderInsights ?? [];

  // Interactive Benchmarking data calculations
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

  // Recharts Data Sets
  const barChartData = [
    { name: 'Current Spend', amount: currentSpend },
    { name: 'Optimized Spend', amount: optimizedSpend }
  ];

  const savingsBreakdownData = results_data.recommendations
    .filter(r => r.monthlySavings > 0)
    .map(r => ({ name: r.toolName, value: r.monthlySavings }));

  const pieChartData = categoriesList.map(c => ({
    name: c.category,
    value: c.currentSpend
  }));

  const COLORS = ['#10B981', '#06B6D4', '#6366F1', '#EC4899', '#F59E0B'];

  const timelineProjectionData = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    cumulativeSavings: savings * (i + 1)
  }));

  // Score circular properties
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
      
      {/* Dynamic Luminous Backdrop Aura */}
      <div className="absolute top-[8%] left-[-15%] w-[450px] h-[450px] rounded-full bg-emerald-500/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[550px] h-[550px] rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none" />

      {/* STICKY REPORT NAVIGATION MENU */}
      <div className="sticky top-4 z-50 w-full glass-header rounded-2xl border border-slate-800/80 p-2 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-2 overflow-x-auto print:hidden">
        <div className="flex items-center gap-2 pl-3">
          <Award className="h-4.5 w-4.5 text-emerald-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit ID: {id.substring(0, 8)}</span>
        </div>
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => scrollToSection('overview-sec', 'overview')}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${activeTab === 'overview' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-450 hover:text-slate-200'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => scrollToSection('health-sec', 'health')}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${activeTab === 'health' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-450 hover:text-slate-200'}`}
          >
            Health Score
          </button>
          <button 
            onClick={() => scrollToSection('charts-sec', 'charts')}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${activeTab === 'charts' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-450 hover:text-slate-200'}`}
          >
            Analytics
          </button>
          {redundanciesList.length > 0 && (
            <button 
              onClick={() => scrollToSection('redundancy-sec', 'redundancy')}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${activeTab === 'redundancy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-450 hover:text-slate-200'}`}
            >
              Redundancy
            </button>
          )}
          <button 
            onClick={() => scrollToSection('roadmap-sec', 'roadmap')}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${activeTab === 'roadmap' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-450 hover:text-slate-200'}`}
          >
            Roadmap
          </button>
          <button 
            onClick={() => scrollToSection('breakdown-sec', 'breakdown')}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${activeTab === 'breakdown' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-450 hover:text-slate-200'}`}
          >
            Per-Tool Breakdown
          </button>
          <button 
            onClick={() => scrollToSection('insights-sec', 'insights')}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${activeTab === 'insights' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-450 hover:text-slate-200'}`}
          >
            Founder Insights
          </button>
        </div>
      </div>

      {/* HEADER: TITLE & EXPORTS */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6 print:pb-2 print:border-slate-300"
      >
        <div>
          <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 print:text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            OptiAI Premium Business Intelligence Matrix
          </span>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white mt-1.5 tracking-tight print:text-black">
            AI Spend Optimization Report
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2.5 print:hidden">
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              <Clock className="h-3 w-3 text-slate-650" />
              Generated {timeElapsed}
            </span>
            <span className="text-slate-800 text-[9px] hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              <Activity className="h-3 w-3 text-slate-650" />
              Benchmark updated: May 2026
            </span>
            <span className="text-slate-800 text-[9px] hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md text-[8.5px] font-bold uppercase tracking-wider">
              Confidence: High
            </span>
            <span className="inline-flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-md text-[8.5px] font-bold uppercase tracking-wider">
              Status: Verified
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-305 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>Export Executive PDF</span>
          </button>
          <button
            onClick={copyShareLink}
            className="inline-flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-305 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            {shareCopied ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">Share Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                <span>Copy Share Link</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* SECTION 1: OVERVIEW CARD GRID */}
      <div id="overview-sec" className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
        
        {/* Monthly Savings */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="glass p-5 rounded-2xl border-emerald-500/20 shadow-xl shadow-emerald-500/2 col-span-1 flex flex-col justify-between h-40 relative overflow-hidden print:border-slate-300 print:bg-white print:shadow-none print:h-32"
        >
          <div className="absolute top-[-10%] right-[-10%] w-[100px] h-[100px] rounded-full bg-emerald-500/5 blur-[30px] pointer-events-none" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block print:text-slate-600">Monthly Savings</span>
          <div>
            <span className="font-display font-black text-4xl text-emerald-400 block tracking-tight print:text-emerald-700">
              {formatCurrency(savings)}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block print:text-slate-600">Recurrent runway returned</span>
          </div>
        </motion.div>

        {/* Annual Savings (ROI IMPACT CALCULATOR - FEATURE 7) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass p-5 rounded-2xl border-emerald-500/20 shadow-xl shadow-emerald-500/2 col-span-1 flex flex-col justify-between h-40 relative overflow-hidden print:border-slate-300 print:bg-white print:shadow-none print:h-32"
        >
          <div className="absolute top-[-10%] right-[-10%] w-[100px] h-[100px] rounded-full bg-cyan-500/5 blur-[30px] pointer-events-none" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block print:text-slate-600">Annual Return (ROI)</span>
          <div>
            <span className="font-display font-black text-4xl text-cyan-400 block tracking-tight print:text-cyan-700">
              {formatCurrency(annualSavings)}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block print:text-slate-600">Released back to reserves</span>
          </div>
        </motion.div>

        {/* Current vs Optimized Distribution */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="glass p-5 rounded-2xl border-slate-800 shadow-xl col-span-1 flex flex-col justify-between h-40 print:border-slate-300 print:bg-white print:shadow-none print:h-32"
        >
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
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
                style={{ width: `${Math.max(10, Math.min(100, (optimizedSpend / (currentSpend || 1)) * 100))}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Personalized AI Persona (FEATURE 10) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="glass p-5 rounded-2xl border-slate-800 shadow-xl col-span-1 flex flex-col justify-between h-40 print:border-slate-300 print:bg-white print:shadow-none print:h-32"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block print:text-slate-600">SaaS Stack Profile</span>
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-white block truncate print:text-black">
              {persona.archetype}
            </span>
            <p className="text-[9px] text-slate-400 leading-normal line-clamp-2 print:text-slate-600">
              {persona.tagline}
            </p>
            <div className="flex items-center gap-1.5 mt-1 border-t border-slate-800/80 pt-1.5 print:border-slate-200">
              <Activity className="h-3 w-3 text-cyan-400" />
              <span className="text-[9px] font-bold text-slate-450">Maturity Index: <strong className="text-cyan-400">{persona.maturityScore}%</strong></span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* 2. AI Summary & Spend Copilot Layout */}
      <div className="grid lg:grid-cols-5 gap-6 animate-fade-in print:hidden">
        {/* Left Column: Personalized AI Summary */}
        <div className="glass p-6 sm:p-8 rounded-3xl border border-slate-805 shadow-xl space-y-6 lg:col-span-3 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header and badges */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-850 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
                <h2 className="font-display font-extrabold text-base sm:text-lg text-white">
                  Executive Spend Summary
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-405 px-2 py-0.5 rounded-md text-[8.5px] font-bold uppercase tracking-wider">
                  Confidence: High
                </span>
                <span className="inline-flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-405 px-2 py-0.5 rounded-md text-[8.5px] font-bold uppercase tracking-wider">
                  Verified Insights
                </span>
              </div>
            </div>

            {isParsedValid ? (
              <div className="space-y-6">
                {/* 1. Executive Summary */}
                <div className="space-y-2 max-w-xl">
                  <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">
                    Executive Summary
                  </span>
                  <p className="text-slate-205 text-xs sm:text-sm leading-relaxed font-normal">
                    {parsedSummary.execSummary}
                  </p>
                </div>

                {/* 2. Largest Savings Opportunity & 3. Strategic Recommendation (2-column layout) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Largest Savings Opportunity */}
                  <div className="bg-slate-950/60 border border-slate-855 p-4.5 rounded-xl flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[8.5px] font-extrabold text-rose-405 uppercase tracking-widest block">
                        Largest Savings Opportunity
                      </span>
                      <span className="font-display font-extrabold text-sm text-white mt-1.5 block">
                        {topSavingsRec ? topSavingsRec.toolName : 'Stack Fully Optimized'}
                      </span>
                      <p className="text-[10px] text-slate-450 mt-1 leading-normal">
                        {topSavingsRec 
                          ? `Switching ${topSavingsRec.toolName} from ${topSavingsRec.currentPlan} plan.`
                          : 'All active subscriptions match active team size.'
                        }
                      </p>
                    </div>
                    <div className="border-t border-slate-850/60 pt-2 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Potential Savings</span>
                      <span className="text-xs font-black text-emerald-400">
                        {topSavingsRec ? `${formatCurrency(topSavingsRec.monthlySavings)}/mo` : '$0/mo'}
                      </span>
                    </div>
                  </div>

                  {/* Strategic Recommendation */}
                  <div className="bg-slate-950/60 border border-slate-855 p-4.5 rounded-xl flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[8.5px] font-extrabold text-cyan-405 uppercase tracking-widest block">
                        Strategic Recommendation
                      </span>
                      <p className="text-[10px] text-slate-300 mt-2 leading-relaxed">
                        {parsedSummary.strategy || 'Optimize redundant accounts and review software spend dynamically as requirements grow.'}
                      </p>
                    </div>
                    {parsedSummary.special && (
                      <div className="border-t border-slate-850/60 pt-2">
                        <p className="text-[9px] text-cyan-400/90 leading-snug">
                          💡 {parsedSummary.special}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Immediate Action Plan */}
                {actionPlanBullets.length > 0 && (
                  <div className="border border-emerald-500/10 bg-emerald-500/[0.02] p-4.5 rounded-xl space-y-3">
                    <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest block">
                      Immediate Action Plan
                    </span>
                    <ul className="space-y-2">
                      {actionPlanBullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              /* Dynamic elegant fallback: sanitizes any raw markdown markers and renders as nice text blocks */
              <div className="space-y-4 max-w-xl">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">
                  Analysis Insights
                </span>
                <div className="text-slate-350 text-xs sm:text-sm leading-relaxed space-y-3">
                  {ai_summary.split('\n\n').map((paragraph, idx) => {
                    const cleaned = paragraph
                      .replace(/###\s*(AI Spend Audit Summary|AI Spend Summary|Spend Audit Summary|Summary)/gi, '')
                      .replace(/\*\*/g, '')
                      .replace(/\*/g, '')
                      .replace(/^[-\*\s\•]+/gm, '')
                      .trim();
                    if (!cleaned) return null;
                    return (
                      <p key={idx} className="leading-relaxed">
                        {cleaned}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Metadata Footer */}
          <div className="border-t border-slate-850 pt-4 flex flex-wrap items-center justify-between text-[8.5px] font-bold text-slate-500 gap-2 mt-4">
            <span>Generated {timeElapsed}</span>
            <span>•</span>
            <span className="text-slate-500 uppercase">Pricing Database: May 2026 Sync</span>
          </div>
        </div>

        {/* Right Column: Spend Copilot Chatbox */}
        <div className="glass p-5 rounded-3xl border border-slate-805 shadow-xl lg:col-span-2 flex flex-col h-[400px] justify-between relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
            <Bot className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-display font-extrabold text-xs text-white">Spend Copilot</h3>
              <span className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider block">Interactive Advisor</span>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 scrollbar-thin scrollbar-thumb-slate-850 scrollbar-track-transparent">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed ${
                      isUser
                        ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-none'
                        : 'bg-slate-950 border border-slate-855 text-slate-350 rounded-bl-none'
                    }`}
                  >
                    {isUser ? msg.content : formatMessageContent(msg.content)}
                  </div>
                </div>
              );
            })}
            
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-950 border border-slate-855 rounded-2xl rounded-bl-none px-3.5 py-2.5 text-slate-450 flex items-center gap-2">
                  <div className="flex space-x-1 shrink-0">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[9px] tracking-wide">Copilot is analyzing...</span>
                </div>
              </div>
            )}
            
            {chatError && (
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl text-[9px] flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{chatError}</span>
              </div>
            )}
          </div>

          {/* Quick Suggestion Chips */}
          {messages.length === 1 && !chatLoading && (
            <div className="flex flex-wrap gap-1 mb-2">
              <button
                type="button"
                onClick={() => handleSendMessage('Why drop GitHub Copilot?')}
                className="bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-205 text-[9px] px-2 py-0.5 rounded-full transition cursor-pointer"
              >
                💡 Why drop Copilot?
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Should we standardise on Claude?')}
                className="bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-205 text-[9px] px-2 py-0.5 rounded-full transition cursor-pointer"
              >
                💬 Standardise on Claude?
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('How do we claim Credex credits?')}
                className="bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-205 text-[9px] px-2 py-0.5 rounded-full transition cursor-pointer"
              >
                🚀 Claim Credex Credits?
              </button>
            </div>
          )}

          {/* Chat Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2 border-t border-slate-855 pt-2.5 mt-0.5"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question or add context..."
              disabled={chatLoading}
              className="flex-1 bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-202 py-2 px-3 rounded-xl text-[11px] transition outline-none font-medium"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 p-2 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* SECTION 2: SPEND HEALTH SCORE (FEATURE 1) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        id="health-sec" 
        className="glass p-6 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden print:border-slate-300 print:bg-white print:shadow-none"
      >
        <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />
        <h2 className="font-display font-extrabold text-lg text-white mb-6 flex items-center gap-2 print:text-black">
          <Activity className="h-5 w-5 text-emerald-400 print:text-emerald-700" />
          <span>AI Spend Health Audit Score</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
          {/* Circular progress container */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center border-r border-slate-800/80 pr-6 print:border-slate-200">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="absolute transform -rotate-90 w-full h-full">
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="stroke-slate-850 print:stroke-slate-200"
                  strokeWidth="8"
                  fill="transparent"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="stroke-emerald-400"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="text-center z-10">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Health</span>
                <span className={`font-display font-black text-4xl ${scoreColorClass}`}>
                  <AnimatedCounter value={health.overallScore} />
                </span>
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
              <p className="text-[10px] text-slate-450 mt-1.5 max-w-[220px]">
                Proprietary waste, complexity, and duplicate plan allocation index.
              </p>
            </div>
          </div>

          {/* Sub-category list */}
          <div className="lg:col-span-3 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Plan Efficiency */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/45 border border-slate-900 print:bg-slate-50 print:border-slate-200">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="print:text-slate-700">Plan Efficiency</span>
                  <span className="text-emerald-400 font-extrabold print:text-emerald-700">{health.categories.planEfficiency.score}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden print:bg-slate-200">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${health.categories.planEfficiency.score}%` }} />
                </div>
                <span className="text-[9px] text-slate-500 block leading-tight">{health.categories.planEfficiency.description}</span>
              </div>

              {/* Tool Redundancy */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/45 border border-slate-900 print:bg-slate-50 print:border-slate-200">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="print:text-slate-700">Tool Redundancy</span>
                  <span className="text-emerald-400 font-extrabold print:text-emerald-700">{health.categories.toolRedundancy.score}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden print:bg-slate-200">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${health.categories.toolRedundancy.score}%` }} />
                </div>
                <span className="text-[9px] text-slate-500 block leading-tight">{health.categories.toolRedundancy.description}</span>
              </div>

              {/* Collaboration Efficiency */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/45 border border-slate-900 print:bg-slate-50 print:border-slate-200">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="print:text-slate-700">Collaboration settings</span>
                  <span className="text-emerald-400 font-extrabold print:text-emerald-700">{health.categories.collaborationEfficiency.score}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden print:bg-slate-200">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${health.categories.collaborationEfficiency.score}%` }} />
                </div>
                <span className="text-[9px] text-slate-500 block leading-tight">{health.categories.collaborationEfficiency.description}</span>
              </div>

              {/* API Cost Efficiency */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/45 border border-slate-900 print:bg-slate-50 print:border-slate-200">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="print:text-slate-700">API Cost Routing</span>
                  <span className="text-emerald-400 font-extrabold print:text-emerald-700">{health.categories.apiCostEfficiency.score}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden print:bg-slate-200">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${health.categories.apiCostEfficiency.score}%` }} />
                </div>
                <span className="text-[9px] text-slate-500 block leading-tight">{health.categories.apiCostEfficiency.description}</span>
              </div>

            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION 3: INTERACTIVE CHARTS VISUALIZATION (FEATURE 2 & 14) */}
      <div id="charts-sec" className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1">
        
        {/* Chart A: Current vs Optimized & 12 Month Projection */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass p-5 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col justify-between print:border-slate-300 print:bg-white print:shadow-none"
        >
          <div className="border-b border-slate-800 pb-3 mb-4 print:border-slate-200">
            <h3 className="font-display font-extrabold text-sm text-white flex items-center gap-1.5 print:text-black">
              <TrendingDown className="h-4 w-4 text-emerald-400 print:text-emerald-700" />
              <span>Spend Optimisation Analysis & 12-Mo Projections</span>
            </h3>
            <span className="text-[9px] text-slate-450 block uppercase tracking-wide">Direct savings ratio comparison</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <ChartTooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '10px' }} 
                    labelStyle={{ color: '#10b981', fontWeight: 'bold' }} 
                  />
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
        </motion.div>

        {/* Chart B: Category Spend & Savings Contribution */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass p-5 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col justify-between print:border-slate-300 print:bg-white print:shadow-none"
        >
          <div className="border-b border-slate-800 pb-3 mb-4 print:border-slate-200">
            <h3 className="font-display font-extrabold text-sm text-white flex items-center gap-1.5 print:text-black">
              <PieChart className="h-4 w-4 text-cyan-400 print:text-cyan-700" />
              <span>AI Spend Categorisation Breakdown</span>
            </h3>
            <span className="text-[9px] text-slate-450 block uppercase tracking-wide font-medium">Categorized by software capabilities</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center relative">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '10px' }} 
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '9px', color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 w-full bg-slate-900/50 rounded-xl animate-pulse" />
            )}
          </div>
        </motion.div>

        {/* 12-Month savings Area Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass p-5 rounded-3xl border border-slate-800/80 shadow-2xl col-span-1 lg:col-span-2 print:border-slate-300 print:bg-white print:shadow-none print:col-span-1"
        >
          <div className="border-b border-slate-800 pb-3 mb-4 print:border-slate-200">
            <h3 className="font-display font-extrabold text-sm text-white flex items-center gap-1.5 print:text-black">
              <Clock className="h-4 w-4 text-emerald-400 print:text-emerald-700" />
              <span>SaaS Savings Runway Projection (12 Months Cumulative)</span>
            </h3>
            <span className="text-[9px] text-slate-450 block uppercase tracking-wide">Cumulative capital returned to bank</span>
          </div>

          <div className="h-56 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineProjectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                  <ChartTooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '10px' }} 
                  />
                  <Area type="monotone" dataKey="cumulativeSavings" stroke="#10b981" fillOpacity={0.1} fill="url(#colorSavings)" strokeWidth={2} />
                  <defs>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 w-full bg-slate-900/50 rounded-xl animate-pulse" />
            )}
          </div>
        </motion.div>
      </div>

      {/* SECTION 4: REDUNDANT STACK DETECTION (FEATURE 3) */}
      {redundanciesList.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          id="redundancy-sec" 
          className="glass p-6 rounded-3xl border border-rose-500/20 shadow-2xl relative overflow-hidden print:border-slate-300 print:bg-white print:shadow-none"
        >
          <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] rounded-full bg-rose-500/5 blur-[80px] pointer-events-none" />
          
          <h2 className="font-display font-extrabold text-base sm:text-lg text-white mb-4 flex items-center gap-2 print:text-black">
            <AlertCircle className="h-5 w-5 text-rose-400 print:text-rose-700" />
            <span>High-Risk Redundant AI stack Overlaps Detected</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Multiple teams are maintaining independent software bills that completely replicate technical features. Clean standardisation yields immediate margin expansions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {redundanciesList.map((red, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950/45 border border-slate-900 flex flex-col justify-between print:bg-slate-50 print:border-slate-200">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {red.overlappingTools.map((t, i) => (
                      <span key={i} className="text-[10px] bg-rose-500/10 text-rose-450 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        {t}
                      </span>
                    ))}
                    <span className="text-[9px] font-black text-rose-500 ml-auto uppercase tracking-wide">Redundancy Leak</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed leading-5">
                    {red.message}
                  </p>
                  <div className="border-t border-slate-900 pt-3 space-y-1 print:border-slate-200">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Consolidation Strategy</span>
                    <p className="text-[10px] text-emerald-400 font-bold leading-normal">
                      {red.consolidationStrategy}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-900 mt-4 pt-3 flex items-center justify-between text-xs print:border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expected Savings:</span>
                  <strong className="text-rose-400 font-black font-display">{formatCurrency(red.potentialSavings)}/mo</strong>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* SECTION 5: ROADMAP TIMELINE & BENCHMARKING (FEATURE 4, 5, 8 & 12) */}
      <div id="roadmap-sec" className="grid grid-cols-1 lg:grid-cols-5 gap-6 print:grid-cols-1">
        
        {/* Left Column: Benchmark Mode Slider (3/5 width) */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass p-6 rounded-3xl border border-slate-800/80 shadow-2xl lg:col-span-3 flex flex-col justify-between print:border-slate-300 print:bg-white print:shadow-none print:col-span-1"
        >
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3 print:border-slate-200">
              <h3 className="font-display font-extrabold text-base text-white flex items-center gap-2 print:text-black">
                <Users className="h-5 w-5 text-cyan-400 print:text-cyan-700" />
                <span>Benchmark Comparison Tool</span>
              </h3>
              <span className="text-[9px] text-slate-450 block uppercase tracking-wide mt-1">Match metrics against custom startup clusters</span>
            </div>

            {/* Benchmark Tab Selector */}
            <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-900 gap-1 overflow-x-auto no-scrollbar print:hidden">
              <button 
                onClick={() => setBenchmarkProfile('saas')}
                className={`text-[9px] font-bold px-3 py-1.5 rounded-lg transition whitespace-nowrap ${benchmarkProfile === 'saas' ? 'bg-slate-900 border border-slate-800 text-white font-extrabold' : 'text-slate-500 hover:text-slate-350'}`}
              >
                SaaS Startup
              </button>
              <button 
                onClick={() => setBenchmarkProfile('ai-first')}
                className={`text-[9px] font-bold px-3 py-1.5 rounded-lg transition whitespace-nowrap ${benchmarkProfile === 'ai-first' ? 'bg-slate-900 border border-slate-800 text-white font-extrabold' : 'text-slate-500 hover:text-slate-350'}`}
              >
                AI-First Tech
              </button>
              <button 
                onClick={() => setBenchmarkProfile('seed')}
                className={`text-[9px] font-bold px-3 py-1.5 rounded-lg transition whitespace-nowrap ${benchmarkProfile === 'seed' ? 'bg-slate-900 border border-slate-800 text-white font-extrabold' : 'text-slate-500 hover:text-slate-350'}`}
              >
                Seed Stage
              </button>
              <button 
                onClick={() => setBenchmarkProfile('growth')}
                className={`text-[9px] font-bold px-3 py-1.5 rounded-lg transition whitespace-nowrap ${benchmarkProfile === 'growth' ? 'bg-slate-900 border border-slate-800 text-white font-extrabold' : 'text-slate-500 hover:text-slate-350'}`}
              >
                Growth Stage
              </button>
            </div>

            {/* Benchmark Comparative Visual Display */}
            <div className="p-4 rounded-2xl bg-slate-950/45 border border-slate-900 space-y-4 print:bg-slate-50 print:border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Profile Baseline</span>
                  <span className="text-xs font-extrabold text-white block">{selectedBench.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Median Spend/Eng</span>
                  <span className="text-xs font-bold text-slate-300 block">{formatCurrency(selectedBench.avg)}/mo</span>
                </div>
              </div>

              {/* Comparative Gauge */}
              <div className="space-y-2 pt-2 border-t border-slate-900 print:border-slate-200">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-450 font-bold">Your AI Cost / Developer:</span>
                  <strong className="text-white font-black">{formatCurrency(userPerEngineerSpend)}/mo</strong>
                </div>
                <div className="relative w-full h-3.5 bg-slate-900 rounded-full overflow-hidden print:bg-slate-200">
                  <div 
                    className="absolute h-full bg-emerald-500 rounded-full transition-all duration-700" 
                    style={{ width: `${Math.min(100, (userPerEngineerSpend / (selectedBench.avg * 2 || 1)) * 50)}%` }}
                  />
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-500 border-l border-slate-950"
                    style={{ left: '50%' }}
                  />
                </div>
                <div className="flex items-center justify-between text-[8px] text-slate-500 font-bold">
                  <span>$0</span>
                  <span>Average ({formatCurrency(selectedBench.avg)})</span>
                  <span>2x Average</span>
                </div>
              </div>

              {/* Percentile Ranking Statement */}
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[11px] leading-relaxed text-slate-300">
                {isUserHigher ? (
                  <span>
                    Your AI tool spend per engineer is <strong className="text-rose-400">{comparisonPercent}% higher</strong> than peer teams in the <strong className="text-white">{selectedBench.label}</strong> cluster. You are in the <strong className="text-rose-400">{results_data.benchmarks?.percentile ?? 75}th percentile</strong> of cost sprawl.
                  </span>
                ) : (
                  <span>
                    Your AI tool spend per engineer is <strong className="text-emerald-400">{comparisonPercent}% lower</strong> than peer teams in the <strong className="text-white">{selectedBench.label}</strong> cluster. Excellent structure, placing you in the highly optimized <strong className="text-emerald-400">{results_data.benchmarks?.percentile ?? 18}th percentile</strong>.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Industry recommendation Engine (FEATURE 8) */}
          <div className="mt-4 p-4 bg-slate-950/20 border border-slate-800 rounded-2xl flex items-center justify-between gap-4 print:bg-slate-50 print:border-slate-200">
            <div className="space-y-1 max-w-[280px]">
              <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest">Recommended Tech-Stack Integration</span>
              <h4 className="text-[11px] font-bold text-white">Consolidate on standard stack</h4>
              <p className="text-[9px] text-slate-450 leading-relaxed">
                Standardize your engineering setup on **Cursor Pro + Claude Pro + OpenAI API context caching**.
              </p>
            </div>
            <div className="shrink-0 bg-emerald-500/10 text-emerald-400 px-3 py-2 rounded-xl text-center border border-emerald-500/20">
              <span className="text-[8px] font-bold uppercase block tracking-widest text-slate-400">Popularity</span>
              <strong className="text-xs font-black">94%</strong>
            </div>
          </div>

        </motion.div>

        {/* Right Column: Timeline Roadmap (2/5 width) */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass p-6 rounded-3xl border border-slate-800/80 shadow-2xl lg:col-span-2 flex flex-col justify-between print:border-slate-300 print:bg-white print:shadow-none print:col-span-1"
        >
          <div className="border-b border-slate-800 pb-3 mb-4 print:border-slate-200">
            <h3 className="font-display font-extrabold text-base text-white flex items-center gap-2 print:text-black">
              <Clock className="h-5 w-5 text-emerald-400 print:text-emerald-700" />
              <span>Staged Cost Reduction Roadmap</span>
            </h3>
            <span className="text-[9px] text-slate-450 block uppercase tracking-wide mt-1">Phased implementation roadmap timeline</span>
          </div>

          {/* Interactive milestone timeline */}
          <div className="relative border-l border-slate-850 pl-4 ml-2.5 py-1 space-y-4 print:border-slate-200">
            {roadmapList.map((ms, index) => (
              <div key={index} className="relative space-y-1">
                {/* Node indicator */}
                <div className="absolute left-[-22px] top-1.5 h-3.5 w-3.5 rounded-full bg-slate-950 border-2 border-emerald-400 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
                
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[8px] font-black uppercase bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md">
                    {ms.stage}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold ml-auto print:text-emerald-750">
                    Saves {formatCurrency(ms.savings)}/mo
                  </span>
                </div>
                
                <h4 className="text-[11px] font-bold text-white tracking-tight">{ms.title}</h4>
                <p className="text-[9px] text-slate-450 leading-relaxed leading-3 line-clamp-2">
                  {ms.description}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[7px] text-slate-500 font-bold uppercase">ROI: {ms.roi}</span>
                  <span className="text-[7.5px] text-slate-500">•</span>
                  <span className="text-[7px] text-slate-500 font-bold uppercase">Effort: {ms.complexity}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* SECTION 6: DETAILED PER-TOOL BREAKDOWN (FEATURE 9 & 11) */}
      <div id="breakdown-sec" className="space-y-4">
        <h2 className="font-display font-extrabold text-lg text-white print:text-black">
          Detailed Per-Tool Cost Optimization Matrix
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results_data.recommendations.map((rec, idx) => {
            const hasSavings = rec.monthlySavings > 0;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                key={idx} 
                className={`p-5 rounded-2xl border ${hasSavings ? 'border-emerald-500/20 bg-slate-950/20 shadow-md shadow-emerald-500/2' : 'border-slate-800 bg-slate-950/40'} flex flex-col justify-between print:border-slate-305 print:bg-white print:shadow-none`}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-extrabold text-sm text-white print:text-black">{rec.toolName}</h3>
                    <span className={`text-[8px] px-2 py-0.5 rounded-md font-semibold ${hasSavings ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-850 text-slate-500 border border-slate-800'}`}>
                      {hasSavings ? 'Optimization Found' : 'Optimal Tier'}
                    </span>
                    {hasSavings && (
                      <span className={`text-[8px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ml-auto ${
                        rec.priority === 'Critical' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : rec.priority === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}>
                        {rec.priority} Priority
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[11px] text-slate-400 leading-relaxed leading-4">
                    {rec.reason}
                  </p>
                </div>

                {/* Sub-item confidence and effort ratings (FEATURE 9 & 11) */}
                <div className="border-t border-slate-900 my-4 pt-3.5 text-[9px] space-y-2 print:border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">Confidence Score</span>
                    <span className="text-slate-350 font-bold">{rec.confidence} Confidence</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">Implementation Effort</span>
                    <span className="text-slate-355 font-bold">{rec.effort} Effort</span>
                  </div>
                </div>

                {/* Pricing comparison grid */}
                <div className="grid grid-cols-4 gap-2 border-t border-slate-900 pt-3 text-[10px] print:border-slate-200">
                  <div>
                    <span className="text-[8px] text-slate-500 block uppercase mb-0.5">Current plan</span>
                    <span className="text-slate-300 font-bold block truncate print:text-black">{rec.currentPlan} ({rec.currentSeats || 'API'})</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 block uppercase mb-0.5">Current spend</span>
                    <span className="text-slate-300 font-bold block print:text-black">{formatCurrency(rec.currentSpend)}/mo</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 block uppercase mb-0.5">Rec. Plan</span>
                    <span className={`font-bold block truncate ${hasSavings ? 'text-emerald-400 print:text-emerald-700' : 'text-slate-300 print:text-black'}`}>
                      {rec.recommendedPlan}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 block uppercase mb-0.5">Recommended Spend</span>
                    <span className="text-slate-300 font-bold block print:text-black">
                      {formatCurrency(rec.recommendedSpend)}/mo
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* SECTION 7: STRATEGIC FOUNDER CONSULTING INSIGHTS (FEATURE 15) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        id="insights-sec" 
        className="glass p-6 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden print:border-slate-300 print:bg-white print:shadow-none"
      >
        <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none" />
        <h2 className="font-display font-extrabold text-base sm:text-lg text-white mb-6 flex items-center gap-2 print:text-black">
          <Sparkles className="h-5 w-5 text-cyan-400 print:text-cyan-700" />
          <span>Strategic Founder Consultant Insights</span>
        </h2>

        <div className="space-y-6">
          {founderInsightsList.map((ins, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-slate-900 pb-5 last:border-b-0 last:pb-0 print:border-slate-200">
              <div className="md:col-span-1">
                <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest block mb-1">Observation Archetype</span>
                <h4 className="text-xs font-black text-white leading-snug print:text-black">{ins.title}</h4>
              </div>
              <div className="md:col-span-3 space-y-3">
                <div className="space-y-1">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold block">Consultant Observation</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed leading-4">{ins.observation}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-rose-450 uppercase tracking-widest font-bold block">Financial Runway Impact</span>
                    <p className="text-[10px] text-slate-400 leading-normal">{ins.impact}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-emerald-400 uppercase tracking-widest font-bold block">Immediate Actionable Step</span>
                    <p className="text-[10px] text-slate-400 leading-normal">{ins.actionableStep}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* SECTION 8: SHAREABLE AUDIT SNAPSHOT VECTOR CARD (FEATURE 13) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass p-6 rounded-3xl border border-slate-850 shadow-2xl relative overflow-hidden text-center space-y-6 print:hidden"
      >
        <div className="border-b border-slate-800 pb-3 max-w-md mx-auto">
          <h3 className="font-display font-extrabold text-sm text-white">Generate Social Share Savings Snapshot</h3>
          <p className="text-xs text-slate-450 leading-relaxed mt-1">
            Export a high-fidelity, infinite-resolution vector SVG snapshot representing your annual AI savings. Perfect for sharing directly to X/Twitter or attaching to Slack reports.
          </p>
        </div>

        {/* Dynamic Vector SVG Card Preview */}
        <div className="flex items-center justify-center p-4 bg-slate-950/60 rounded-2xl max-w-lg mx-auto border border-slate-900 shadow-inner">
          <svg 
            ref={snapshotRef}
            width="420" 
            height="220" 
            viewBox="0 0 420 220" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="rounded-xl border border-slate-800 shadow-2xl max-w-full"
          >
            {/* Background Neon Theme Gradient */}
            <rect width="420" height="220" rx="16" fill="#0b0f19" />
            <rect width="420" height="220" rx="16" fill="url(#snapshotGrad)" fillOpacity="0.08" />
            <rect x="0.5" y="0.5" width="419" height="219" rx="15.5" stroke="#10b981" strokeOpacity="0.2" />
            
            {/* Soft decorative neon circular blur */}
            <circle cx="350" cy="50" r="100" fill="#10b981" fillOpacity="0.04" filter="blur(40px)" />
            <circle cx="80" cy="180" r="80" fill="#06b6d4" fillOpacity="0.03" filter="blur(30px)" />

            {/* Wordmark logo brand */}
            <text x="30" y="45" fill="#ffffff" fontSize="18" fontWeight="900" fontFamily="sans-serif" letterSpacing="-0.025em">
              OptiAI
            </text>
            <text x="96" y="45" fill="#10b981" fontSize="18" fontWeight="950" fontFamily="sans-serif" letterSpacing="-0.025em">
              Audit
            </text>
            
            {/* Savings Stat Figures */}
            <text x="30" y="110" fill="#94a3b8" fontSize="10" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.1em" textAnchor="start">
              ANNUAL CAPITAL RECAPTURED
            </text>
            <text x="30" y="155" fill="#10b981" fontSize="42" fontWeight="900" fontFamily="sans-serif" letterSpacing="-0.04em">
              {formatCurrency(annualSavings)}
            </text>
            <text x="30" y="180" fill="#64748b" fontSize="9" fontWeight="600" fontFamily="sans-serif">
              Saves {formatCurrency(savings)}/month recurrently • Verified Spend Health
            </text>

            {/* Maturity Index rating */}
            <rect x="290" y="28" width="100" height="26" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
            <text x="340" y="44" fill="#cbd5e1" fontSize="8.5" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">
              Health Index: {health.overallScore}%
            </text>

            <defs>
              <linearGradient id="snapshotGrad" x1="0" y1="0" x2="420" y2="220" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10b981" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Action Button Links */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button 
            onClick={downloadSnapshot}
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download Vector SVG Card</span>
          </button>
          <a 
            href={`https://twitter.com/intent/tweet?text=OptiAI%20just%20audited%20our%20SaaS%20stack%20and%20found%20${formatCurrency(annualSavings)}/year%20in%20redundant%20AI%20costs!%20Calculate%20your%20Spend%20Health%20Score%20instantly%20at%20http://localhost:3000`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Share Snapshot to X</span>
          </a>
        </div>
      </motion.div>

      {/* SECTION 9: SPLIT LEAD CAPTURE & EMAIL CLIENT (STRETCHES FULL WIDTH) */}
      {!leadSubmitted ? (
        <div className="lg:grid lg:grid-cols-5 lg:gap-8 items-start space-y-6 lg:space-y-0 print:hidden">
          
          {/* Left Panel: Corporate Email Secure Form */}
          <div className="glass p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 lg:col-span-3">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span>{results_data.isWellOptimized ? 'Stay Sized Optimally' : 'Executive Cost Consultation'}</span>
              </span>
              <h2 className="font-display font-extrabold text-base sm:text-lg text-white mt-1">
                {results_data.isWellOptimized ? 'Maintain Optimized Stack' : 'Help Us Reduce Your Spend'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {results_data.isWellOptimized 
                  ? 'Input your email to receive automated notices when active price plan updates, licensing tiers, or alternate AI developer tools emerge.'
                  : 'Provide your contact details below to get a custom roadmap and expert consultation on reducing your monthly software bills.'
                }
              </p>
            </div>

            <form onSubmit={handleLeadSubmit} className="space-y-4">
              {leadError && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{leadError}</span>
                </div>
              )}

              {/* Spam Honeypot Field */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="honeypot"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  placeholder="Leave this empty"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Address */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Corporate Email Address <span className="text-rose-400 font-black">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-200 py-3 pl-10 pr-4 rounded-xl text-xs transition outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Company Name <span className="text-slate-600 font-semibold">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Inc."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-200 py-3 pl-10 pr-4 rounded-xl text-xs transition outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Company Role */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Your Role <span className="text-slate-600 font-semibold">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. CTO, Eng Manager"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-200 py-3 pl-10 pr-4 rounded-xl text-xs transition outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Company Seat Count */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Total Team Size <span className="text-slate-600 font-semibold">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="number"
                      value={leadTeamSize}
                      onChange={(e) => setLeadTeamSize(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/10 text-slate-200 py-3.5 pl-10 pr-4 rounded-xl text-xs transition duration-200 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={leadLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg transition duration-200 cursor-pointer disabled:opacity-50 text-xs"
                >
                  {leadLoading 
                    ? 'Securing Savings Database...' 
                    : results_data.isWellOptimized 
                      ? 'Secure Optimization Channel' 
                      : 'Help Me Reduce My Spend'
                  }
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Panel: Interactive Mock Email Client */}
          <div className="glass rounded-3xl border border-slate-805 overflow-hidden shadow-2xl flex flex-col h-[480px] lg:col-span-2">
            <div className="bg-slate-950/80 border-b border-slate-900 px-4 py-3 flex items-center justify-between">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                Interactive Report Preview
              </span>
              <div className="w-8" />
            </div>

            <div className="bg-slate-900/40 px-4 py-2.5 border-b border-slate-800/80 text-[10px] space-y-1 text-slate-400 font-medium">
              <div>
                <span className="text-slate-500 w-12 inline-block">Client:</span>
                <span className="text-emerald-400 font-semibold">{email || 'you@company.com'}</span>
              </div>
              <div>
                <span className="text-slate-500 w-12 inline-block">Proposal:</span>
                <span className="text-slate-205 font-bold">
                  AI Spend Reduction Proposal - {companyName || 'your Startup'}
                </span>
              </div>
            </div>

            {/* Email Render Preview Body */}
            <div className="flex-1 overflow-y-auto bg-slate-950 p-4 scrollbar-thin scrollbar-thumb-slate-850 scrollbar-track-transparent">
              <div className="max-w-[480px] mx-auto bg-slate-905 border border-slate-850 rounded-xl overflow-hidden shadow-lg">
                <div className="bg-emerald-500 py-3 px-4 text-center">
                  <h3 className="text-slate-950 font-display font-black text-xs uppercase tracking-wider margin-0">
                    OptiAI Spend Audit
                  </h3>
                  <span className="text-[8px] text-emerald-950 font-bold block">
                    Financial Optimization Report Completed
                  </span>
                </div>

                <div className="p-4 space-y-4 text-left text-[10px]">
                  <span className="block text-[11px] font-bold text-white">
                    Hi {role || 'Founder'} at {companyName || 'your Startup'},
                  </span>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    {results_data.isWellOptimized
                      ? 'We successfully compiled your startup\'s AI spend audit. Good news: your AI spend is already well optimized! We have included our tracking highlights below.'
                      : 'We successfully compiled your startup\'s AI spend audit. By standardizing licensing tiers and eliminating overlaps, you can instantly recapture capital for your reserves.'
                    }
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-emerald-500/[0.03] border border-emerald-500/20 rounded-lg p-2 text-center">
                      <span className="block text-[8px] text-slate-450 uppercase font-semibold mb-0.5">
                        Monthly Savings
                      </span>
                      <strong className="text-xs font-display font-extrabold text-emerald-400">
                        {formatCurrency(savings)}
                      </strong>
                    </div>
                    <div className="bg-emerald-500/[0.03] border border-emerald-500/20 rounded-lg p-2 text-center">
                      <span className="block text-[8px] text-slate-455 uppercase font-semibold mb-0.5">
                        Annual Savings
                      </span>
                      <strong className="text-xs font-display font-extrabold text-emerald-400">
                        {formatCurrency(annualSavings)}
                      </strong>
                    </div>
                  </div>

                  <div className="border-t border-b border-slate-800 py-2 flex items-center justify-between text-[9px] text-slate-500 font-bold">
                    <span>Current Spend: <strong>{formatCurrency(currentSpend)}/mo</strong></span>
                    <span>Optimized Spend: <strong className="text-emerald-400">{formatCurrency(optimizedSpend)}/mo</strong></span>
                  </div>

                  <div className="border-l border-slate-800 pl-2 space-y-1.5 py-1 text-[9px] text-slate-400 leading-relaxed italic">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-emerald-400 not-italic">
                      Audit Highlights
                    </span>
                    {formatMessageContent(ai_summary)}
                  </div>
                </div>

                <div className="bg-slate-950 border-t border-slate-800 p-3 text-center text-[8px] text-slate-500 leading-relaxed">
                  © {new Date().getFullYear()} OptiAI. Standard SaaS optimization brokerage channels.
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 rounded-3xl border border-emerald-500/20 text-center space-y-4 print:hidden"
        >
          <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto" />
          <h3 className="font-display font-extrabold text-lg text-white">Savings Secured Successfully!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            We have registered your request! Our cost optimization experts will review your audit details and get in touch with you shortly at the email address provided to help reduce your spend.
          </p>
        </motion.div>
      )}

      {/* STRATEGIC CUSTOM PDF EXECUTIVE STYLING TRIGGER BLOCK (FEATURE 6) */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-family: sans-serif !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .glass, .glass-header, .glass-card {
            background: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            border-radius: 12px !important;
            color: #0f172a !important;
          }
          .print\\:hidden, button, form, .print-hidden-items, header, footer {
            display: none !important;
          }
          text {
            fill: #0f172a !important;
          }
          h1, h2, h3, h4, strong {
            color: #000000 !important;
          }
          span, p, li {
            color: #334155 !important;
          }
          .text-emerald-400, .text-cyan-400, .text-rose-400 {
            color: #047857 !important;
          }
          circle.stroke-slate-850 {
            stroke: #e2e8f0 !important;
          }
          div {
            border-color: #cbd5e1 !important;
          }
        }
      `}</style>

    </div>
  );
}
