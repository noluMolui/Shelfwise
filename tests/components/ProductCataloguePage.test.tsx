import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listProducts } from '../../src/lib/api/products';
import { ProductCataloguePage } from '../../src/pages/ProductCataloguePage';

const mocks = vi.hoisted(() => ({
  listProducts: vi.fn(),
  role: 'business_owner' as 'business_owner' | 'staff_member',
  online: true,
}));

vi.mock('../../src/lib/api/products', () => ({
  listProducts: mocks.listProducts,
}));

vi.mock('../../src/app/useCurrentProfile', () => ({
  useCurrentProfile: () => ({ data: { role: mocks.role } }),
}));

vi.mock('../../src/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => mocks.online,
}));

const products = [
  {
    id: 'product-1',
    business_id: 'business-1',
    name: 'Blue Ballpoint Pen',
    sku: 'ST002',
    category: 'Stationery' as const,
    description: null,
    unit_price: 8.5,
    quantity: 6,
    low_stock_threshold: 10,
    supplier_id: null,
    is_archived: false,
    created_at: '2026-11-10T10:00:00.000Z',
    updated_at: '2026-11-10T10:00:00.000Z',
  },
  {
    id: 'product-2',
    business_id: 'business-1',
    name: 'A4 Exercise Book',
    sku: 'ST001',
    category: 'Stationery' as const,
    description: null,
    unit_price: 25,
    quantity: 40,
    low_stock_threshold: 10,
    supplier_id: null,
    is_archived: false,
    created_at: '2026-11-10T10:00:00.000Z',
    updated_at: '2026-11-10T10:00:00.000Z',
  },
];

function renderPage(state?: { message?: string }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[{ pathname: '/products', state }]}>
        <ProductCataloguePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProductCataloguePage', () => {
  beforeEach(() => {
    mocks.role = 'business_owner';
    mocks.online = true;
    mocks.listProducts.mockReset().mockResolvedValue({ products, hasMore: false });
  });

  it('uses the designed catalogue layout with live product values and stock status', async () => {
    const { container } = renderPage();

    expect(await screen.findAllByText('Blue Ballpoint Pen')).not.toHaveLength(0);
    expect(screen.getAllByText('R8.50')).not.toHaveLength(0);
    expect(screen.getAllByText('Low stock')).not.toHaveLength(0);
    expect(container.querySelector('.product-catalogue')).toBeInTheDocument();
    expect(container.querySelector('.catalogue-product-cards')).toBeInTheDocument();
  });

  it('passes search and category filters to the product API', async () => {
    renderPage();

    const search = await screen.findByRole('searchbox', { name: /search by name or sku/i });
    fireEvent.change(search, { target: { value: 'st002' } });
    await waitFor(() => {
      expect(listProducts).toHaveBeenLastCalledWith({
        page: 0,
        search: 'st002',
        category: '',
      });
    });

    fireEvent.change(screen.getByRole('combobox', { name: /filter by category/i }), {
      target: { value: 'Stationery' },
    });
    await waitFor(() => {
      expect(listProducts).toHaveBeenLastCalledWith({
        page: 0,
        search: 'st002',
        category: 'Stationery',
      });
    });
  });

  it('shows the empty state and keeps the add-product route available', async () => {
    mocks.listProducts.mockResolvedValue({ products: [], hasMore: false });
    renderPage();

    expect(await screen.findByRole('heading', { name: 'No products yet.' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Add product' })).not.toHaveLength(0);
    for (const link of screen.getAllByRole('link', { name: 'Add product' })) {
      expect(link).toHaveAttribute('href', '/products/new');
    }
  });

  it('distinguishes no search matches from an empty catalogue', async () => {
    mocks.listProducts.mockResolvedValue({ products: [], hasMore: false });
    renderPage();
    fireEvent.change(await screen.findByRole('searchbox'), {
      target: { value: 'not found' },
    });

    expect(await screen.findByText('No products match your search.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'No products yet.' })).not.toBeInTheDocument();
  });

  it('shows a loading skeleton while the catalogue request is pending', () => {
    mocks.listProducts.mockReturnValue(new Promise(() => undefined));
    renderPage();

    expect(screen.getByRole('status', { name: 'Loading products' })).toBeInTheDocument();
  });

  it('shows a retry action when the catalogue request fails', async () => {
    mocks.listProducts.mockRejectedValueOnce(new Error('Request failed'));
    renderPage();

    expect(await screen.findByText('We couldn’t load your products. Please try again.'))
      .toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(mocks.listProducts).toHaveBeenCalledTimes(2));
  });

  it('shows the offline message with previously loaded products', async () => {
    mocks.online = false;
    renderPage();

    expect(await screen.findAllByText('Blue Ballpoint Pen')).not.toHaveLength(0);
    expect(screen.getByRole('status')).toHaveTextContent(
      'You’re offline. Showing previously loaded products where available.',
    );
  });

  it('shows and dismisses the save notification from the product form', async () => {
    renderPage({ message: 'Product saved.' });

    expect(await screen.findByRole('status')).toHaveTextContent('Product saved.');
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByText('Product saved.')).not.toBeInTheDocument();
  });

  it('shows owner actions and hides them for staff', async () => {
    const { unmount } = renderPage();

    expect(await screen.findAllByText('Blue Ballpoint Pen')).not.toHaveLength(0);
    for (const link of await screen.findAllByRole('link', { name: /add product/i })) {
      expect(link).toHaveAttribute('href', '/products/new');
    }
    for (const link of await screen.findAllByRole('link', { name: /edit blue ballpoint pen/i })) {
      expect(link).toHaveAttribute('href', '/products/product-1/edit');
    }

    unmount();
    mocks.role = 'staff_member';
    renderPage();

    expect(await screen.findAllByText('Blue Ballpoint Pen')).not.toHaveLength(0);
    for (const link of await screen.findAllByRole('link', { name: /view blue ballpoint pen/i })) {
      expect(link).toHaveAttribute('href', '/products/product-1');
    }
    expect(screen.queryByRole('link', { name: /add product/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /edit blue ballpoint pen/i })).not.toBeInTheDocument();
  });
});
