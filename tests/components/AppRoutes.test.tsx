
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Outlet } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../../src/app/AppRoutes';

vi.mock('../../src/app/RouteGuards', () => ({
  RequireOwner: () => <Outlet />,
  RequireProfile: () => <Outlet />,
  RequireSession: () => <Outlet />,
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
});
