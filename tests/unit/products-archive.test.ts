
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { archiveProduct } from '../../src/lib/api/products';
import { ProductAccessError } from '../../src/lib/api/errors';

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
}));

vi.mock('../../src/lib/supabase/client', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      update: mocks.update,
    }),
  }),
}));

describe('archiveProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.update.mockReturnValue({
      eq: mocks.eq,
    });

    mocks.eq.mockReturnValue({
      select: mocks.select,
    });

    mocks.select.mockReturnValue({
      single: mocks.single,
    });

    mocks.single.mockResolvedValue({
      data: { id: 'product-1' },
      error: null,
    });
  });

  it('archives a product without deleting it', async () => {
    await archiveProduct('product-1');

    expect(mocks.update).toHaveBeenCalledWith({
      is_archived: true,
    });

    expect(mocks.eq).toHaveBeenCalledWith('id', 'product-1');
    expect(mocks.select).toHaveBeenCalledWith('id');
  });

  it('rejects when the product is not found', async () => {
    mocks.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' },
    });

    await expect(
      archiveProduct('missing-product'),
    ).rejects.toBeInstanceOf(ProductAccessError);
  });

  it('rejects when the user does not have permission', async () => {
    mocks.single.mockResolvedValue({
      data: null,
      error: { code: '42501' },
    });

    await expect(
      archiveProduct('product-1'),
    ).rejects.toBeInstanceOf(ProductAccessError);
  });

  it('handles unexpected database errors', async () => {
    mocks.single.mockResolvedValue({
      data: null,
      error: { code: 'XX000' },
    });

    await expect(
      archiveProduct('product-1'),
    ).rejects.toThrow();
  });

  it('rejects when the database returns no product', async () => {
    mocks.single.mockResolvedValue({
      data: null,
      error: null,
    });

    await expect(
      archiveProduct('product-1'),
    ).rejects.toThrow('Could not archive this product.');
  });
});
