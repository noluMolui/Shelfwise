import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LowStock from '../../src/pages/LowStock';
import { getLowStockProducts } from '../../src/lib/api/lowStock';
import type { LowStockProduct } from '../../src/lib/api/lowStock';

const onlineStatus = vi.hoisted(() => ({ online: true }));

vi.mock('../../src/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => onlineStatus.online,
}));

vi.mock('../../src/lib/api/lowStock', () => ({
  getLowStockProducts: vi.fn(),
}));

const products: LowStockProduct[] = [
  {
    id: 'product-1',
    name: 'A4 Exercise Book',
    sku: 'ST001',
    category: 'Stationery',
    quantity: 5,
    low_stock_threshold: 10,
  },
  {
    id: 'product-2',
    name: 'Blue Ballpoint Pen',
    sku: 'ST002',
    category: 'Stationery',
    quantity: 6,
    low_stock_threshold: 10,
  },
  {
    id: 'product-3',
    name: 'USB-C Cable',
    sku: 'EL001',
    category: 'Electronics',
    quantity: 3,
    low_stock_threshold: 5,
  },
];

function renderPage(queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/low-stock']}>
        <LowStock />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LowStock page', () => {
  beforeEach(() => {
    onlineStatus.online = true;
    vi.mocked(getLowStockProducts).mockResolvedValue(products);
  });

  it('shows each low-stock row with its product details and badge', async () => {
    renderPage();

    expect(await screen.findByText('A4 Exercise Book')).toBeInTheDocument();
    for (const product of products) {
      const row = screen.getByRole('row', { name: new RegExp(product.name) });
      expect(within(row).getByText(product.sku)).toBeInTheDocument();
      expect(within(row).getByText(product.category)).toBeInTheDocument();
      expect(within(row).getByText(`${product.quantity} units`)).toBeInTheDocument();
      expect(within(row).getByText(`${product.low_stock_threshold} units`)).toBeInTheDocument();
      expect(within(row).getByText('Low stock')).toBeInTheDocument();
    }
  });

  it('shows the loaded low-stock count and keeps it unchanged when searching', async () => {
    renderPage();

    expect(await screen.findByText('3', { selector: 'h2' })).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Search products or SKU...'), {
      target: { value: 'Cable' },
    });

    expect(screen.getByText('3', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByText('USB-C Cable')).toBeInTheDocument();
    expect(screen.queryByText('A4 Exercise Book')).not.toBeInTheDocument();
  });

  it('searches the loaded rows by name and SKU and reports no matches', async () => {
    renderPage();
    await screen.findByText('A4 Exercise Book');
    const search = screen.getByPlaceholderText('Search products or SKU...');

    fireEvent.change(search, { target: { value: 'Blue Ballpoint' } });
    expect(screen.getByText('Blue Ballpoint Pen')).toBeInTheDocument();
    expect(screen.queryByText('A4 Exercise Book')).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'EL001' } });
    expect(screen.getByText('USB-C Cable')).toBeInTheDocument();
    expect(screen.queryByText('Blue Ballpoint Pen')).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'missing' } });
    expect(screen.getByText('No matching low-stock products found.')).toBeInTheDocument();
  });

  it('shows placeholder rows while loading without fake numbers', () => {
    vi.mocked(getLowStockProducts).mockReturnValue(new Promise(() => undefined));
    renderPage();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(document.querySelectorAll('.low-stock-skeleton-row').length).toBeGreaterThan(0);
    expect(screen.queryByText('3', { selector: 'h2' })).not.toBeInTheDocument();
    expect(screen.queryByText(/\d+ units/)).not.toBeInTheDocument();
  });

  it('shows the exact load error and retries the query', async () => {
    vi.mocked(getLowStockProducts)
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce(products);
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We couldn’t load low-stock products. Please try again.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('A4 Exercise Book')).toBeInTheDocument();
    expect(getLowStockProducts).toHaveBeenCalledTimes(2);
  });

  it('shows the exact offline message above cached rows', () => {
    onlineStatus.online = false;
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(['lowStockProducts'], products);
    renderPage(queryClient);

    const offline = screen.getByRole('status');
    expect(offline).toHaveTextContent(
      'You’re offline. Showing previously loaded low-stock information where available.',
    );
    expect(offline.compareDocumentPosition(screen.getByText('A4 Exercise Book'))
      & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(getLowStockProducts).not.toHaveBeenCalled();
  });

  it('shows the exact planned empty state when the API returns no rows', async () => {
    vi.mocked(getLowStockProducts).mockResolvedValue([]);
    renderPage();

    expect(await screen.findByText('No low-stock products right now.')).toBeInTheDocument();
  });

  it('links each row to the existing product view route', async () => {
    renderPage();
    await screen.findByText('A4 Exercise Book');

    for (const product of products) {
      expect(screen.getByRole('link', { name: new RegExp(product.name) }))
        .toHaveAttribute('href', `/products/${product.id}`);
    }
  });
});
