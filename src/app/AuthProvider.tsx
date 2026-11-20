import {
  createContext,
  useContext,
  useCallback,
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
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const recoveryStorageKey = 'shelfwise.password-recovery-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const lastUserId = useRef<string | null>(null);
  const clearPasswordRecovery = useCallback(() => {
    sessionStorage.removeItem(recoveryStorageKey);
    setIsPasswordRecovery(false);
  }, []);

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      setLoading(false);
      return;
    }

    let active = true;
    let authChangeCount = 0;
    const supabase = getSupabaseClient();
    const updateSession = (nextSession: Session | null) => {
      const userId = nextSession?.user.id ?? null;
      if (lastUserId.current !== userId) {
        queryClient.clear();
        lastUserId.current = userId;
      }
      setSession(nextSession);
    };
    const updateRecovery = (nextSession: Session | null) => {
      const recoveryUser = sessionStorage.getItem(recoveryStorageKey);
      if (recoveryUser && recoveryUser !== nextSession?.user.id) {
        sessionStorage.removeItem(recoveryStorageKey);
      }
      setIsPasswordRecovery(Boolean(nextSession && recoveryUser === nextSession.user.id));
    };
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (active) {
        authChangeCount += 1;
        updateSession(nextSession);
        if (event === 'PASSWORD_RECOVERY' && nextSession) {
          sessionStorage.setItem(recoveryStorageKey, nextSession.user.id);
        }
        updateRecovery(nextSession);
        setLoading(false);
        setError(null);
      }
    });

    const changeCountAtRequest = authChangeCount;
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active || authChangeCount !== changeCountAtRequest) return;
      if (sessionError) setError('We couldn’t restore your session. Please log in again.');
      updateSession(data.session);
      updateRecovery(data.session);
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

  const value = useMemo(
    () => ({
      session,
      loading,
      error,
      isPasswordRecovery,
      clearPasswordRecovery,
    }),
    [session, loading, error, isPasswordRecovery, clearPasswordRecovery],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider.');
  return value;
}
