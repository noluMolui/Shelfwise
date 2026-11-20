
import { describe, expect, it } from 'vitest';
import { getProductSaveError } from '../../src/lib/api/errors';
import { messages } from '../../src/lib/messages';

describe('Product error handling', () => {
  it('returns the duplicate SKU message for error 23505', () => {
    const result = getProductSaveError({
      code: '23505',
    });

    expect(result).toBe(messages.duplicateSku);
  });

  it('returns the permission message for error 42501', () => {
    const result = getProductSaveError({
      code: '42501',
    });

    expect(result).toBe(messages.notAllowed);
  });

  it('returns the permission message for error PGRST301', () => {
    const result = getProductSaveError({
      code: 'PGRST301',
    });

    expect(result).toBe(messages.notAllowed);
  });

  it('returns the general save error for unexpected errors', () => {
    const result = getProductSaveError({
      code: 'XX000',
    });

    expect(result).toBe(messages.saveProductError);
  });
});
