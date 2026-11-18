import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecordMovementPage } from '../../src/pages/RecordMovementPage';
import {
  listActiveProducts,
  recordStockMovement,
} from '../../src/lib/api/movements';
import { messages } from '../../src/lib/messages';

const onlineStatus = vi.hoisted(() => ({ online: true }));

vi.mock('../../src/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => onlineStatus.online,
}));

vi.mock('../../src/lib/api/movements', () => ({
  listStockMovements: vi.fn(),
  listActiveProducts: vi.fn(),
  recordStockMovement: vi.fn(),
}));

const activeProduct = {
  id: 'product-1',
  name: 'Blue Ballpoint Pen',
  sku: 'ST002',
  quantity: 6,
};

function renderPage({ preview = false }: { preview?: boolean } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/stock/new']}>
        <Routes>
          <Route path="/stock/new" element={<RecordMovementPage preview={preview} />} />
          <Route path="/stock" element={<p>Stock history</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('RecordMovementPage', () => {
  beforeEach(() => {
    onlineStatus.online = true;
    vi.mocked(listActiveProducts).mockResolvedValue([activeProduct]);
    vi.mocked(recordStockMovement).mockResolvedValue({
      id: 'movement-1',
      business_id: 'business-1',
      product_id: 'product-1',
      user_id: 'user-1',
      movement_type: 'incoming',
      quantity: 1,
      note: null,
      created_at: '2026-11-10T10:00:00.000Z',
    });
  });

  it('shows the current stock for the selected product', async () => {
    const { container } = renderPage();

    expect(await screen.findByText('6', { selector: 'output' })).toBeInTheDocument();
    expect(screen.getByLabelText(/product/i)).toHaveValue('product-1');
    expect(container.querySelector('.movement-page')).toBeInTheDocument();
    expect(container.querySelector('.movement-card')).toBeInTheDocument();
    expect(container.querySelector('.movement-stock')).toBeInTheDocument();
  });

  it('keeps entered values and rejects zero quantity before saving', async () => {
    renderPage();
    const quantity = await screen.findByLabelText(/quantity/i);
    fireEvent.change(quantity, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText(messages.invalidMovementQuantity)).toBeInTheDocument();
    expect(quantity).toHaveValue(0);
    expect(recordStockMovement).not.toHaveBeenCalled();
  });

  it('rejects outgoing stock above the selected product quantity', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Outgoing' }));
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: '7' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(messages.insufficientStock);
    expect(recordStockMovement).not.toHaveBeenCalled();
  });

  it('saves a movement and returns to stock history', async () => {
    renderPage();
    fireEvent.change(await screen.findByLabelText(/quantity/i), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Stock history')).toBeInTheDocument();
    expect(vi.mocked(recordStockMovement).mock.calls[0][0]).toEqual({
      productId: 'product-1',
      movementType: 'incoming',
      quantity: 2,
      note: null,
    });
  });

  it('uses sample products and never saves in preview mode', async () => {
    vi.mocked(listActiveProducts).mockClear();
    vi.mocked(recordStockMovement).mockClear();
    renderPage({ preview: true });

    expect(await screen.findByText('40', { selector: 'output' })).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(/preview only/i);
    expect(listActiveProducts).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/will not be saved/i);
    expect(recordStockMovement).not.toHaveBeenCalled();
  });
});
