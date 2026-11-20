import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../../src/app/AuthProvider';

const mocks = vi.hoisted(() => ({
  onAuthStateChange: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock('../../src/lib/supabase/client', () => ({
  hasSupabaseConfig: () => true,
  getSupabaseClient: () => ({
    auth: {
      onAuthStateChange: mocks.onAuthStateChange,
      getSession: mocks.getSession,
    },
  }),
}));

function RecoveryStatus() {
  const { session, loading, isPasswordRecovery, clearPasswordRecovery } = useAuth();
  return (
    <>
      <p>{loading ? 'loading' : `${session?.user.id ?? 'none'}:${isPasswordRecovery}`}</p>
      <button onClick={clearPasswordRecovery}>Finished</button>
    </>
  );
}

function renderProvider() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider><RecoveryStatus /></AuthProvider>
    </QueryClientProvider>,
  );
}

describe('password recovery session', () => {
  let emit: (event: AuthChangeEvent, session: Session | null) => void;
  const recoverySession = { user: { id: 'recovery-user' } } as Session;

  beforeEach(() => {
    sessionStorage.clear();
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mocks.onAuthStateChange.mockImplementation((callback) => {
      emit = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
  });

  afterEach(() => sessionStorage.clear());

  it('retains the recovery state on refresh and clears it after completion', async () => {
    const first = renderProvider();
    await screen.findByText('none:false');
    act(() => emit('PASSWORD_RECOVERY', recoverySession));
    expect(screen.getByText('recovery-user:true')).toBeInTheDocument();

    first.unmount();
    mocks.getSession.mockResolvedValue({ data: { session: recoverySession }, error: null });
    renderProvider();
    await screen.findByText('recovery-user:true');
    act(() => screen.getByText('Finished').click());
    expect(screen.getByText('recovery-user:false')).toBeInTheDocument();
  });

  it('does not let a stale session lookup overwrite a recovery event', async () => {
    let resolveSession: (value: { data: { session: null }; error: null }) => void = () => {};
    mocks.getSession.mockReturnValue(new Promise((resolve) => { resolveSession = resolve; }));
    renderProvider();
    act(() => emit('PASSWORD_RECOVERY', recoverySession));
    act(() => resolveSession({ data: { session: null }, error: null }));
    await waitFor(() => expect(screen.getByText('recovery-user:true')).toBeInTheDocument());
  });
});
