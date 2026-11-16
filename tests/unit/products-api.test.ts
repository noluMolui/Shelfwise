import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listProducts } from '../../src/lib/api/products';

const mocks = vi.hoisted(() => ({
  range: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('../../src/lib/supabase/client', () => ({
  getSupabaseClient: () => ({
    rpc: mocks.rpc,
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            range: (start: number, end: number) => {
              mocks.range(start, end);
              return Promise.resolve({
                data: Array.from({ length: end - start + 1 }, (_, index) => ({
                  id: `product-${start + index}`,
                  business_id: 'business-1',
                  name: `Product ${start + index}`,
                  sku: `SKU-${start + index}`,
                  category: 'General',
                  description: null,
                  unit_price: 1,
                  quantity: 0,
                  low_stock_threshold: null,
                  supplier_id: null,
                  is_archived: false,
                  created_at: '2026-01-01T00:00:00.000Z',
                  updated_at: '2026-01-01T00:00:00.000Z',
                })),
                error: null,
              });
            },
          }),
        }),
      }),
    }),
  }),
}));

describe('listProducts pagination', () => {
  beforeEach(() => {
    mocks.range.mockClear();
    mocks.rpc.mockReset();
  });

  it('requests exactly 20 products on the first page', async () => {
    const result = await listProducts({ page: 0, search: '', category: '' });

    expect(mocks.range).toHaveBeenCalledWith(0, 19);
    expect(result.products).toHaveLength(20);
    expect(result.hasMore).toBe(true);
  });

  it('requests the next non-overlapping 20-product page', async () => {
    await listProducts({ page: 1, search: '', category: '' });

    expect(mocks.range).toHaveBeenCalledWith(20, 39);
  });

  it('creates a product and passes opening stock to the transactional movement function', async () => {
    const { createProduct } = await import('../../src/lib/api/products');
    mocks.rpc.mockResolvedValue({ data: 'product-1', error: null });

    await createProduct({
      name: 'A4 Exercise Book',
      sku: 'ST001',
      category: 'Stationery',
      description: null,
      unit_price: 25,
      low_stock_threshold: null,
      supplier_id: null,
    }, 12);

    expect(mocks.rpc).toHaveBeenCalledWith('create_product_with_opening_stock', {
      p_name: 'A4 Exercise Book',
      p_sku: 'ST001',
      p_category: 'Stationery',
      p_description: null,
      p_unit_price: 25,
      p_low_stock_threshold: null,
      p_supplier_id: null,
      p_opening_stock_quantity: 12,
    });
  });
});
