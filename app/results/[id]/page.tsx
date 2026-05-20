'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
  Bot
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { AuditInput } from '@/lib/audit-engine';

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
  input_data: AuditInput;
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
        <li key={idx} className="ml-4 list-disc text-slate-300 my-0.5">
          {rendered}
        </li>
      );
    }
    if (isHeader) {
      return (
        <h4 key={idx} className="text-sm font-bold text-emerald-400 mt-3 mb-1">
          {rendered}
        </h4>
      );
    }
    return (
      <p key={idx} className="my-1.5 min-h-[1em]">
        {rendered}
      </p>
    );
  });
}

export default function ResultsPage() {
  const params = useParams();
  const id = params.id as string;

  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lead form state
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [leadTeamSize, setLeadTeamSize] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Spam honeypot
  
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  const [shareCopied, setShareCopied] = useState(false);

  // Spend Copilot Chat State
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!audit) return;
    const savingsFormatted = formatCurrency(audit.results_data.totalMonthlySavings);
    const timer = setTimeout(() => {
      setMessages([
        {
          role: 'assistant',
          content: `Hi! I am the **Spend Copilot** 🤖.\n\nI have parsed your AI tool stack and identified **${savingsFormatted}/mo** in total savings. \n\nAsk me how to negotiate with vendors, standardise developers on Cursor, or get Credex credits!`
        }
      ]);
    }, 0);
    return () => clearTimeout(timer);
  }, [audit]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  // 1. Fetch Audit Data
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
          honeypot // spam honeypot
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <Sparkles className="h-10 w-10 text-emerald-400 animate-spin" />
        <span className="text-sm font-semibold tracking-wide">Compiling Financial Optimization Matrix...</span>
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
  const savings = results_data.totalMonthlySavings;
  const annualSavings = results_data.totalAnnualSavings;

  return (
    <div className="relative overflow-hidden min-h-screen py-12 px-6 md:px-12 max-w-5xl mx-auto z-10 space-y-8">
      {/* Background soft glowing blur */}
      <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Share & Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Analysis Complete
          </span>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white mt-1">
            SaaS Cost Audit Dashboard
          </h1>
        </div>
        <button
          onClick={copyShareLink}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-auto"
        >
          {shareCopied ? (
            <>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400">Share Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              <span>Copy Public Share Link</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Main Hero Financial Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Total Monthly Savings */}
        <div className="glass p-6 rounded-2xl border-emerald-500/20 shadow-lg shadow-emerald-500/5 col-span-1 flex flex-col justify-between h-44 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-[120px] h-[120px] rounded-full bg-emerald-500/5 blur-[40px] pointer-events-none" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Monthly Savings</span>
          <div>
            <span className="font-display font-black text-4xl sm:text-5xl text-emerald-400 block tracking-tight">
              {formatCurrency(savings)}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">Instantly slashed from bill</span>
          </div>
        </div>

        {/* Total Annual Savings */}
        <div className="glass p-6 rounded-2xl border-emerald-500/20 shadow-lg shadow-emerald-500/5 col-span-1 flex flex-col justify-between h-44 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-[120px] h-[120px] rounded-full bg-emerald-500/5 blur-[40px] pointer-events-none" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Annual Capital Returned</span>
          <div>
            <span className="font-display font-black text-4xl sm:text-5xl text-emerald-400 block tracking-tight">
              {formatCurrency(annualSavings)}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">To cash reserves</span>
          </div>
        </div>

        {/* Current vs Recommended */}
        <div className="glass p-6 rounded-2xl border-slate-800 col-span-1 flex flex-col justify-between h-44">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Spend Distribution</span>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Current Spend:</span>
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

      {/* 2. AI Summary & Spend Copilot Layout */}
      <div className="grid lg:grid-cols-5 gap-6 animate-fade-in">
        {/* Left Column: Personalized AI Summary */}
        <div className="glass p-6 sm:p-8 rounded-2xl border-emerald-500/10 shadow-lg shadow-emerald-500/5 space-y-4 lg:col-span-3 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="font-display font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Personalized AI Audit Summary</span>
            </h2>
            <div className="prose prose-invert prose-xs text-slate-300 max-w-none text-xs sm:text-sm leading-relaxed border-t border-slate-800/80 pt-4 whitespace-pre-line">
              {ai_summary}
            </div>
          </div>
        </div>

        {/* Right Column: Spend Copilot Chatbox */}
        <div className="glass p-5 rounded-2xl border-slate-800 shadow-lg lg:col-span-2 flex flex-col h-[400px] justify-between relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-slate-800/85 pb-2.5">
            <Bot className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-display font-extrabold text-xs text-white">Spend Copilot</h3>
              <span className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider block">Interactive Advisor</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 scrollbar-thin scrollbar-thumb-slate-850 scrollbar-track-transparent">
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
                        : 'bg-slate-900 border border-slate-800/80 text-slate-300 rounded-bl-none'
                    }`}
                  >
                    {isUser ? msg.content : formatMessageContent(msg.content)}
                  </div>
                </div>
              );
            })}
            
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none px-3.5 py-2.5 text-slate-400 flex items-center gap-2">
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
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[9px] flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{chatError}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips (only when not loading & only welcome message) */}
          {messages.length === 1 && !chatLoading && (
            <div className="flex flex-wrap gap-1 mb-2">
              <button
                type="button"
                onClick={() => handleSendMessage('Why drop GitHub Copilot?')}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-[9px] px-2 py-0.5 rounded-full transition cursor-pointer"
              >
                💡 Why drop Copilot?
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Should we standardise on Claude?')}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-[9px] px-2 py-0.5 rounded-full transition cursor-pointer"
              >
                💬 Standardise on Claude?
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('How do we claim Credex credits?')}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-[9px] px-2 py-0.5 rounded-full transition cursor-pointer"
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
            className="flex gap-2 border-t border-slate-800/80 pt-2.5 mt-0.5"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question or add context..."
              disabled={chatLoading}
              className="flex-1 bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-200 py-2 px-3 rounded-xl text-[11px] transition outline-none font-medium"
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

      {/* 3. Honest low savings notice OR high savings Credex CTA */}
      {results_data.isWellOptimized ? (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
          <span><strong>Fiscal Excellence:</strong> Your AI subscription spend is already well optimized! You have minimal tool overlap or excess seat allocations.</span>
        </div>
      ) : results_data.showCredexCta ? (
        <div className="p-6 md:p-8 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-[-30%] right-[-20%] w-[250px] h-[250px] rounded-full bg-emerald-400/5 blur-[60px] pointer-events-none" />
          <div className="space-y-2 max-w-xl">
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-white">
              Unlock Deeper Credex Partner Credits ($10k+)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Because your identified annual savings exceed $500/month, you qualify for official accelerator-tier sponsor packages. Book a complimentary consult to get up to $10,000 in free OpenAI/Anthropic API credits.
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

      {/* 4. Detailed Per-Tool Breakdown List */}
      <div className="space-y-4">
        <h2 className="font-display font-extrabold text-lg text-white">
          Detailed Per-Tool Cost Optimization Details
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
                  {/* Tool Meta details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-extrabold text-base text-white">{rec.toolName}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${hasSavings ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {hasSavings ? 'Optimization Found' : 'Optimal Tier'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                      {rec.reason}
                    </p>
                  </div>

                  {/* Pricing and savings breakdown details */}
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

                {/* Plan details compare row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800/60 mt-4 pt-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase mb-0.5">Current Tier</span>
                    <span className="text-slate-300 font-bold">{rec.currentPlan}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase mb-0.5">Active Seats</span>
                    <span className="text-slate-300 font-bold">{rec.currentSeats || 'Usage API'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase mb-0.5">Recommended Tier</span>
                    <span className={`font-bold ${hasSavings ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {rec.recommendedPlan}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase mb-0.5">Recommended Spend</span>
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

      {/* 5. Lead Capture Form Card */}
      {!leadSubmitted ? (
        <div className="glass p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Secure Data Delivery
            </span>
            <h2 className="font-display font-extrabold text-lg text-white mt-1">
              Save Your Report & Claim Startup Credits
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Register below to email a backup copy of your report dashboard and start the official broker channel for free startup API credits. We never share your company details.
            </p>
          </div>

          <form onSubmit={handleLeadSubmit} className="space-y-4">
            {leadError && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{leadError}</span>
              </div>
            )}

            {/* Spam Honeypot Field - Hidden from normal users */}
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
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-200 py-3 pl-10 pr-4 rounded-xl text-xs transition outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={leadLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition duration-200 cursor-pointer disabled:opacity-50 text-xs"
              >
                {leadLoading ? 'Securing Savings Database...' : 'Save Audit & Email Copy'}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="glass p-8 rounded-2xl border border-emerald-500/20 text-center space-y-4">
          <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto" />
          <h3 className="font-display font-extrabold text-lg text-white">Savings Secured Successfully!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            We have registered your cost audit report. A duplicate share link and Credex broker credits guide have been generated. Check your inbox (or server developer logs) for full details!
          </p>
        </div>
      )}
    </div>
  );
}
