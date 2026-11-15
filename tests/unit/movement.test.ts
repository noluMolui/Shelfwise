import { describe, expect, it } from 'vitest';
import { validateMovementQuantity } from '../../src/lib/rules/movement';
import { messages } from '../../src/lib/messages';

describe('validateMovementQuantity', () => {
  it('accepts positive whole quantities', () => {
    expect(validateMovementQuantity('1')).toBeNull();
    expect(validateMovementQuantity('25')).toBeNull();
  });

  it.each(['', '0', '-1', '1.5', 'not a number', '2147483648'])(
    'rejects invalid quantity %s',
    (quantity) => {
      expect(validateMovementQuantity(quantity)).toBe(messages.invalidMovementQuantity);
    },
  );
});
