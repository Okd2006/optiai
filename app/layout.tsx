import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { OptiAiLogo } from "@/components/BrandLogos";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OptiAI — Optimize your AI tool spend in seconds.",
  description: "Identify overspending, eliminate redundant seats, and unlock cheap startup credits across Cursor, Claude, ChatGPT, Copilot, and more.",
  keywords: ["AI Spend", "Cost Optimization", "SaaS Audit", "Cursor Pricing", "Claude Team", "ChatGPT Team", "Startup Credits"],
  authors: [{ name: "OptiAI Team" }],
  openGraph: {
    title: "OptiAI — Optimize your AI tool spend in seconds.",
    description: "Identify overspending, eliminate redundant seats, and save thousands per month.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "OptiAI — Optimize your AI tool spend in seconds.",
    description: "Startup AI spend cost auditing & subscription management.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans text-slate-100 bg-[#070b13]">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 glass border-b border-slate-800/60 py-4 px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <OptiAiLogo className="h-7 w-14 group-hover:scale-105 transition" />
            <span className="font-display font-black text-2xl md:text-3xl tracking-tight text-white flex items-center">
              Opti<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(6,182,212,0.45)] ml-0.5">AI</span>
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="/#features" className="hover:text-white transition">Features</Link>
            <Link href="/#how-it-works" className="hover:text-white transition">How It Works</Link>
            <Link href="/#faq" className="hover:text-white transition">FAQ</Link>
          </nav>
          <div>
            <Link 
              href="/audit" 
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-emerald-500/10 transition-all duration-250 cursor-pointer"
            >
              Run Free Audit
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Global Footer */}
        <footer className="border-t border-slate-800/80 bg-[#05080f] py-12 px-6 md:px-12 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <Link href="/" className="flex items-center gap-2.5 mb-3">
                <OptiAiLogo className="h-6.5 w-13" />
                <span className="font-display font-extrabold text-xl md:text-2xl tracking-tight text-white flex items-center">
                  Opti<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(6,182,212,0.3)] ml-0.5">AI</span>
                </span>
              </Link>
              <p className="text-xs text-slate-400 max-w-sm">
                Optimize your AI tool spend in seconds. Identify software overlap and downgrade redundant plans.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-4 py-2.5 rounded-lg text-xs text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Partnered with <strong className="text-white">Credex</strong> for start-up credit savings.</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400">
              <Link href="/#how-it-works" className="hover:text-white transition">Methodology</Link>
              <Link href="/#faq" className="hover:text-white transition">FAQ</Link>
              <span className="text-slate-600">|</span>
              <span>© {new Date().getFullYear()} OptiAI. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
