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
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

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
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We couldn’t sign you in. Check your details and try again.',
    );
  });
});
