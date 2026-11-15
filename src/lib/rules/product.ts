import { productCategories, type ProductCategory } from '../database.types';
import { messages } from '../messages';

export type ProductFormValues = {
  name: string;
  sku: string;
  category: string;
  description: string;
  unitPrice: string;
  lowStockThreshold: string;
  supplierId: string;
};

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

export function validateProduct(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};
  const name = values.name.trim();
  const sku = values.sku.trim();

  if (!name) errors.name = messages.required;
  else if (name.length > 120) errors.name = 'Use 120 characters or fewer.';

  if (!sku) errors.sku = messages.required;
  else if (sku.length > 60) errors.sku = 'Use 60 characters or fewer.';

  if (!productCategories.includes(values.category as ProductCategory)) {
    errors.category = messages.required;
  }

  if (values.description.length > 1000) {
    errors.description = 'Use 1,000 characters or fewer.';
  }

  const price = Number(values.unitPrice);
  const cents = price * 100;
  if (
    values.unitPrice.trim() === '' ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 9_999_999_999.99 ||
    Math.abs(cents - Math.round(cents)) > 1e-8
  ) {
    errors.unitPrice = messages.invalidPrice;
  }

  if (values.lowStockThreshold.trim() !== '') {
    const threshold = Number(values.lowStockThreshold);
    if (!Number.isInteger(threshold) || threshold < 0 || threshold > 2_147_483_647) {
      errors.lowStockThreshold = messages.invalidThreshold;
    }
  }

  return errors;
}
