import { getSupabaseClient } from '../supabase/client';
import type { ProductCategory } from '../database.types';

export type LowStockProduct = {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  quantity: number;
  low_stock_threshold: number | null;
};

type LowStockRpcClient = {
  rpc: (name: 'get_low_stock_products') => PromiseLike<{
    data: LowStockProduct[] | null;
    error: Error | null;
  }>;
};

export async function getLowStockProducts(): Promise<LowStockProduct[]> {
  const supabase = getSupabaseClient() as unknown as LowStockRpcClient;
  const { data, error } = await supabase.rpc('get_low_stock_products');

  if (error) throw error;
  return data ?? [];
}
