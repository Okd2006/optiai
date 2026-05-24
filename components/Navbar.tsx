'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { OptiAiLogo } from '@/components/BrandLogos';
import { 
  FileText, 
  Settings, 
  LogOut, 
  BarChart2, 
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/70 backdrop-blur-md border-b border-zinc-900/80 py-4 px-6 md:px-12 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3 group">
        <OptiAiLogo className="h-6 w-12 group-hover:scale-102 transition" />
        <span className="font-display font-extrabold text-xl tracking-tight text-white flex items-center">
          Opti<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent ml-0.5 font-bold">AI</span>
        </span>
      </Link>
      <nav className="hidden sm:flex items-center gap-8 text-xs font-semibold text-zinc-400">
        <Link href="/#features" className="hover:text-white transition">Features</Link>
        <Link href="/#how-it-works" className="hover:text-white transition">How It Works</Link>
        <Link href="/#faq" className="hover:text-white transition">FAQ</Link>
      </nav>
      <div className="flex items-center gap-4 relative">
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition cursor-pointer select-none"
            >
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="h-6 w-6 rounded-lg bg-zinc-950 shrink-0 border border-zinc-800"
              />
              <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2.5 w-44 bg-zinc-950 border border-zinc-900 p-1.5 rounded-xl shadow-2xl z-20 space-y-1">
                  <div className="px-2 py-1.5 border-b border-zinc-900 mb-1">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Account</span>
                    <span className="text-[10px] font-extrabold text-zinc-200 block truncate leading-tight">{user.name}</span>
                    <span className="text-[8px] text-zinc-600 block truncate">{user.email}</span>
                  </div>
                  <Link 
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-900 text-[10px] font-semibold text-zinc-400 hover:text-zinc-200 transition"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    <span>Saved Audits</span>
                  </Link>
                  <Link 
                    href="/dashboard#roadmap-sec"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-900 text-[10px] font-semibold text-zinc-400 hover:text-zinc-200 transition"
                  >
                    <BarChart2 className="h-3.5 w-3.5" />
                    <span>Benchmark History</span>
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 text-[10px] font-semibold text-zinc-450 hover:text-rose-400 transition text-left cursor-pointer border border-transparent"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link 
            href="/audit" 
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-sm hover:shadow-zinc-100/5 transition cursor-pointer"
          >
            Run Free Audit
          </Link>
        )}
      </div>
    </header>
  );
}
