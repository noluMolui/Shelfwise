import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from '../../src/pages/LoginPage';

const mocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
}));

vi.mock('../../src/lib/supabase/client', () => ({
  getSupabaseClient: () => ({ auth: { signInWithPassword: mocks.signInWithPassword } }),
}));

function renderPage() {
  return render(
    <MemoryRouter
      initialEntries={[{
        pathname: '/login',
        state: { from: { pathname: '/products/new', search: '?source=catalogue' } },
      }]}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/products/new" element={<p>New product form</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    mocks.signInWithPassword.mockResolvedValue({ error: null });
  });

  it('signs in and returns the user to the protected page they requested', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: ' owner@example.com ' },
    });
    fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), {
      target: { value: 'correct horse' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(mocks.signInWithPassword).toHaveBeenCalledWith({
        email: 'owner@example.com',
        password: 'correct horse',
      });
    });
    expect(await screen.findByText('New product form')).toBeInTheDocument();
  });

  it('shows an error when Supabase rejects the credentials', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: new Error('Invalid credentials') });
    renderPage();
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'owner@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), {
      target: { value: 'incorrect' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We couldn’t sign you in. Check your details and try again.',
    );
    expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();
  });

  it('locks the form and shows a spinner while submitting', async () => {
    let resolveSignIn: (value: { error: null }) => void = () => undefined;
    mocks.signInWithPassword.mockReturnValue(new Promise((resolve) => {
      resolveSignIn = resolve;
    }));
    renderPage();

    const email = screen.getByLabelText(/email address/i);
    const password = screen.getByLabelText(/password/i, { selector: 'input' });
    const toggle = screen.getByRole('button', { name: 'Show password' });
    fireEvent.change(email, { target: { value: 'owner@example.com' } });
    fireEvent.change(password, { target: { value: 'correct horse' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(email).toBeDisabled();
    expect(password).toBeDisabled();
    expect(toggle).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeDisabled();
    expect(document.querySelector('.button__spinner')).toBeInTheDocument();

    resolveSignIn({ error: null });
    await screen.findByText('New product form');
  });

  it('shows the exact unverified email message', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: { code: 'email_not_confirmed' } });
    renderPage();
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'owner@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), {
      target: { value: 'correct horse' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please verify your email before logging in.',
    );
  });

  it('shows the offline message and does not call Supabase when offline', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent(
      'You’re offline. Check your connection and try again.',
    );
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'owner@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), {
      target: { value: 'correct horse' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You’re offline. Check your connection and try again.',
    );
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  });

  it('updates the offline banner when browser connectivity changes', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    renderPage();

    fireEvent(window, new Event('offline'));
    expect(screen.getByRole('status')).toHaveTextContent(
      'You’re offline. Check your connection and try again.',
    );
    fireEvent(window, new Event('online'));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
