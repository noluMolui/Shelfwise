import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForgotPasswordPage } from '../../src/pages/ForgotPasswordPage';

const mocks = vi.hoisted(() => ({
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  auth: {
    session: null as { user: { id: string } } | null,
    loading: false,
    isPasswordRecovery: false,
    clearPasswordRecovery: vi.fn(),
  },
}));

vi.mock('../../src/app/AuthProvider', () => ({
  useAuth: () => mocks.auth,
}));

vi.mock('../../src/lib/supabase/client', () => ({
  getSupabaseClient: () => ({
    auth: {
      resetPasswordForEmail: mocks.resetPasswordForEmail,
      updateUser: mocks.updateUser,
    },
  }),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <Routes>
        <Route path="/" element={<p>Inventory home</p>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    mocks.resetPasswordForEmail.mockResolvedValue({ error: null });
    mocks.updateUser.mockResolvedValue({ error: null });
    mocks.auth.session = null;
    mocks.auth.loading = false;
    mocks.auth.isPasswordRecovery = false;
    mocks.auth.clearPasswordRecovery.mockReset();
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  });

  it('sends a reset link and shows the same non-enumerating confirmation', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: ' unknown@example.com ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));

    await waitFor(() => {
      expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith(
        'unknown@example.com',
        { redirectTo: `${window.location.origin}/forgot-password` },
      );
    });
    expect(await screen.findByRole('status')).toHaveTextContent(
      'If an account exists for this email, we’ve sent a reset link.',
    );
  });

  it('does not contact Supabase while offline', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    renderPage();
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'owner@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(mocks.resetPasswordForEmail).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You’re offline. Check your connection and try again.',
    );
  });

  it('reports a reset request failure without showing confirmation', async () => {
    mocks.resetPasswordForEmail.mockResolvedValue({ error: new Error('Service unavailable') });
    renderPage();
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'owner@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We couldn’t send a reset link. Please try again.',
    );
    expect(screen.queryByText(/we’ve sent a reset link/i)).not.toBeInTheDocument();
  });

  it('requires a recovery session before allowing a password change', async () => {
    mocks.auth.session = { user: { id: 'user-1' } };
    renderPage();

    expect(await screen.findByText('You’re already signed in')).toBeInTheDocument();
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it('validates the new password and saves it from a recovery session', async () => {
    mocks.auth.session = { user: { id: 'user-1' } };
    mocks.auth.isPasswordRecovery = true;
    renderPage();

    fireEvent.change(screen.getByLabelText(/new password/i, { selector: 'input' }), {
      target: { value: 'short' },
    });
    fireEvent.submit(screen.getByRole('form', { name: 'Set new password' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Password must be at least 6 characters.',
    );
    expect(mocks.updateUser).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/new password/i, { selector: 'input' }), {
      target: { value: 'new-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    await waitFor(() => {
      expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'new-password' });
    });
    expect(mocks.auth.clearPasswordRecovery).toHaveBeenCalledOnce();
    expect(await screen.findByText('Inventory home')).toBeInTheDocument();
  });

  it('keeps the recovery form open if updating the password fails', async () => {
    mocks.auth.session = { user: { id: 'user-1' } };
    mocks.auth.isPasswordRecovery = true;
    mocks.updateUser.mockResolvedValue({ error: new Error('Update failed') });
    renderPage();
    fireEvent.change(screen.getByLabelText(/new password/i, { selector: 'input' }), {
      target: { value: 'new-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We couldn’t update your password. Please try again.',
    );
    expect(mocks.auth.clearPasswordRecovery).not.toHaveBeenCalled();
  });
});
