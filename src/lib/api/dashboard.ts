export type DashboardMovementType = 'incoming' | 'outgoing';

export type DashboardMovement = {
  created_at: string;
  product_name: string;
  movement_type: DashboardMovementType;
  quantity: number;
};

export type DashboardSummary = {
  total_products: number;
  inventory_value: number;
  low_stock_count: number;
  recent_movement_count: number;
  recent_movements: DashboardMovement[];
};

type DashboardRpcClient = {
  rpc: (name: 'get_dashboard_summary') => PromiseLike<{
    data: DashboardSummary | null;
    error: Error | null;
  }>;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const client = getSupabaseClient() as unknown as DashboardRpcClient;
  const { data, error } = await client.rpc('get_dashboard_summary');

  if (error) throw error;
  if (!data) throw new Error('Dashboard summary query returned no result.');
  return data;
}

import { getSupabaseClient } from '../supabase/client';
