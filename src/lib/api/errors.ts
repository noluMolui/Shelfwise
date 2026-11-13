import { messages } from '../messages';

export class ProductAccessError extends Error {
  constructor() {
    super(messages.notAllowed);
    this.name = 'ProductAccessError';
  }
}

export function getProductSaveError(error: { code?: string; message?: string }): string {
  if (error.code === '23505') return messages.duplicateSku;
  if (error.code === '42501' || error.code === 'PGRST301') return messages.notAllowed;
  return messages.saveProductError;
}
