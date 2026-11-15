import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StockMovementsPage } from '../../src/pages/StockMovementsPage';
import { listStockMovements } from '../../src/lib/api/movements';
import type { StockMovement } from '../../src/lib/database.types';

const onlineStatus = vi.hoisted(() => ({ online: true }));

vi.mock('../../src/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => onlineStatus.online,
}));

vi.mock('../../src/lib/api/movements', () => ({
  listStockMovements: vi.fn(),
  listActiveProducts: vi.fn(),
  recordStockMovement: vi.fn(),
}));

const movement: StockMovement = {
  id: 'movement-1',
  business_id: 'business-1',
  product_id: 'product-1',
  user_id: 'user-1',
  movement_type: 'incoming',
  quantity: 20,
  note: null,
  created_at: '2026-11-10T10:00:00.000Z',
  product: { name: 'A4 Exercise Book', sku: 'ST001' },
  recorder: { full_name: 'Test Business Owner' },
};

function renderPage(queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})) {

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/stock']}>
        <StockMovementsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('StockMovementsPage', () => {
  beforeEach(() => {
    onlineStatus.online = true;
    vi.mocked(listStockMovements).mockResolvedValue({
      movements: [movement],
      hasMore: false,
      totalCount: 1,
    });
  });

  it('shows the product, movement type, quantity and recorder', async () => {
    renderPage();

    expect(await screen.findByText('A4 Exercise Book')).toBeInTheDocument();
    expect(screen.getByText('Incoming', { selector: '.movement-badge' })).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Test Business Owner')).toBeInTheDocument();
  });

  it('applies the movement type filter', async () => {
    renderPage();
    await screen.findByText('A4 Exercise Book');

    fireEvent.change(screen.getByLabelText('Movement type'), {
      target: { value: 'outgoing' },
    });

    await waitFor(() => {
      expect(listStockMovements).toHaveBeenLastCalledWith(
        expect.objectContaining({ movementType: 'outgoing', page: 0 }),
      );
    });
  });

  it('applies South African calendar date filters', async () => {
    renderPage();
    await screen.findByText('A4 Exercise Book');

    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2026-11-10' },
    });
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: '2026-11-11' },
    });

    await waitFor(() => {
      expect(listStockMovements).toHaveBeenLastCalledWith(
        expect.objectContaining({ fromDate: '2026-11-10', toDate: '2026-11-11', page: 0 }),
      );
    });
  });

  it('shows cached activity while offline', async () => {
    onlineStatus.online = false;
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(['stockMovements', '', '', ''], {
      pages: [{ movements: [movement], hasMore: false, totalCount: 1 }],
      pageParams: [0],
    });
    renderPage(queryClient);

    expect(await screen.findByText('A4 Exercise Book')).toBeInTheDocument();
    expect(screen.getByText(
      'You’re offline. Showing previously loaded stock activity where available.',
    )).toBeInTheDocument();
    expect(listStockMovements).not.toHaveBeenCalled();
  });

  it('shows the empty-history message', async () => {
    vi.mocked(listStockMovements).mockResolvedValue({
      movements: [],
      hasMore: false,
      totalCount: 0,
    });
    renderPage();

    expect(
      await screen.findByText('No stock movements have been recorded yet.'),
    ).toBeInTheDocument();
  });
});
