import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recordStockMovement } from '../../src/lib/api/movements';
import { messages } from '../../src/lib/messages';

const mocks = vi.hoisted(() => ({
  insert: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
}));

vi.mock('../../src/lib/supabase/client', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      insert: mocks.insert,
    }),
  }),
}));

describe('recordStockMovement API errors', () => {
  beforeEach(() => {
    mocks.insert.mockReset().mockReturnValue({ select: mocks.select });
    mocks.select.mockReset().mockReturnValue({ single: mocks.single });
    mocks.single.mockReset();
  });

  it.each([
    ['23514', 'new row violates check constraint'],
    ['22P02', 'invalid input syntax for type integer'],
    ['22003', 'integer out of range'],
  ])('maps database quantity error %s to the invalid-quantity message', async (code, message) => {
    mocks.single.mockResolvedValue({
      data: null,
      error: { code, message },
    });

    await expect(recordStockMovement({
      productId: 'product-1',
      movementType: 'incoming',
      quantity: 1.5,
      note: null,
    })).rejects.toThrow(messages.invalidMovementQuantity);
  });

  it('keeps malformed product UUID errors generic', async () => {
    mocks.single.mockResolvedValue({
      data: null,
      error: {
        code: '22P02',
        message: 'invalid input syntax for type uuid: "not-a-uuid"',
      },
    });

    await expect(recordStockMovement({
      productId: 'not-a-uuid',
      movementType: 'incoming',
      quantity: 1,
      note: null,
    })).rejects.toThrow(messages.recordMovementError);
  });

  it('maps insufficient stock errors returned by the database', async () => {
    mocks.single.mockResolvedValue({
      data: null,
      error: { code: 'P0001', message: 'insufficient_stock' },
    });

    await expect(recordStockMovement({
      productId: 'product-1',
      movementType: 'outgoing',
      quantity: 3,
      note: null,
    })).rejects.toThrow(messages.insufficientStock);
  });
});
