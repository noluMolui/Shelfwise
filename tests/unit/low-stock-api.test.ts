import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLowStockProducts } from '../../src/lib/api/lowStock';

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock('../../src/lib/supabase/client', () => ({
  getSupabaseClient: () => ({ rpc: mocks.rpc }),
}));

const products = [
  {
    id: 'product-1',
    name: 'A4 Exercise Book',
    sku: 'ST001',
    category: 'Stationery',
    quantity: 5,
    low_stock_threshold: 10,
  },
];

describe('getLowStockProducts API', () => {
  beforeEach(() => mocks.rpc.mockReset());

  it('calls the low-stock RPC and returns its typed rows', async () => {
    mocks.rpc.mockResolvedValue({ data: products, error: null });

    await expect(getLowStockProducts()).resolves.toEqual(products);
    expect(mocks.rpc).toHaveBeenCalledWith('get_low_stock_products');
  });

  it('returns an empty array when the RPC data is null or empty', async () => {
    mocks.rpc.mockResolvedValueOnce({ data: null, error: null });
    await expect(getLowStockProducts()).resolves.toEqual([]);

    mocks.rpc.mockResolvedValueOnce({ data: [], error: null });
    await expect(getLowStockProducts()).resolves.toEqual([]);
  });

  it('throws when the RPC returns an error', async () => {
    const error = new Error('RPC failed');
    mocks.rpc.mockResolvedValue({ data: null, error });

    await expect(getLowStockProducts()).rejects.toBe(error);
  });
});
