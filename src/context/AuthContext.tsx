
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/app/integrations/supabase/client';
import { useRouter } from 'expo-router';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('AuthProvider: Initializing auth context...');

    let isSubscribed = true;

    // Set a timeout to ensure we don't hang forever
    const initTimeout = setTimeout(() => {
      if (isSubscribed && loading) {
        console.warn('AuthProvider: Initialization timeout, proceeding without session');
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!isSubscribed) return;

        console.log('AuthProvider: Initial session check:', { session, error });
        if (error) {
          console.error('AuthProvider: Error getting initial session:', error);
        }
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        clearTimeout(initTimeout);
      })
      .catch((error) => {
        if (!isSubscribed) return;

        console.error('AuthProvider: Exception getting initial session:', error);
        setLoading(false);
        clearTimeout(initTimeout);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isSubscribed) return;

      console.log('AuthProvider: Auth state changed:', { event: _event, session, user: session?.user });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth subscription');
      isSubscribed = false;
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('AuthContext: Starting sign out process...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthContext: Error signing out:', error);
        throw error;
      }
      console.log('AuthContext: Sign out successful, navigating to welcome screen...');
      // Navigate to welcome screen after successful sign out
      router.replace('/(auth)/welcome');
    } catch (error) {
      console.error('AuthContext: Exception during sign out:', error);
      throw error;
    }
  };

  const value = {
    session,
    user,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
