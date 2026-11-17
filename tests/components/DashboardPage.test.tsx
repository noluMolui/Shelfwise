import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '../../src/pages/DashboardPage';
import { getDashboardSummary } from '../../src/lib/api/dashboard';
import type { DashboardSummary } from '../../src/lib/api/dashboard';

const onlineStatus = vi.hoisted(() => ({ online: true }));

vi.mock('../../src/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => onlineStatus.online,
}));

vi.mock('../../src/lib/api/dashboard', () => ({
  getDashboardSummary: vi.fn(),
}));

const summary: DashboardSummary = {
  total_products: 4,
  inventory_value: 1720,
  low_stock_count: 2,
  recent_movement_count: 3,
  recent_movements: [
    {
      created_at: '2026-11-10T10:00:00.000Z',
      product_name: 'A4 Exercise Book',
      movement_type: 'incoming',
      quantity: 20,
    },
    {
      created_at: '2026-11-09T10:00:00.000Z',
      product_name: 'Black Pens',
      movement_type: 'outgoing',
      quantity: 5,
    },
    {
      created_at: '2026-11-08T10:00:00.000Z',
      product_name: 'Desk Stapler',
      movement_type: 'incoming',
      quantity: 2,
    },
  ],
};

function renderPage(queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    onlineStatus.online = true;
    vi.mocked(getDashboardSummary).mockResolvedValue(summary);
  });

  it('shows the summary values and three recent activity rows', async () => {
    renderPage();

    expect(await screen.findByText('R1,720.00')).toBeInTheDocument();
    expect(
      Array.from(document.querySelectorAll('.dashboard-card__value')).map((node) => node.textContent),
    ).toEqual(['4', 'R1,720.00', '2', '3']);
    expect(screen.getByText('A4 Exercise Book')).toBeInTheDocument();
    expect(screen.getByText('Black Pens')).toBeInTheDocument();
    expect(screen.getByText('Desk Stapler')).toBeInTheDocument();
    expect(screen.getAllByText('10 Nov 2026')).toHaveLength(1);
    expect(screen.getAllByText('Incoming')).toHaveLength(2);
    expect(screen.getByText('Outgoing')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all movements' })).toHaveAttribute('href', '/stock');
  });

  it('shows the empty inventory state and add-product link', async () => {
    vi.mocked(getDashboardSummary).mockResolvedValue({
      ...summary,
      total_products: 0,
      inventory_value: 0,
      low_stock_count: 0,
      recent_movement_count: 0,
      recent_movements: [],
    });
    renderPage();

    expect(await screen.findByText(
      'Your inventory is empty. Add your first product to get started.',
    )).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add product' })).toHaveAttribute('href', '/products/new');
  });

  it('shows skeleton cards and activity rows while loading without totals', () => {
    vi.mocked(getDashboardSummary).mockReturnValue(new Promise(() => undefined));
    renderPage();

    expect(screen.getByRole('status', { name: 'Loading dashboard' })).toBeInTheDocument();
    expect(screen.queryByText('R1,720.00')).not.toBeInTheDocument();
    expect(document.querySelectorAll('.dashboard-skeleton-card')).toHaveLength(4);
    expect(document.querySelectorAll('.dashboard-skeleton-row')).toHaveLength(3);
  });

  it('shows an error and retries loading the summary', async () => {
    vi.mocked(getDashboardSummary)
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce(summary);
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "We couldn't load your dashboard. Please try again.",
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('R1,720.00')).toBeInTheDocument();
    expect(getDashboardSummary).toHaveBeenCalledTimes(2);
  });

  it('shows the offline banner and previously cached summary', async () => {
    onlineStatus.online = false;
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(['dashboard'], summary);
    renderPage(queryClient);

    expect(screen.getByRole('status')).toHaveTextContent(
      "You're offline. Showing only information already loaded.",
    );
    expect(screen.getByText('R1,720.00')).toBeInTheDocument();
    expect(getDashboardSummary).not.toHaveBeenCalled();
  });

  it('links the three navigable summary cards to their existing routes', async () => {
    renderPage();
    await screen.findByText('R1,720.00');

    expect(screen.getByRole('link', { name: /Total Products/ })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: /Low-Stock Products/ })).toHaveAttribute('href', '/low-stock');
    expect(screen.getByRole('link', { name: /Recent Stock Activity/ })).toHaveAttribute('href', '/stock');
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('does not make Inventory Value a link', async () => {
    renderPage();
    await screen.findByText('R1,720.00');

    const cardLabel = screen.getByText('Inventory Value');
    expect(cardLabel.closest('a')).toBeNull();
    expect(cardLabel.closest('article')).toBeInTheDocument();
  });
});
