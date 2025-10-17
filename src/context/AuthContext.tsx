
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import { logError, logInfo } from '@/utils/errorLogger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  const signOut = useCallback(async () => {
    try {
      console.log('AuthContext: Signing out user...');
      logInfo('AuthContext: User initiated sign out');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthContext: Error signing out:', error);
        logError('AuthContext: Error during sign out', error);
        throw error;
      }
      
      console.log('AuthContext: Sign out successful');
      logInfo('AuthContext: Sign out successful');
      
      // Clear local state
      setUser(null);
      setSession(null);
      
      // Navigate to welcome screen
      router.replace('/(auth)/welcome');
    } catch (error) {
      console.error('AuthContext: Sign out failed:', error);
      logError('AuthContext: Sign out failed', error);
      throw error;
    }
  }, [router]);

  // Initialize auth state and listen for changes
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Initializing authentication...');
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error getting initial session:', error);
          logError('AuthContext: Error getting initial session', error);
        } else {
          console.log('AuthContext: Initial session loaded:', session ? 'authenticated' : 'not authenticated');
          
          if (mounted) {
            setSession(session);
            setUser(session?.user ?? null);
          }
        }
      } catch (error) {
        console.error('AuthContext: Exception during initialization:', error);
        logError('AuthContext: Exception during initialization', error);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event, session ? 'authenticated' : 'not authenticated');
        logInfo(`AuthContext: Auth state changed: ${event}`);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Handle navigation protection - only after initialization
  useEffect(() => {
    if (!initialized || loading) {
      console.log('AuthContext: Skipping navigation - not initialized or loading');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    
    console.log('AuthContext: Navigation check:', {
      hasSession: !!session,
      inAuthGroup,
      segments: segments.join('/'),
      initialized,
      loading
    });
    
    if (!session && !inAuthGroup) {
      console.log('AuthContext: No session, redirecting to welcome');
      router.replace('/(auth)/welcome');
    } else if (session && inAuthGroup && segments[1] !== 'email-confirmed') {
      // Don't redirect if user is on email confirmation page
      console.log('AuthContext: Session exists, redirecting to home');
      router.replace('/(tabs)/(home)');
    }
  }, [session, segments, loading, initialized, router]);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
