import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SignupPage } from '../../src/pages/SignupPage';

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(),
}));

vi.mock('../../src/lib/supabase/client', () => ({
  getSupabaseClient: () => ({ auth: { signUp: mocks.signUp } }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>,
  );
}

describe('SignupPage', () => {
  beforeEach(() => {
    mocks.signUp.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it('creates an account with the profile metadata needed by the database trigger', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: '  Sam Shelf  ' },
    });
    fireEvent.change(screen.getByLabelText(/business name/i), {
      target: { value: '  Shelf Store  ' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'sam@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), {
      target: { value: 'correct horse' },
    });
    fireEvent.click(screen.getByLabelText(/18 or older/i));
    fireEvent.click(screen.getByLabelText(/details will be used/i));
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(mocks.signUp).toHaveBeenCalledWith({
      email: 'sam@example.com',
      password: 'correct horse',
      options: {
        data: {
          full_name: 'Sam Shelf',
          business_name: 'Shelf Store',
        },
      },
    }));
    expect(await screen.findByRole('status')).toHaveTextContent(/check your email/i);
  });

  it('shows Supabase errors rather than reporting a successful registration', async () => {
    mocks.signUp.mockResolvedValue({
      data: { session: null },
      error: new Error('Email is already registered'),
    });
    renderPage();
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Sam Shelf' },
    });
    fireEvent.change(screen.getByLabelText(/business name/i), {
      target: { value: 'Shelf Store' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'sam@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), {
      target: { value: 'correct horse' },
    });
    fireEvent.click(screen.getByLabelText(/18 or older/i));
    fireEvent.click(screen.getByLabelText(/details will be used/i));
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email is already registered');
    expect(screen.queryByText(/check your email/i)).not.toBeInTheDocument();
  });
});
