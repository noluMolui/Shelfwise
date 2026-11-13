import type { Product, ProductCategory, ProductInput } from '../database.types';
import { getProductSaveError, ProductAccessError } from './errors';
import { getSupabaseClient } from '../supabase/client';

const pageSize = 20;

export type ProductPage = { products: Product[]; hasMore: boolean };
export type ProductListOptions = {
  page: number;
  search: string;
  category: string;
};

function escapeFilterValue(value: string): string {
  return value.replace(/[\\%_,()]/g, '\\$&');
}

async function attachSuppliers(products: Product[]): Promise<Product[]> {
  const supplierIds = [...new Set(
    products.flatMap((product) => product.supplier_id ? [product.supplier_id] : []),
  )];
  if (supplierIds.length === 0) {
    return products.map((product) => ({ ...product, supplier: null }));
  }

  const { data, error } = await getSupabaseClient()
    .from('suppliers')
    .select('id, name')
    .in('id', supplierIds);

  if (error) throw error;
  const suppliers = new Map((data ?? []).map((supplier) => [supplier.id, supplier]));
  return products.map((product) => ({
    ...product,
    supplier: product.supplier_id ? suppliers.get(product.supplier_id) ?? null : null,
  }));
}

async function attachSupplier(product: Product): Promise<Product> {
  const [withSupplier] = await attachSuppliers([product]);
  return withSupplier;
}

export async function listProducts(options: ProductListOptions): Promise<ProductPage> {
  const { page, search, category } = options;
  const safeSearch = escapeFilterValue(search.trim());
  let query = getSupabaseClient()
    .from('products')
    .select('*')
    .eq('is_archived', false)
    .order('name')
    .range(page * pageSize, (page + 1) * pageSize);

  if (category) query = query.eq('category', category as ProductCategory);
  if (safeSearch) {
    query = query.or(`name.ilike.%${safeSearch}%,sku.ilike.%${safeSearch}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  const products = await attachSuppliers(data);
  return { products, hasMore: data.length === pageSize };
}

export async function getProduct(id: string): Promise<Product> {
  const { data, error } = await getSupabaseClient()
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    if (error?.code === 'PGRST116' || error?.code === '42501') throw new ProductAccessError();
    throw error ?? new Error('Product query returned no result.');
  }

  return attachSupplier(data);
}

export async function saveProduct(
  values: ProductInput,
  productId?: string,
): Promise<Product> {
  const supabase = getSupabaseClient();
  const result = productId
    ? await supabase
        .from('products')
        .update(values)
        .eq('id', productId)
        .select('*')
        .single()
    : await supabase.from('products').insert(values).select('*').single();

  if (result.error) {
    const message = getProductSaveError(result.error);
    throw new Error(message);
  }
  return attachSupplier(result.data);
}
