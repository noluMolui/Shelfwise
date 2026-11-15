import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductFormPage } from '../../src/pages/ProductFormPage';
import { getProduct, saveProduct } from '../../src/lib/api/products';
import { listSupplierOptions } from '../../src/lib/api/suppliers';
import type { Product } from '../../src/lib/database.types';
import { messages } from '../../src/lib/messages';

const onlineStatus = vi.hoisted(() => ({ online: true }));

vi.mock('../../src/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => onlineStatus.online,
}));

vi.mock('../../src/lib/api/products', () => ({
  getProduct: vi.fn(),
  saveProduct: vi.fn(),
}));

vi.mock('../../src/lib/api/suppliers', () => ({
  listSupplierOptions: vi.fn(),
}));

const product: Product = {
  id: 'product-1',
  business_id: 'business-1',
  name: 'Blue Ballpoint Pen',
  sku: 'ST002',
  category: 'Stationery',
  description: null,
  unit_price: 8.5,
  quantity: 6,
  low_stock_threshold: 10,
  supplier_id: 'supplier-1',
  is_archived: false,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  supplier: { id: 'supplier-1', name: 'Mzansi Stationers' },
};

function renderPage(path: string, mode: 'add' | 'edit' | 'view', preview = false) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/products/new" element={<ProductFormPage mode={mode} preview={preview} />} />
          <Route path="/products/:id" element={<ProductFormPage mode={mode} />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProductFormPage', () => {
  beforeEach(() => {
    onlineStatus.online = true;
    vi.mocked(getProduct).mockResolvedValue(product);
    vi.mocked(listSupplierOptions).mockResolvedValue([]);
  });

  it('keeps entered values and shows required-field errors on Add', async () => {
    renderPage('/products/new', 'add');
    fireEvent.change(screen.getByLabelText(/product name/i), {
      target: { value: 'New item' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findAllByText('This field is required.')).toHaveLength(2);
    expect(screen.getByLabelText(/product name/i)).toHaveValue('New item');
    expect(screen.queryByLabelText(/quantity/i)).not.toBeInTheDocument();
  });

  it('blocks offline saves and does not call the product API', async () => {
    onlineStatus.online = false;
    renderPage('/products/new', 'add');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(messages.offline);
    expect(saveProduct).not.toHaveBeenCalled();
  });

  it('shows sample S4 content in preview without querying or saving data', async () => {
    renderPage('/products/new', 'add', true);

    expect(screen.getByLabelText(/product name/i)).toHaveValue('A4 Exercise Book');
    expect(screen.getByLabelText(/supplier/i)).toHaveValue('preview-supplier');
    expect(screen.getByRole('note')).toHaveTextContent('Product changes will not be saved');
    expect(listSupplierOptions).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Changes will not be saved');
    expect(saveProduct).not.toHaveBeenCalled();
  });

  it('keeps the form open with the duplicate-SKU message', async () => {
    vi.mocked(saveProduct).mockRejectedValue(new Error(messages.duplicateSku));
    renderPage('/products/new', 'add');
    fireEvent.change(screen.getByLabelText(/product name/i), {
      target: { value: 'Blue Ballpoint Pen' },
    });
    fireEvent.change(screen.getByLabelText(/sku/i), {
      target: { value: 'ST002' },
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'Stationery' },
    });
    fireEvent.change(screen.getByLabelText(/unit price/i), {
      target: { value: '8.50' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(messages.duplicateSku);
    expect(screen.getByLabelText(/sku/i)).toHaveValue('ST002');
  });

  it('shows product details read-only and omits Save in View mode', async () => {
    renderPage('/products/product-1', 'view');

    await waitFor(() => {
      expect(screen.getByLabelText(/product name/i)).toHaveValue('Blue Ballpoint Pen');
    });
    expect(screen.getByLabelText(/product name/i)).toBeDisabled();
    expect(screen.getByLabelText(/supplier/i)).toHaveValue('supplier-1');
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
  });
});
