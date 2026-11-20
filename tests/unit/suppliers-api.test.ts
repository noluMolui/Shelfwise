
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  listSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  listSupplierOptions,
} from '../../src/lib/api/suppliers';

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  single: vi.fn(),
}));

const supplier = {
  id: 'supplier-1',
  business_id: 'business-1',
  name: 'ABC Suppliers',
  contact_person: 'John Smith',
  email: 'john@example.com',
  phone: '0123456789',
  created_at: '2026-01-01T00:00:00.000Z',
};

vi.mock('../../src/lib/supabase/client', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      select: mocks.select,
      insert: mocks.insert,
      update: mocks.update,
      delete: mocks.delete,
    }),
  }),
}));

describe('Suppliers API', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.select.mockReturnValue({
      order: mocks.order,
      eq: mocks.eq,
    });

    mocks.order.mockResolvedValue({
      data: [supplier],
      error: null,
    });

    mocks.eq.mockReturnValue({
      single: mocks.single,
    });

    mocks.single.mockResolvedValue({
      data: supplier,
      error: null,
    });

    mocks.insert.mockReturnValue({
      select: () => ({
        single: mocks.single,
      }),
    });

    mocks.update.mockReturnValue({
      eq: () => ({
        select: () => ({
          single: mocks.single,
        }),
      }),
    });

    mocks.delete.mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        error: null,
      }),
    });
  });

  it('lists all suppliers', async () => {
    const result = await listSuppliers();

    expect(result).toEqual([supplier]);
    expect(mocks.select).toHaveBeenCalledWith('*');
    expect(mocks.order).toHaveBeenCalledWith('name');
  });

  it('gets a supplier by ID', async () => {
    const result = await getSupplier('supplier-1');

    expect(result).toEqual(supplier);
  });

  it('creates a supplier', async () => {
    const values = {
      name: 'ABC Suppliers',
      contact_person: 'John Smith',
      email: 'john@example.com',
      phone: '0123456789',
    };

    const result = await createSupplier(values);

    expect(mocks.insert).toHaveBeenCalledWith(values);
    expect(result).toEqual(supplier);
  });

  it('updates a supplier', async () => {
    const values = {
      name: 'Updated Suppliers',
    };

    const result = await updateSupplier('supplier-1', values);

    expect(mocks.update).toHaveBeenCalledWith(values);
    expect(result).toEqual(supplier);
  });

  it('deletes a supplier', async () => {
    await expect(deleteSupplier('supplier-1')).resolves.toBeUndefined();
  });

  it('lists supplier options for product forms', async () => {
    const result = await listSupplierOptions();

    expect(mocks.select).toHaveBeenCalledWith('id, name');
    expect(result).toEqual([supplier]);
  });
});
