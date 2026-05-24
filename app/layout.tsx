import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
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
      <body className="min-h-full flex flex-col font-sans text-zinc-100 bg-zinc-950 antialiased">
        <AuthProvider>
          {/* Navigation Bar */}
          <Navbar />
   
          {/* Dynamic Page Content */}
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthProvider>
 
        {/* Global Footer */}
        <footer className="border-t border-zinc-900 bg-zinc-950/20 py-12 px-6 md:px-12 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <Link href="/" className="flex items-center gap-2.5 mb-3">
                <OptiAiLogo className="h-5 w-10" />
                <span className="font-display font-bold text-lg tracking-tight text-white flex items-center">
                  Opti<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent ml-0.5 font-semibold">AI</span>
                </span>
              </Link>
              <p className="text-[11px] text-zinc-500 max-w-sm">
                Optimize your AI tool spend in seconds. Identify software overlap and downgrade redundant plans.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900/30 border border-zinc-800/80 px-4 py-2 rounded-lg text-[11px] text-zinc-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Partnered with <strong className="text-zinc-200 font-semibold">Credex</strong> for start-up credit savings.</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-[11px] text-zinc-500">
              <Link href="/#how-it-works" className="hover:text-white transition">Methodology</Link>
              <Link href="/#faq" className="hover:text-white transition">FAQ</Link>
              <span className="text-zinc-800">|</span>
              <span>© {new Date().getFullYear()} OptiAI. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
