import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

vi.mock('../../src/app/useCurrentProfile', () => ({
  useCurrentProfile: () => ({
    data: { role: 'business_owner' },
    isLoading: false,
  }),
}));

vi.mock('../../src/lib/api/suppliers', () => ({
  listSuppliers: vi.fn().mockResolvedValue([]),
  createSupplier: vi.fn(),
  updateSupplier: vi.fn(),
  deleteSupplier: vi.fn(),
  getSupplier: vi.fn(),
  listSupplierOptions: vi.fn(),
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
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(
      screen.queryByText('This screen is not part of the current build.'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeInTheDocument();
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