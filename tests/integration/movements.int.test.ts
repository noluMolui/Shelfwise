import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { recordStockMovement } from '../../src/lib/api/movements';
import type { MovementType } from '../../src/lib/database.types';
import { messages } from '../../src/lib/messages';
import { createTestBusiness } from './helpers/testBusiness';

describe('stock movement integration', () => {
  let testBusiness: Awaited<ReturnType<typeof createTestBusiness>> | undefined;

  beforeEach(async () => {
    testBusiness = await createTestBusiness();
  });

  afterEach(async () => {
    await testBusiness?.cleanup();
    testBusiness = undefined;
  });

  async function createProduct(openingStock = 0): Promise<string> {
    if (!testBusiness) throw new Error('Test business was not initialized.');
    const suffix = crypto.randomUUID().slice(0, 8);
    const { data, error } = await testBusiness.ownerClient
      .from('products')
      .insert({
        name: `Movement Test Product ${suffix}`,
        sku: `MOV-${suffix}`,
        category: 'General',
        unit_price: 10,
      })
      .select('id')
      .single();
    if (error) throw error;

    if (openingStock > 0) {
      const { error: movementError } = await testBusiness.ownerClient
        .from('stock_movements')
        .insert({
          product_id: data.id,
          movement_type: 'incoming',
          quantity: openingStock,
          note: 'Integration test setup',
        });
      if (movementError) throw movementError;
    }

    return data.id;
  }

  async function getQuantity(productId: string): Promise<number> {
    if (!testBusiness) throw new Error('Test business was not initialized.');
    const { data, error } = await testBusiness.ownerClient
      .from('products')
      .select('quantity')
      .eq('id', productId)
      .single();
    if (error) throw error;
    return data.quantity;
  }

  async function getMovementCount(productId: string): Promise<number> {
    if (!testBusiness) throw new Error('Test business was not initialized.');
    const { count, error } = await testBusiness.ownerClient
      .from('stock_movements')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', productId);
    if (error) throw error;
    return count ?? 0;
  }

  it('applies incoming and outgoing movements to product quantity', async () => {
    if (!testBusiness) throw new Error('Test business was not initialized.');
    const productId = await createProduct();

    await recordStockMovement({
      productId,
      movementType: 'incoming',
      quantity: 10,
      note: null,
    });
    expect(await getQuantity(productId)).toBe(10);

    await recordStockMovement({
      productId,
      movementType: 'outgoing',
      quantity: 4,
      note: null,
    });
    expect(await getQuantity(productId)).toBe(6);
    expect(await getMovementCount(productId)).toBe(2);
  });

  it.each([0, -1, 1.5])('rejects invalid database movement quantity %s', async (quantity) => {
    if (!testBusiness) throw new Error('Test business was not initialized.');
    const productId = await createProduct();
    const { error } = await testBusiness.ownerClient
      .from('stock_movements')
      .insert({
        product_id: productId,
        movement_type: 'incoming',
        quantity,
      });

    expect(error).not.toBeNull();
    expect(await getQuantity(productId)).toBe(0);
    expect(await getMovementCount(productId)).toBe(0);
  });

  it('maps fractional database quantities to the invalid-quantity message', async () => {
    const productId = await createProduct();

    await expect(recordStockMovement({
      productId,
      movementType: 'incoming',
      quantity: 1.5,
      note: null,
    })).rejects.toThrow(messages.invalidMovementQuantity);
  });

  it('rejects outgoing stock above availability without saving a movement', async () => {
    const productId = await createProduct(4);

    await expect(recordStockMovement({
      productId,
      movementType: 'outgoing',
      quantity: 5,
      note: null,
    })).rejects.toThrow(messages.insufficientStock);

    expect(await getQuantity(productId)).toBe(4);
    expect(await getMovementCount(productId)).toBe(1);
  });

  it('serializes competing outgoing movements so stock never becomes negative', async () => {
    if (!testBusiness) throw new Error('Test business was not initialized.');
    const productId = await createProduct(4);
    const independentClient = await testBusiness.createIndependentOwnerClient();
    const movement = {
      product_id: productId,
      movement_type: 'outgoing' as MovementType,
      quantity: 3,
      note: null,
    };

    const results = await Promise.all([
      testBusiness.ownerClient.from('stock_movements').insert(movement),
      independentClient.from('stock_movements').insert(movement),
    ]);

    expect(results.filter(({ error }) => !error)).toHaveLength(1);
    expect(results.some(({ error }) => error?.message.includes('insufficient_stock'))).toBe(true);
    expect(await getQuantity(productId)).toBe(1);
    expect(await getMovementCount(productId)).toBe(2);
  });
});
