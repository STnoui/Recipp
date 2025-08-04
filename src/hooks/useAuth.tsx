import { useState, useEffect, createContext, useContext, FC, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { showError } from '@/utils/toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInAsDeveloper: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInAsDeveloper = async () => {
    if (import.meta.env.DEV) {
      const email = `dev-${Date.now()}@example.com`;
      // Using a stronger password to avoid potential rejection by Supabase's password policy.
      const password = 'strong-dev-password-123!';
      
      // First, we sign up a new, unique user for this dev session.
      const { error: signUpError } = await supabase.auth.signUp({ email, password });

      if (signUpError) {
        console.error('Dev sign-up error:', signUpError);
        showError(`Dev sign-up failed: ${signUpError.message}`);
        return;
      }

      // After a successful sign-up, we immediately sign in. This ensures a session is created,
      // even if the project has email verification enabled.
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (signInError) {
        console.error('Dev sign-in error:', signInError);
        showError(`Dev sign-in failed: ${signInError.message}`);
      }
      // If sign-in is successful, the onAuthStateChange listener will update the session
      // and the user will be redirected automatically.
    } else {
      const message = 'Developer login is only available in development mode.';
      console.error(message);
      showError(message);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    loading,
    signInAsDeveloper,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};