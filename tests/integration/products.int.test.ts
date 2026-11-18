import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { listProducts } from '../../src/lib/api/products';
import { createTestBusiness } from './helpers/testBusiness';

describe('product catalogue integration', () => {
  let testBusiness: Awaited<ReturnType<typeof createTestBusiness>> | undefined;

  beforeEach(async () => {
    testBusiness = await createTestBusiness();
  });

  afterEach(async () => {
    await testBusiness?.cleanup();
    testBusiness = undefined;
  });

  it('searches by name or SKU, filters by category, and isolates businesses', async () => {
    if (!testBusiness) throw new Error('Test business was not initialized.');
    const suffix = crypto.randomUUID().slice(0, 8);
    const nameMatchSku = `SEARCH-${suffix}`;
    const skuMatchSku = `SKU-${suffix}`;

    const { data: nameMatch, error: nameError } = await testBusiness.ownerClient
      .from('products')
      .insert({
        name: `Search Marker ${suffix}`,
        sku: nameMatchSku,
        category: 'Stationery',
        unit_price: 10,
      })
      .select('id')
      .single();
    if (nameError) throw nameError;

    const { data: skuMatch, error: skuError } = await testBusiness.ownerClient
      .from('products')
      .insert({
        name: `Other Product ${suffix}`,
        sku: skuMatchSku,
        category: 'General',
        unit_price: 10,
      })
      .select('id')
      .single();
    if (skuError) throw skuError;

    const { data: otherBusiness, error: businessError } = await testBusiness.adminClient
      .from('businesses')
      .insert({ name: `Other Integration Business ${suffix}` })
      .select('id')
      .single();
    if (businessError) throw businessError;

    const { error: foreignProductError } = await testBusiness.adminClient
      .from('products')
      .insert({
        business_id: otherBusiness.id,
        name: `Search Marker ${suffix}`,
        sku: `FOREIGN-${suffix}`,
        category: 'Stationery',
        unit_price: 10,
      });
    if (foreignProductError) throw foreignProductError;

    const byNameAndCategory = await listProducts({
      page: 0,
      search: `Search Marker ${suffix}`,
      category: 'Stationery',
    });
    expect(byNameAndCategory.products.map(({ id }) => id)).toEqual([nameMatch.id]);

    const bySku = await listProducts({
      page: 0,
      search: skuMatchSku,
      category: '',
    });
    expect(bySku.products.map(({ id }) => id)).toEqual([skuMatch.id]);

    const byCategory = await listProducts({
      page: 0,
      search: '',
      category: 'General',
    });
    expect(byCategory.products.map(({ id }) => id)).toEqual([skuMatch.id]);
  });
});
