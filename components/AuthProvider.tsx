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
            setUser({
              id: session.user.id,
              email: session.user.email ?? '',
              name: session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? 'User',
              avatarUrl: session.user.user_metadata?.avatar_url ?? 'https://api.dicebear.com/7.x/adventurer/svg?seed=OptiAI',
            });
          }

          // Setup listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              setUser({
                id: session.user.id,
                email: session.user.email ?? '',
                name: session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? 'User',
                avatarUrl: session.user.user_metadata?.avatar_url ?? 'https://api.dicebear.com/7.x/adventurer/svg?seed=OptiAI',
              });
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
          setUser(JSON.parse(savedSession));
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
