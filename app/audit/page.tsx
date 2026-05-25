'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRICING_DATA } from '@/lib/pricing-data';
import { TOOL_LOGOS, OptiAiLogo } from '@/components/BrandLogos';
import { 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface ToolFormInput {
  toolId: string;
  planName: string;
  seats: number | '';
  monthlySpend: number | '';
}

export default function AuditFormPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect unauthenticated guest visitors to the login page first
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      try {
        const isGuest = localStorage.getItem('optiai_guest_mode') === 'true';
        if (!isGuest) {
          router.push('/login');
        }
      } catch (e) {}
    }
  }, [user, authLoading, router]);
  
  // Form states
  const [teamSize, setTeamSize] = useState<number | ''>(5);
  const [primaryUseCase, setPrimaryUseCase] = useState<'coding' | 'writing' | 'research' | 'data' | 'mixed'>('coding');
  const [tools, setTools] = useState<ToolFormInput[]>([
    { toolId: 'cursor', planName: 'Pro', seats: 3, monthlySpend: 60 },
    { toolId: 'chatgpt', planName: 'Plus', seats: 2, monthlySpend: 40 }
  ]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Sync from localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedTeamSize = localStorage.getItem('optiai_teamSize');
        const savedUseCase = localStorage.getItem('optiai_primaryUseCase');
        const savedTools = localStorage.getItem('optiai_tools');

        if (savedTeamSize) setTeamSize(parseInt(savedTeamSize, 10));
        if (savedUseCase) setPrimaryUseCase(savedUseCase as 'coding' | 'writing' | 'research' | 'data' | 'mixed');
        if (savedTools) {
          const parsed = JSON.parse(savedTools);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTools(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to load form cache from localStorage:', e);
      } finally {
        setIsLoaded(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 2. Persist to localStorage on edits
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('optiai_teamSize', teamSize ? teamSize.toString() : '1');
      localStorage.setItem('optiai_primaryUseCase', primaryUseCase);
      localStorage.setItem('optiai_tools', JSON.stringify(tools));
    } catch (e) {
      console.warn('Failed to save form cache to localStorage:', e);
    }
  }, [teamSize, primaryUseCase, tools, isLoaded]);

  // Available tools
  const availableToolsList = Object.values(PRICING_DATA);

  // Helper to handle visual tool selection toggling
  const toggleToolSelection = (toolId: string) => {
    if (!Array.isArray(tools)) return;
    const existingIndex = tools.findIndex(t => t.toolId === toolId);
    if (existingIndex > -1) {
      // Deselect tool -> remove it
      const updated = tools.filter(t => t.toolId !== toolId);
      setTools(updated);
    } else {
      // Select tool -> add it
      const pricing = PRICING_DATA[toolId];
      if (!pricing) return;
      
      const defaultPlan = pricing.plans[0]?.name || '';
      const pricePerSeat = pricing.plans[0]?.pricePerUserMonth ?? 0;
      const defaultSeats = 1;
      const defaultSpend = pricing.plans[0]?.billingFrequency === 'usage' ? 50 : pricePerSeat * defaultSeats;
      
      setTools([
        ...tools,
        {
          toolId,
          planName: defaultPlan,
          seats: defaultSeats,
          monthlySpend: defaultSpend
        }
      ]);
    }
  };

  // Helper to handle plan change
  const handlePlanChange = (index: number, planName: string) => {
    if (!Array.isArray(tools) || !tools[index]) return;
    const tool = tools[index];
    const pricing = PRICING_DATA[tool.toolId];
    if (!pricing) return;

    const plan = pricing.plans.find(p => p.name === planName);
    const pricePerSeat = plan?.pricePerUserMonth ?? 0;
    
    const calculationSeats = tool.seats === '' ? 1 : tool.seats;
    let spend = pricePerSeat * calculationSeats;
    if (plan?.billingFrequency === 'usage') {
      spend = tool.monthlySpend === '' ? 50 : tool.monthlySpend; // maintain custom spend or default to 50
    }

    const updated = [...tools];
    updated[index] = {
      ...tool,
      planName,
      monthlySpend: spend
    };
    setTools(updated);
  };

  // Helper to handle seats change
  const handleSeatsChange = (index: number, seatsVal: number | '') => {
    if (!Array.isArray(tools) || !tools[index]) return;
    const tool = tools[index];
    const pricing = PRICING_DATA[tool.toolId];
    if (!pricing) return;

    const plan = pricing.plans.find(p => p.name === tool.planName);
    const pricePerSeat = plan?.pricePerUserMonth ?? 0;

    // Use 1 as a temporary fallback for calculation while typing
    const calculationSeats = seatsVal === '' ? 1 : seatsVal;
    let spend = pricePerSeat * calculationSeats;
    if (plan?.billingFrequency === 'usage') {
      spend = tool.monthlySpend === '' ? 0 : tool.monthlySpend; // usage-based stays custom
    }

    const updated = [...tools];
    updated[index] = {
      ...tool,
      seats: seatsVal,
      monthlySpend: spend
    };
    setTools(updated);
  };

  // Helper to handle custom spend change
  const handleSpendChange = (index: number, monthlySpend: number | '') => {
    if (!Array.isArray(tools) || !tools[index]) return;
    const updated = [...tools];
    updated[index] = {
      ...tools[index],
      monthlySpend: monthlySpend === '' ? '' : Math.max(0, monthlySpend)
    };
    setTools(updated);
  };

  const removeToolRow = (index: number) => {
    if (!Array.isArray(tools)) return;
    const updated = tools.filter((_, idx) => idx !== index);
    setTools(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!Array.isArray(tools) || tools.length === 0) {
      setError('Please add at least one AI tool to analyze.');
      setLoading(false);
      return;
    }

    try {
      // Map empty seats or spend to defaults for the request
      const sanitizedTools = tools.map(t => ({
        ...t,
        seats: t.seats === '' ? 1 : t.seats,
        monthlySpend: t.monthlySpend === '' ? 0 : t.monthlySpend
      }));

      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamSize: teamSize || 1,
          primaryUseCase,
          tools: sanitizedTools,
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to compute AI audit recommendations. Please try again.');
      }

      const data = await response.json();
      router.push(`/results/${data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-400">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
        <span className="text-sm font-semibold tracking-wide">Loading Your Startup Stack...</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden min-h-screen py-16 px-6 md:px-12 max-w-4xl mx-auto z-10">
      {/* Background Glowing Orb */}
      <div className="absolute top-[-20%] left-[-15%] w-[450px] h-[450px] rounded-full bg-emerald-500/[0.02] blur-[120px] pointer-events-none" />

      {/* Header Description */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-850 rounded-full text-[10px] font-bold text-zinc-400 mb-4">
          <OptiAiLogo className="h-3.5 w-7" />
          <span>Audit Engine Version 1.1</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-zinc-100 mb-3 tracking-tight">
          Configure Your Stack
        </h1>
        <p className="text-zinc-400 text-xs md:text-sm max-w-xl mx-auto">
          Enter your current subscriptions, plans, and team seat sizes below. We will calculate where you are overpaying instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl text-xs">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* General Stack Information Card */}
        <div className="glass p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6">
          <h2 className="font-display font-extrabold text-sm text-zinc-100 border-b border-zinc-900 pb-3 flex items-center gap-2">
            <span>1. Startup Environment</span>
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="team-size" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Team Size (Employees)
              </label>
              <input
                id="team-size"
                type="number"
                min="1"
                max="1000"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="w-full bg-zinc-900/30 border border-zinc-850 hover:border-zinc-700 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/10 text-zinc-200 py-3 px-4 rounded-xl text-xs transition outline-none font-medium"
                required
              />
            </div>

            <div>
              <label htmlFor="use-case" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Primary AI Use Case
              </label>
              <select
                id="use-case"
                value={primaryUseCase}
                onChange={(e) => setPrimaryUseCase(e.target.value as 'coding' | 'writing' | 'research' | 'data' | 'mixed')}
                className="w-full bg-zinc-900/30 border border-zinc-850 hover:border-zinc-700 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/10 text-zinc-200 py-3 px-4 rounded-xl text-xs transition outline-none font-medium cursor-pointer"
              >
                <option value="coding">Software Development / Coding</option>
                <option value="writing">Content Writing / Copywriting</option>
                <option value="research">Academic / Market Research</option>
                <option value="data">Data Analysis & Modeling</option>
                <option value="mixed">Mixed Daily Operations</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Visual Stack Selector Grid */}
        <div className="glass p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6">
          <h2 className="font-display font-extrabold text-sm text-zinc-100 border-b border-zinc-900 pb-3 flex items-center gap-2">
            <span>2. Select Your AI Stack</span>
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {availableToolsList.map((t) => {
              const isActive = Array.isArray(tools) && tools.some(tool => tool.toolId === t.id);
              const logoData = TOOL_LOGOS[t.id] || { logo: () => <span className="text-[10px] font-bold">AI</span>, color: 'text-zinc-550 border-zinc-900', bgGlow: 'bg-zinc-900/5' };
              
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleToolSelection(t.id)}
                  className={`relative p-4 rounded-2xl border text-left transition duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 h-32 overflow-hidden group select-none ${
                    isActive 
                      ? 'border-emerald-500/30 bg-emerald-500/[0.015] shadow-sm text-zinc-105' 
                      : 'border-zinc-900 bg-zinc-900/10 hover:border-zinc-800 hover:bg-zinc-900/30 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {/* Selection dot */}
                  <div className={`absolute top-2.5 right-2.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center text-[10px] transition ${
                    isActive 
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black' 
                      : 'border-zinc-850 text-transparent'
                  }`}>
                    ✓
                  </div>

                  {/* Logo Badge */}
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-300 ${logoData.color} ${logoData.bgGlow} ${
                    isActive ? 'scale-105 shadow-md' : 'group-hover:scale-102'
                  }`}>
                    {logoData.logo({ className: 'w-8 h-8' })}
                  </div>

                  <span className={`text-xs font-semibold transition tracking-wide ${
                    isActive ? 'text-white font-bold' : 'text-slate-350'
                  }`}>
                    {t.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Tool Configurations Card */}
        <div className="glass p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6">
          <h2 className="font-display font-extrabold text-sm text-zinc-100 border-b border-zinc-900 pb-3 flex items-center gap-2">
            <span>3. Current Plan Configurations</span>
          </h2>

          <div className="space-y-6">
            {Array.isArray(tools) && tools.map((tool, idx) => {
              const currentPricing = PRICING_DATA[tool.toolId];
              const isUsageType = currentPricing?.plans.find(p => p.name === tool.planName)?.billingFrequency === 'usage';

              return (
                <div 
                  key={idx} 
                  className="p-5 rounded-xl border border-zinc-900 bg-zinc-900/10 relative group space-y-4 hover:border-zinc-800 transition"
                >
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeToolRow(idx)}
                    className="absolute top-4 right-4 text-zinc-550 hover:text-rose-400 p-1.5 rounded-lg hover:bg-zinc-900/60 transition cursor-pointer"
                    title="Remove Tool"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Tool Name Badge (Read-Only) */}
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Tool Name
                      </label>
                      <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-900 px-3.5 rounded-xl text-xs font-semibold text-zinc-205 h-[50px] w-full">
                        <span className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                          TOOL_LOGOS[tool.toolId]?.color || 'text-zinc-500'
                        } ${TOOL_LOGOS[tool.toolId]?.bgGlow || 'bg-zinc-900'}`}>
                          {TOOL_LOGOS[tool.toolId] ? TOOL_LOGOS[tool.toolId].logo({ className: 'w-4 h-4' }) : 'AI'}
                        </span>
                        <span className="text-xs font-semibold tracking-wide truncate">{currentPricing?.name}</span>
                      </div>
                    </div>

                    {/* Plan Dropdown */}
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Plan / Tier
                      </label>
                      <select
                        value={tool.planName}
                        onChange={(e) => handlePlanChange(idx, e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 text-zinc-200 px-3.5 rounded-xl text-xs transition outline-none cursor-pointer hover:border-zinc-850 font-semibold h-[50px] py-0"
                      >
                        {currentPricing?.plans.map((p) => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Seats Count */}
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Active Seats
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={tool.seats}
                        onChange={(e) => handleSeatsChange(idx, e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        className="w-full bg-zinc-950 border border-zinc-900 text-zinc-200 px-3.5 rounded-xl text-xs transition outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/10 font-semibold disabled:opacity-50 disabled:cursor-not-allowed h-[50px] py-0"
                        disabled={isUsageType} // API tools don't have static user seats
                      />
                    </div>

                    {/* Monthly Spend */}
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <span>Monthly Spend ($)</span>
                        {isUsageType && (
                          <span title="For API tools, enter your average monthly bill invoice.">
                            <HelpCircle className="h-3 w-3 text-zinc-550 cursor-help" />
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100000"
                        value={tool.monthlySpend}
                        onChange={(e) => handleSpendChange(idx, e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-900 text-zinc-200 px-3.5 rounded-xl text-xs transition outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/10 font-semibold h-[50px] py-0"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {(!Array.isArray(tools) || tools.length === 0) && (
            <div className="text-center py-8 text-slate-500 text-xs">
              No tools selected yet. Select some AI tools in the grid above to configure your active stack!
            </div>
          )}
        </div>

        {/* Submit Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass rounded-2xl border border-zinc-900">
          <div className="flex items-center gap-2 text-xs text-zinc-450">
            <Sparkles className="h-4.5 w-4.5 text-emerald-400 shrink-0 animate-pulse" />
            <span>OptiAI acts as a financial audit tool for AI spend. No credit cards or account connections required.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold px-6 py-3 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs whitespace-nowrap self-end sm:self-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running Audit Engine...</span>
              </>
            ) : (
              <>
                <span>Calculate Cost Savings</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
