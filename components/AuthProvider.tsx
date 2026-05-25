'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasSupabase } from '@/lib/supabase-config';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  role?: string;
  companyName?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isMockAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync session on mount
  useEffect(() => {
    async function initSession() {
      if (hasSupabase) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
          const supabase = createClient(supabaseUrl, supabaseAnonKey);

          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const email = session.user.email ?? '';
            const name = session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? 'User';
            setUser({
              id: session.user.id,
              email,
              name,
              avatarUrl: session.user.user_metadata?.avatar_url ?? 'https://api.dicebear.com/7.x/adventurer/svg?seed=OptiAI',
            });
            syncUserAsLead(email, name);
          }

          // Setup listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              const email = session.user.email ?? '';
              const name = session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? 'User';
              setUser({
                id: session.user.id,
                email,
                name,
                avatarUrl: session.user.user_metadata?.avatar_url ?? 'https://api.dicebear.com/7.x/adventurer/svg?seed=OptiAI',
              });
              syncUserAsLead(email, name);
            } else {
              setUser(null);
            }
          });

          return () => {
            subscription.unsubscribe();
          };
        } catch (e) {
          console.warn('Supabase auth initialization failed, falling back to mock auth:', e);
        }
      }

      // Local mock session fallback
      try {
        const savedSession = localStorage.getItem('optiai_session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          setUser(parsed);
          syncUserAsLead(parsed.email, parsed.name);
        }
      } catch (err) {
        console.error('Failed to load local mock session:', err);
      } finally {
        setLoading(false);
      }
    }

    initSession().then(() => setLoading(false));
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    if (hasSupabase) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        return;
      } catch (e) {
        console.error('Supabase Google OAuth failed:', e);
      }
    }

    // High-fidelity local mock simulation
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const mockProfile: UserProfile = {
          id: 'mock-user-12345',
          email: 'alex.rivers@forge.io',
          name: 'Alex Rivers',
          avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex',
          role: 'CTO',
          companyName: 'Forge.io'
        };
        try {
          localStorage.setItem('optiai_session', JSON.stringify(mockProfile));
          setUser(mockProfile);
          syncUserAsLead(mockProfile.email, mockProfile.name);
        } catch (e) {
          console.error('Failed to write mock session:', e);
        }
        setLoading(false);
        router.push('/');
        resolve();
      }, 1200); // realistic network delay simulation
    });
  };

  const logout = async () => {
    setLoading(true);
    if (hasSupabase) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        await supabase.auth.signOut();
      } catch (e) {
        console.error('Supabase signout failed:', e);
      }
    }

    // Clear local mock session
    try {
      localStorage.removeItem('optiai_session');
      localStorage.removeItem('optiai_guest_mode');
    } catch (e) {
      console.error('Failed to clear mock session:', e);
    }
    setUser(null);
    setLoading(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, isMockAuth: !hasSupabase }}>
      {children}
    </AuthContext.Provider>
  );
}

async function syncUserAsLead(email: string, name: string) {
  if (!email) return;
  try {
    if (typeof window === 'undefined') return;
    const key = `optiai_lead_synced_${email}`;
    if (localStorage.getItem(key) === 'true') return;

    await fetch('/api/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        companyName: name ? `${name}'s Workspace` : 'Personal Workspace',
        role: 'Founder',
        teamSize: 1,
        isLoginTrigger: true
      })
    });

    localStorage.setItem(key, 'true');
  } catch (e) {
    console.warn('Failed to auto-sync logged-in user to leads database:', e);
  }
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
