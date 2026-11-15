import { describe, expect, it } from 'vitest';
import { formatZar } from '../../src/utils/format';

describe('formatZar', () => {
  it('formats ZAR values with two decimals and grouped thousands', () => {
    expect(formatZar(25)).toBe('R25.00');
    expect(formatZar(1720)).toBe('R1,720.00');
  });
});
