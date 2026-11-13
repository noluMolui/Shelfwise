import { getSupabaseClient } from '../supabase/client';

export type SupplierOption = { id: string; name: string };

export async function listSupplierOptions(): Promise<SupplierOption[]> {
  const { data, error } = await getSupabaseClient()
    .from('suppliers')
    .select('id, name')
    .order('name');

  if (error) throw error;
  return data;
}
