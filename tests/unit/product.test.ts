import { describe, expect, it } from 'vitest';
import { validateProduct, type ProductFormValues } from '../../src/lib/rules/product';
import { messages } from '../../src/lib/messages';

const validProduct: ProductFormValues = {
  name: 'A4 Exercise Book',
  sku: 'ST001',
  category: 'Stationery',
  description: '',
  unitPrice: '25.00',
  lowStockThreshold: '0',
  supplierId: '',
  openingQuantity: '0',
};

describe('validateProduct', () => {
  it('requires a product name, SKU, and category', () => {
    const errors = validateProduct({
      ...validProduct,
      name: ' ',
      sku: '',
      category: '',
    });

    expect(errors).toEqual({
      name: messages.required,
      sku: messages.required,
      category: messages.required,
    });
  });

  it('accepts a zero price and zero low-stock threshold', () => {
    expect(validateProduct({
      ...validProduct,
      unitPrice: '0',
      lowStockThreshold: '0',
    })).toEqual({});
  });

  it('rejects negative prices and fractional thresholds', () => {
    const errors = validateProduct({
      ...validProduct,
      unitPrice: '-0.01',
      lowStockThreshold: '2.5',
      openingQuantity: '2.5',
    });

    expect(errors.unitPrice).toBe(messages.invalidPrice);
    expect(errors.lowStockThreshold).toBe(messages.invalidThreshold);
    expect(errors.openingQuantity).toBe(messages.invalidOpeningQuantity);
  });

  it('accepts zero opening stock and rejects negative or out-of-range quantities', () => {
    expect(validateProduct({ ...validProduct, openingQuantity: '0' }).openingQuantity).toBeUndefined();
    expect(validateProduct({ ...validProduct, openingQuantity: '-1' }).openingQuantity)
      .toBe(messages.invalidOpeningQuantity);
    expect(validateProduct({ ...validProduct, openingQuantity: '2147483648' }).openingQuantity)
      .toBe(messages.invalidOpeningQuantity);
  });

  it('rejects prices beyond two decimals and thresholds outside the database integer range', () => {
    const errors = validateProduct({
      ...validProduct,
      unitPrice: '1.239',
      lowStockThreshold: '2147483648',
    });

    expect(errors.unitPrice).toBe(messages.invalidPrice);
    expect(errors.lowStockThreshold).toBe(messages.invalidThreshold);
  });

  it('rejects field values that exceed the database limits', () => {
    const errors = validateProduct({
      ...validProduct,
      name: 'n'.repeat(121),
      sku: 's'.repeat(61),
      description: 'd'.repeat(1001),
    });

    expect(errors.name).toBe('Use 120 characters or fewer.');
    expect(errors.sku).toBe('Use 60 characters or fewer.');
    expect(errors.description).toBe('Use 1,000 characters or fewer.');
  });
});
