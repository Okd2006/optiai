'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRICING_DATA } from '@/lib/pricing-data';
import { 
  TrendingDown, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface ToolFormInput {
  toolId: string;
  planName: string;
  seats: number;
  monthlySpend: number;
}

const TOOL_LOGOS: Record<string, { logo: string; color: string; bgGlow: string }> = {
  cursor: { logo: 'Cu', color: 'text-emerald-400 border-emerald-500/30', bgGlow: 'bg-emerald-500/5' },
  copilot: { logo: 'Gh', color: 'text-violet-400 border-violet-500/30', bgGlow: 'bg-violet-500/5' },
  claude: { logo: 'Cl', color: 'text-amber-505 border-amber-500/30', bgGlow: 'bg-amber-500/5' },
  chatgpt: { logo: 'Gpt', color: 'text-teal-400 border-teal-500/30', bgGlow: 'bg-teal-500/5' },
  gemini: { logo: 'Ge', color: 'text-blue-400 border-blue-500/30', bgGlow: 'bg-blue-500/5' },
  windsurf: { logo: 'Ws', color: 'text-cyan-400 border-cyan-500/30', bgGlow: 'bg-cyan-500/5' },
  openai_api: { logo: 'Oai', color: 'text-teal-505 border-teal-600/30', bgGlow: 'bg-teal-600/5' },
  anthropic_api: { logo: 'Ant', color: 'text-orange-400 border-orange-500/30', bgGlow: 'bg-orange-500/5' }
};

export default function AuditFormPage() {
  const router = useRouter();
  
  // Form states
  const [teamSize, setTeamSize] = useState<number>(5);
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
      localStorage.setItem('optiai_teamSize', teamSize.toString());
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
    
    let spend = pricePerSeat * tool.seats;
    if (plan?.billingFrequency === 'usage') {
      spend = tool.monthlySpend || 50; // maintain custom spend
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
  const handleSeatsChange = (index: number, seatsVal: number) => {
    if (!Array.isArray(tools) || !tools[index]) return;
    const seats = Math.max(1, seatsVal);
    const tool = tools[index];
    const pricing = PRICING_DATA[tool.toolId];
    if (!pricing) return;

    const plan = pricing.plans.find(p => p.name === tool.planName);
    const pricePerSeat = plan?.pricePerUserMonth ?? 0;

    let spend = pricePerSeat * seats;
    if (plan?.billingFrequency === 'usage') {
      spend = tool.monthlySpend; // usage-based stays custom
    }

    const updated = [...tools];
    updated[index] = {
      ...tool,
      seats,
      monthlySpend: spend
    };
    setTools(updated);
  };

  // Helper to handle custom spend change
  const handleSpendChange = (index: number, monthlySpend: number) => {
    if (!Array.isArray(tools) || !tools[index]) return;
    const updated = [...tools];
    updated[index] = {
      ...tools[index],
      monthlySpend: Math.max(0, monthlySpend)
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
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamSize,
          primaryUseCase,
          tools
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
      <div className="absolute top-[-20%] left-[-15%] w-[450px] h-[450px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Header Description */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400 mb-4">
          <TrendingDown className="h-3 w-3" />
          <span>Audit Engine Version 1.1</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-white mb-3">
          Configure Your Stack
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
          Enter your current subscriptions, plans, and team seat sizes below. We will calculate where you are overpaying instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* General Stack Information Card */}
        <div className="glass p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          <h2 className="font-display font-bold text-lg text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <span>1. Startup Environment</span>
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="team-size" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Team Size (Employees)
              </label>
              <input
                id="team-size"
                type="number"
                min="1"
                max="1000"
                value={teamSize}
                onChange={(e) => setTeamSize(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-200 py-3 px-4 rounded-xl text-sm transition outline-none font-medium"
                required
              />
            </div>

            <div>
              <label htmlFor="use-case" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Primary AI Use Case
              </label>
              <select
                id="use-case"
                value={primaryUseCase}
                onChange={(e) => setPrimaryUseCase(e.target.value as 'coding' | 'writing' | 'research' | 'data' | 'mixed')}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-200 py-3 px-4 rounded-xl text-sm transition outline-none font-medium cursor-pointer"
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
        <div className="glass p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          <h2 className="font-display font-bold text-lg text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <span>2. Select Your AI Stack</span>
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {availableToolsList.map((t) => {
              const isActive = Array.isArray(tools) && tools.some(tool => tool.toolId === t.id);
              const logoData = TOOL_LOGOS[t.id] || { logo: 'AI', color: 'text-slate-400 border-slate-800', bgGlow: 'bg-slate-900/5' };
              
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleToolSelection(t.id)}
                  className={`relative p-4 rounded-xl border text-left transition duration-200 cursor-pointer flex flex-col items-center justify-center gap-2.5 h-28 overflow-hidden group select-none ${
                    isActive 
                      ? 'border-emerald-500 bg-emerald-500/[0.03] shadow-lg shadow-emerald-500/5' 
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/60'
                  }`}
                >
                  {/* Selection dot */}
                  <div className={`absolute top-2.5 right-2.5 w-4 h-4 rounded-full border flex items-center justify-center text-[9px] transition ${
                    isActive 
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black' 
                      : 'border-slate-800 text-transparent'
                  }`}>
                    ✓
                  </div>

                  {/* Logo Badge */}
                  <div className={`w-9.5 h-9.5 rounded-xl border flex items-center justify-center font-display font-extrabold text-xs transition-all duration-300 ${logoData.color} ${logoData.bgGlow} ${
                    isActive ? 'scale-105 shadow-md' : 'group-hover:scale-102'
                  }`}>
                    {logoData.logo}
                  </div>

                  <span className={`text-[11px] font-semibold transition ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}>
                    {t.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Tool Configurations Card */}
        <div className="glass p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          <h2 className="font-display font-bold text-lg text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <span>3. Current Plan Configurations</span>
          </h2>

          <div className="space-y-6">
            {Array.isArray(tools) && tools.map((tool, idx) => {
              const currentPricing = PRICING_DATA[tool.toolId];
              const isUsageType = currentPricing?.plans.find(p => p.name === tool.planName)?.billingFrequency === 'usage';

              return (
                <div 
                  key={idx} 
                  className="p-5 rounded-xl border border-slate-800/80 bg-slate-950/40 relative group space-y-4 hover:border-slate-800 transition"
                >
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeToolRow(idx)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900/60 transition cursor-pointer"
                    title="Remove Tool"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Tool Name Badge (Read-Only) */}
                    <div className="flex flex-col justify-center">
                      <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Tool Name
                      </span>
                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 py-2.5 px-3 rounded-lg text-xs font-semibold text-white">
                        <span className={`w-5 h-5 rounded-md border flex items-center justify-center font-display font-black text-[9px] shrink-0 ${
                          TOOL_LOGOS[tool.toolId]?.color || 'text-slate-400'
                        } ${TOOL_LOGOS[tool.toolId]?.bgGlow || 'bg-slate-900'}`}>
                          {TOOL_LOGOS[tool.toolId]?.logo || 'AI'}
                        </span>
                        <span>{currentPricing?.name}</span>
                      </div>
                    </div>

                    {/* Plan Dropdown */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Plan / Tier
                      </label>
                      <select
                        value={tool.planName}
                        onChange={(e) => handlePlanChange(idx, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-805 text-slate-300 py-2.5 px-3 rounded-lg text-xs transition outline-none cursor-pointer hover:border-slate-700 font-semibold"
                      >
                        {currentPricing?.plans.map((p) => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Seats Count */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Active Seats
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={tool.seats}
                        onChange={(e) => handleSeatsChange(idx, parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-300 py-2 px-3 rounded-lg text-xs transition outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isUsageType} // API tools don't have static user seats
                      />
                    </div>

                    {/* Monthly Spend */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <span>Monthly Spend ($)</span>
                        {isUsageType && (
                          <span title="For API tools, enter your average monthly bill invoice.">
                            <HelpCircle className="h-3 w-3 text-slate-500 cursor-help" />
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100000"
                        value={tool.monthlySpend}
                        onChange={(e) => handleSpendChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-300 py-2 px-3 rounded-lg text-xs transition outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-semibold"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass rounded-2xl border border-emerald-500/20">
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <Sparkles className="h-4 w-4 shrink-0 animate-pulse" />
            <span>OptiAI acts as a financial audit tool for AI spend. No credit cards or account connections required.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap self-end sm:self-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running Audit Engine...</span>
              </>
            ) : (
              <>
                <span>Calculate Cost Savings</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
