import { useState, useEffect, createContext, useContext, FC, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { showError } from '@/utils/toast';
import { Profile } from '@/types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInAsDeveloper: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile on initial load", error);
        } else {
          setProfile(data);
        }
      }
      setLoading(false);
    };

    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
         const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile on auth change", error);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInAsDeveloper = async () => {
    if (import.meta.env.DEV) {
      const randomString = Math.random().toString(36).substring(2, 10);
      const email = `dev-${randomString}@local.dev`;
      const password = 'strong-dev-password-123!';
      
      const { error: signUpError } = await supabase.auth.signUp({ email, password });

      if (signUpError) {
        console.error('Dev sign-up error:', signUpError);
        showError(`Dev sign-up failed: ${signUpError.message}`);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (signInError) {
        console.error('Dev sign-in error:', signInError);
        showError(`Dev sign-in failed: ${signInError.message}`);
      }
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
    profile,
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