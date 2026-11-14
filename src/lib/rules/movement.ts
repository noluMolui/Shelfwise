import { messages } from '../messages';

export function validateMovementQuantity(quantity: string): string | null {
  const parsed = Number(quantity);
  if (
    quantity.trim() === '' ||
    !Number.isInteger(parsed) ||
    parsed <= 0 ||
    parsed > 2_147_483_647
  ) {
    return messages.invalidMovementQuantity;
  }
  return null;
}
