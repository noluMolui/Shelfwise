import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../../src/app/AppRoutes';

const auth = vi.hoisted(() => ({
  session: null as { user: { id: string } } | null,
  isPasswordRecovery: false,
  loading: false,
  clearPasswordRecovery: vi.fn(),
}));

vi.mock('../../src/app/RouteGuards', () => ({
  RequireOwner: () => <Outlet />,
  RequireProfile: () => <Outlet />,
  RequireSession: () => <Outlet />,
}));

vi.mock('../../src/app/AuthProvider', () => ({
  useAuth: () => auth,
}));

describe('AppRoutes', () => {
  beforeEach(() => {
    auth.session = null;
    auth.isPasswordRecovery = false;
  });

  it.each([
    ['/low-stock', 'Low Stock'],
    ['/suppliers', 'Suppliers'],
  ])('renders the %s page', (path, title) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.queryByText('This screen is not part of the current build.'))
      .not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('keeps a recovery session on the password reset screen', async () => {
    auth.session = { user: { id: 'recovery-user' } };
    auth.isPasswordRecovery = true;
    render(
      <MemoryRouter initialEntries={['/products']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'Create a new password' }))
      .toBeInTheDocument();
  });
});
