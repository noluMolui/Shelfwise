
import { getSupabaseClient } from '../supabase/client';
import type { Database } from '../database.types';

// Supplier database types
type SupplierRow =
  Database['public']['Tables']['suppliers']['Row'];

type SupplierInsert =
  Database['public']['Tables']['suppliers']['Insert'];

type SupplierUpdate =
  Database['public']['Tables']['suppliers']['Update'];

// Supplier option used in product forms
export type SupplierOption = {
  id: string;
  name: string;
};

// Fields users can enter when creating or editing suppliers
export type SupplierInput = Pick<
  SupplierInsert,
  'name' | 'contact_person' | 'email' | 'phone'
>;

// Get all supplier details
export async function listSuppliers(): Promise<SupplierRow[]> {
  const { data, error } = await getSupabaseClient()
    .from('suppliers')
    .select('*')
    .order('name');

  if (error) throw error;

  return data ?? [];
}

// Get supplier details by ID
export async function getSupplier(
  supplierId: string,
): Promise<SupplierRow> {
  const { data, error } = await getSupabaseClient()
    .from('suppliers')
    .select('*')
    .eq('id', supplierId)
    .single();

  if (error) throw error;

  return data;
}

// Create a supplier
export async function createSupplier(
  values: SupplierInput,
): Promise<SupplierRow> {
  const { data, error } = await getSupabaseClient()
    .from('suppliers')
    .insert(values)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// Update an existing supplier
export async function updateSupplier(
  supplierId: string,
  values: Partial<SupplierUpdate>,
): Promise<SupplierRow> {
  const { data, error } = await getSupabaseClient()
    .from('suppliers')
    .update(values)
    .eq('id', supplierId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// Delete a supplier
export async function deleteSupplier(
  supplierId: string,
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('suppliers')
    .delete()
    .eq('id', supplierId);

  if (error) throw error;
}

// Get supplier names for product forms
export async function listSupplierOptions(): Promise<SupplierOption[]> {
  const { data, error } = await getSupabaseClient()
    .from('suppliers')
    .select('id, name')
    .order('name');

  if (error) throw error;

  return data ?? [];
}
