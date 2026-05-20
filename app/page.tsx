import Link from 'next/link';
import { 
  Layers, 
  Users, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  DollarSign
} from 'lucide-react';

export default function LandingPage() {
  const supportedTools = [
    { name: 'Cursor', desc: 'AI Coding IDE', color: 'border-blue-500/20 text-blue-400' },
    { name: 'Claude', desc: 'Anthropic Assistant', color: 'border-orange-500/20 text-orange-400' },
    { name: 'ChatGPT', desc: 'OpenAI Plus & Teams', color: 'border-emerald-500/20 text-emerald-400' },
    { name: 'GitHub Copilot', desc: 'IDE Completion', color: 'border-indigo-500/20 text-indigo-400' },
    { name: 'Gemini', desc: 'Google Pro Assistant', color: 'border-cyan-500/20 text-cyan-400' },
    { name: 'Windsurf', desc: 'AI Code Editor', color: 'border-teal-500/20 text-teal-400' },
    { name: 'OpenAI API', desc: 'GPT-4o & Reasoning API', color: 'border-green-500/20 text-green-400' },
    { name: 'Anthropic API', desc: 'Claude Sonnet API', color: 'border-rose-500/20 text-rose-400' }
  ];

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
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none animate-soft-pulse" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-16 md:pt-32 md:pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400 mb-6 shadow-sm">
          <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Optimize your AI tool spend in seconds.</span>
        </div>
        
        <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
          Optimize Your <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">AI Spend</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Discover hidden savings across Cursor, Claude, ChatGPT, Copilot, and more. Stop paying retail pricing for duplicate seats.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/audit" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer group"
          >
            <span>Run Free Audit</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
          </Link>
          <a 
            href="#how-it-works" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 px-8 py-4 rounded-xl text-slate-300 hover:text-white transition font-medium"
          >
            See How It Works
          </a>
        </div>
      </section>

      {/* Supported Tools Logos Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12 border-y border-slate-800/60 bg-[#070b13]/60 backdrop-blur-sm">
        <h2 className="text-center text-xs font-semibold text-slate-500 uppercase tracking-widest mb-8">
          Supported AI Stack Subscriptions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {supportedTools.map((t, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col items-center justify-center p-4 border rounded-xl bg-slate-900/20 ${t.color} text-center hover:scale-102 transition duration-200`}
            >
              <span className="font-bold text-sm text-white mb-0.5">{t.name}</span>
              <span className="text-[10px] text-slate-500">{t.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white mb-4">
            How It Works
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Identify software waste in three rapid, privacy-first steps. No integrations required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Input Your AI Stack',
              desc: 'Select the subscriptions, licenses, seats, and monthly payments currently spent by your developers and writers.'
            },
            {
              step: '02',
              title: 'Detect Waste & Overlap',
              desc: 'Our engine instantly reviews seat plans, duplication, and highlights cheaper, developer-friendly alternatives.'
            },
            {
              step: '03',
              title: 'Optimize & Reinvest',
              desc: 'Get a shareable report, a custom AI summary, and partner credit recommendations to slash your bill.'
            }
          ].map((item, idx) => (
            <div key={idx} className="glass p-8 rounded-2xl relative hover-card">
              <span className="font-display font-black text-6xl text-emerald-500/10 absolute top-4 right-6 select-none">
                {item.step}
              </span>
              <h3 className="font-display font-bold text-lg text-white mb-3 mt-4">
                {item.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-16 bg-[#060a12]/40 rounded-3xl border border-slate-800/80">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Benefits</span>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white mt-2 mb-6">
              Maximize your startup’s capital efficiency
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Every dollar spent on redundant AI subscriptions is a dollar not spent on building your product or hiring talent. OptiAI streamlines engineering software spend seamlessly.
            </p>
            <div className="space-y-4">
              {[
                { title: 'Zero Login Integration', desc: 'No sensitive keys or accounts linking required.' },
                { title: 'Remove Duplicate Tools', desc: 'Identify seats using overlapping code extensions.' },
                { title: 'Credex Partner Benefits', desc: 'Access startup discount brokers for free credits.' }
              ].map((b, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{b.title}</h4>
                    <p className="text-xs text-slate-400">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-6 rounded-2xl flex flex-col justify-between h-40">
              <DollarSign className="h-8 w-8 text-emerald-400" />
              <div>
                <span className="block font-display font-bold text-2xl text-white">30%+</span>
                <span className="text-xs text-slate-400">Average Savings Identified</span>
              </div>
            </div>
            <div className="glass p-6 rounded-2xl flex flex-col justify-between h-40">
              <Users className="h-8 w-8 text-emerald-400" />
              <div>
                <span className="block font-display font-bold text-2xl text-white">2–50</span>
                <span className="text-xs text-slate-400">Sized Team Optimization</span>
              </div>
            </div>
            <div className="glass p-6 rounded-2xl flex flex-col justify-between h-40 col-span-2">
              <Layers className="h-8 w-8 text-emerald-400" />
              <div>
                <span className="block font-display font-bold text-lg text-white">Full Stack Audits</span>
                <span className="text-xs text-slate-400">Calculates IDEs, custom APIs, and chat seats</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Testimonials */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white mb-4">
            Trusted by CTOs & Founders
          </h2>
          <p className="text-slate-400 text-sm">
            Here is how startup leaders optimized their early burn-rate using OptiAI.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              quote: "OptiAI revealed we were paying for GitHub Copilot for devs who had already converted to Cursor. We saved $640/month in five minutes.",
              author: "Alex Rivers",
              role: "CTO, Forge.io",
              logo: "bg-blue-500/10 text-blue-400"
            },
            {
              quote: "As a small team of three, Claude Team was charging us a 5-seat minimum. Downsizing to Claude Pro was an instant $90/mo savings.",
              author: "Sara Jenkins",
              role: "Co-Founder, Synthetix",
              logo: "bg-orange-500/10 text-orange-400"
            },
            {
              quote: "The Credex partner perk alone was worth it. They helped us secure $10,000 in OpenAI API credits. Unbelievable value.",
              author: "Marcus Chen",
              role: "Founder, PeakML",
              logo: "bg-emerald-500/10 text-emerald-400"
            }
          ].map((t, idx) => (
            <div key={idx} className="glass p-8 rounded-2xl hover:scale-102 transition duration-200 flex flex-col justify-between">
              <p className="text-slate-300 text-sm italic leading-relaxed mb-6">
                &quot;{t.quote}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-full ${t.logo} flex items-center justify-center font-bold text-sm`}>
                  {t.author[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.author}</h4>
                  <p className="text-[10px] text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <HelpCircle className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
          <h2 className="font-display font-extrabold text-3xl text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-6">
          {faqItems.map((item, idx) => (
            <div key={idx} className="glass p-6 rounded-xl border border-slate-800">
              <h3 className="font-display font-bold text-sm sm:text-base text-white mb-2 flex items-center gap-2">
                <span className="text-emerald-400 font-black">?</span>
                {item.q}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-4">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Call-to-Action CTA */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-20 text-center">
        <div className="glass p-12 md:p-16 rounded-3xl border border-emerald-500/20 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[80px]" />
          
          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-white mb-4">
            Ready to optimize your burn rate?
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto mb-8">
            Run a completely free spend analysis in seconds and reclaim your capital.
          </p>
          <Link 
            href="/audit" 
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg transition duration-200 cursor-pointer"
          >
            <span>Run Free Audit Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
