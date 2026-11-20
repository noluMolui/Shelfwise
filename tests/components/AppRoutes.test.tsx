import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../../src/app/AppRoutes';

vi.mock('../../src/app/RouteGuards', () => ({
  RequireOwner: () => <Outlet />,
  RequireProfile: () => <Outlet />,
  RequireSession: () => <Outlet />,
}));

describe('AppRoutes', () => {
  it.each([
    ['/low-stock', 'Low Stock'],
    ['/suppliers', 'Suppliers'],
  ])('renders the %s page', (path, title) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.queryByText('This screen is not part of the current build.'))
      .not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });
});
