import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient, hasSupabaseConfig } from '../lib/supabase/client';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      setLoading(false);
      return;
    }

    let active = true;
    const supabase = getSupabaseClient();
    const updateSession = (nextSession: Session | null) => {
      const userId = nextSession?.user.id ?? null;
      if (lastUserId.current !== userId) {
        queryClient.clear();
        lastUserId.current = userId;
      }
      setSession(nextSession);
    };
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        updateSession(nextSession);
        setLoading(false);
        setError(null);
      }
    });

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError('We couldn’t restore your session. Please log in again.');
      updateSession(data.session);
      setLoading(false);
    }).catch(() => {
      if (active) {
        setError('We couldn’t restore your session. Please log in again.');
        setLoading(false);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [queryClient]);

  const value = useMemo(() => ({ session, loading, error }), [session, loading, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider.');
  return value;
}
